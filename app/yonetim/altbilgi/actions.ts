"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import { altbilgiyiCoz, altbilgiyiYaz } from "@/lib/altbilgi";
import { ayarlariOkuSessiz, ayarlariYaz } from "@/lib/yonetim/ayar";

/**
 * Alt bilginin kaydı.
 *
 * TAZELEME BÜTÜN SİTE (`"layout"`): alt bilgi her sayfanın altında duruyor,
 * yalnızca bu ekranı tazelemek değişikliği kaydeden kişinin siteyi eski
 * hâliyle görmesi demekti — genel ayarlardaki aynı karar.
 *
 * E-POSTA AYRI YERE YAZILIYOR: alan bu formda ama değeri GlobalSetting
 * tutuyor (bkz. lib/altbilgi.ts). Aynı bilgiyi iki tabloda tutmak, birinin
 * eskimesi demekti.
 */
export async function altbilgiKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;

  // Markalar ve bağlantılar tek bir gizli alanda JSON olarak geliyor; bozuk
  // JSON alt bilgiyi boşaltmasın diye ayrıştırma korumalı ve içerik ayrıca
  // altbilgiyiCoz süzgecinden geçiyor.
  let ham: unknown = {};
  try {
    ham = JSON.parse(String(formData.get("govde") ?? "{}"));
  } catch {
    return;
  }
  await altbilgiyiYaz(altbilgiyiCoz(ham));

  const eposta = String(formData.get("eposta") ?? "").trim();
  if (eposta) {
    const mevcut = await ayarlariOkuSessiz();
    if (mevcut["iletisim.eposta"] !== eposta) {
      await ayarlariYaz({ ...mevcut, "iletisim.eposta": eposta });
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/yonetim/altbilgi");
  redirect("/yonetim/altbilgi?kaydedildi=1");
}
