"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formAyarlariniKaydet } from "@/lib/forms/basvuru";
import { erisimLogla } from "@/lib/yetki/log";
import { basvuruYetkisi } from "@/app/yonetim/basvurular/actions";

const DURUMLAR = ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"];

export async function formKaydetAction(formData: FormData) {
  const { kullanici, yazabilir } = await basvuruYetkisi();
  if (!yazabilir) return;

  const formId = String(formData.get("formId") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  if (!formId || !versionId) return;

  const durum = String(formData.get("status") ?? "");
  const saklama = Number(formData.get("retentionDays") ?? 0);

  await formAyarlariniKaydet({
    formId,
    versionId,
    name: String(formData.get("name") ?? ""),
    status: DURUMLAR.includes(durum) ? durum : "DRAFT",
    // KVKK: süresiz saklama olmaz, en az 30 gün en fazla 10 yıl.
    retentionDays: Number.isFinite(saklama) ? Math.min(3650, Math.max(30, Math.floor(saklama))) : 730,
    opensAt: String(formData.get("opensAt") ?? ""),
    closesAt: String(formData.get("closesAt") ?? ""),
    consentText: String(formData.get("consentText") ?? ""),
    consentVersion: String(formData.get("consentVersion") ?? ""),
  });

  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "FORM_AYAR",
    hedefTip: "FORM",
    hedefId: formId,
    detay: "Katılım formu ayarları güncellendi",
  });

  revalidatePath("/yonetim/formlar");
  redirect("/yonetim/formlar?kaydedildi=1");
}
