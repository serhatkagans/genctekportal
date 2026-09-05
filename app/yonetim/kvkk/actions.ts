"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import { kvkkMetniniYaz } from "@/lib/sayfa-metni";

/**
 * KVKK aydınlatma metninin kaydı.
 *
 * Bölümler tek bir gizli alanda JSON olarak geliyor; bozuk JSON metni
 * boşaltmasın diye ayrıştırma korumalı — hatada hiçbir şey yazılmadan
 * dönülüyor (alt bilgi eyleminde alınan karar). İçerik ayrıca
 * kvkkMetniniCoz süzgecinden geçiyor (bkz. lib/sayfa-metni.ts).
 */
export async function kvkkKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;

  let bolumler: unknown = [];
  try {
    bolumler = JSON.parse(String(formData.get("bolumler") ?? "[]"));
  } catch {
    return;
  }

  await kvkkMetniniYaz({
    ustEtiket: String(formData.get("ustEtiket") ?? ""),
    baslik: String(formData.get("baslik") ?? ""),
    spot: String(formData.get("spot") ?? ""),
    seoBaslik: String(formData.get("seoBaslik") ?? ""),
    seoAciklama: String(formData.get("seoAciklama") ?? ""),
    bolumler: bolumler as never,
  });

  revalidatePath("/kvkk");
  revalidatePath("/yonetim/kvkk");
  redirect("/yonetim/kvkk?kaydedildi=1");
}
