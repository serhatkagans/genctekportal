"use server";
import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cikisYap, girisYap } from "@/lib/auth/giris";
import { checkRateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { sessionCookie } from "@/lib/security/session";

// Ham IP saklanmıyor; oran sınırı ve denetim kaydı için özeti yeterli.
function ipOzetiCikar(ip: string | null) {
  return ip ? createHash("sha256").update(ip, "utf8").digest("hex").slice(0, 32) : null;
}

// returnTo yalnızca site içi tek bir yol olabilir; "//host" ve şemalı adresler
// açık yönlendirmeye (open redirect) yol açardı.
function guvenliHedef(ham: string) {
  return /^\/(?!\/)[\w\-./[\]]*$/.test(ham) ? ham : "/yonetim";
}

export async function girisAction(_oncekiDurum: string | undefined, formData: FormData) {
  const eposta = String(formData.get("email") ?? "");
  const parola = String(formData.get("password") ?? "");
  const hedef = guvenliHedef(String(formData.get("returnTo") ?? "/yonetim"));

  const basliklar = await headers();
  const ip = basliklar.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ipOzeti = ipOzetiCikar(ip);
  const userAgent = basliklar.get("user-agent");

  // Hem hesap hem kaynak bazlı sınır: tek hesabı deneme ve dağıtık deneme ayrı sayılır.
  const anahtar = `giris:${ipOzeti ?? "bilinmeyen"}:${eposta.toLocaleLowerCase("tr-TR")}`;
  const sinir = checkRateLimit(anahtar);
  if (!sinir.allowed) {
    const dakika = Math.ceil((sinir.retryAfterMs ?? 0) / 60000);
    return `Çok fazla deneme yapıldı. ${dakika} dakika sonra tekrar deneyin.`;
  }

  /*
   * VERİTABANI KAPALIYSA 500 DEĞİL, AÇIK BİR MESAJ (20 Ağustos 2026).
   *
   * `girisYap` doğrudan SQL çalıştırıyor. Postgres kapalıyken (geliştirme
   * makinesinde çoğu zaman öyle) sorgu ECONNREFUSED ile düşüyor, sunucu eylemi
   * hatayı yukarı fırlatıyor ve kullanıcı "Bir şeyler yolunda gitmedi" diyen
   * genel hata sayfasını görüyordu. Ne olduğunu söylemeyen bu ekran, kişiyi
   * parolasını yanlış girdiğini sanarak tekrar tekrar denemeye itiyor.
   *
   * Mesaj AYRIŞTIRILIYOR: yanlış parola "E-posta veya parola hatalı" der ve
   * öyle kalmalı (hesap sayımını engeller). Bağlantı hatası ise kişinin
   * bilgileriyle ilgili değil, sistemle ilgili — onu gizlemenin bir güvenlik
   * karşılığı yok, gizlemenin bedeli ise boşuna denemek.
   *
   * Hata sunucu günlüğüne yazılıyor: kullanıcıya kısa cümle yeter, arızayı
   * çözecek kişiye yığın izi gerek.
   */
  let sonuc;
  try {
    sonuc = await girisYap({ eposta, parola, userAgent, ipOzeti });
  } catch (hata) {
    console.error("[giris] veritabanina ulasilamadi", hata);
    return "Veritabanına ulaşılamıyor; giriş şu an yapılamıyor. Sistem yöneticisiyle görüşün.";
  }
  if (!sonuc.tamam) return sonuc.hata;

  resetRateLimit(anahtar);
  const depo = await cookies();
  depo.set(sessionCookie.name, sonuc.jeton, sessionCookie.options);
  redirect(hedef);
}

export async function cikisAction() {
  const depo = await cookies();
  const jeton = depo.get(sessionCookie.name)?.value;
  if (jeton) await cikisYap(jeton);
  depo.delete(sessionCookie.name);
  redirect("/giris");
}
