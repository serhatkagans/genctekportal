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

  const sonuc = await girisYap({ eposta, parola, userAgent, ipOzeti });
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
