"use server";
import { revalidatePath } from "next/cache";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { erisimLogla } from "@/lib/yetki/log";
import { AYAR_TANIMLARI, ayarlariYaz } from "@/lib/yonetim/ayar";

/**
 * Genel ayarların kaydı.
 *
 * YETKİ SUNUCUDA: ayarlar sitenin her sayfasının başlığını ve alt bilgisini
 * değiştiriyor; ekranı gizlemek yetmez, form doğrudan da gönderilebilir.
 *
 * DEĞİŞMEYEN ALAN YAZILMAZ (bkz. lib/yonetim/ayar.ts): her kaydetmede dört
 * satırı birden güncellemek, denetim kaydını "hiçbir şey değişmedi"
 * satırlarıyla doldururdu.
 *
 * TAZELEME GENİŞ: başlık ve açıklama bütün sayfaların metadata'sına, iletişim
 * bilgisi de alt bilgiye giriyor. Yalnızca ayar sayfasını tazelemek,
 * değişikliği kaydeden kişinin siteyi eski hâliyle görmesi demekti.
 */
export async function ayarlariKaydetAction(formData: FormData) {
  const kullanici = await oturumKullanicisiZorunlu();
  if (!kullanici.roller.includes("SYSTEM_ADMIN")) return;

  const yeni: Record<string, string> = {};
  for (const tanim of AYAR_TANIMLARI) {
    yeni[tanim.anahtar] = String(formData.get(tanim.anahtar) ?? "");
  }

  const degisenler = await ayarlariYaz(yeni);
  if (degisenler.length === 0) return;

  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "AYAR_GUNCELLENDI",
    hedefTip: "AYAR",
    hedefId: degisenler.join(","),
    detay: `${degisenler.length} ayar güncellendi: ${degisenler.join(", ")}`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/yonetim/ayarlar");
  revalidatePath("/yonetim/denetim");
}
