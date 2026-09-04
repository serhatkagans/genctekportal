"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import { menuyuCoz, menuyuYaz } from "@/lib/menu";

/**
 * Menünün kaydı.
 *
 * TAZELEME BÜTÜN SİTE (`"layout"`): menü her sayfanın üstünde duruyor,
 * yalnızca bu ekranı tazelemek değişikliği kaydeden kişinin siteyi eski
 * hâliyle görmesi demekti — alt bilgi ve genel ayarlardaki aynı karar.
 */
export async function menuKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;

  // Öğeler tek bir gizli alanda JSON olarak geliyor; bozuk JSON menüyü
  // boşaltmasın diye ayrıştırma korumalı ve içerik ayrıca menuyuCoz
  // süzgecinden geçiyor.
  let ogeler: unknown = [];
  try {
    ogeler = JSON.parse(String(formData.get("ogeler") ?? "[]"));
  } catch {
    return;
  }

  await menuyuYaz(menuyuCoz({ ogeler, girisEtiketi: String(formData.get("girisEtiketi") ?? "") }));

  revalidatePath("/", "layout");
  revalidatePath("/yonetim/menu");
  redirect("/yonetim/menu?kaydedildi=1");
}
