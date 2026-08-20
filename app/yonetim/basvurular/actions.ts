"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { DURUM_ETIKETLERI, basvuruBul, durumDegistir, notEkle, type BasvuruDurumu } from "@/lib/forms/basvuru";
import { erisimLogla } from "@/lib/yetki/log";

// Başvurular kişisel veri; yalnızca bu roller görebilir.
const YETKILI_ROLLER = ["SYSTEM_ADMIN", "FORM_REVIEWER", "AUDITOR"] as const;

export async function basvuruYetkisi() {
  const kullanici = await oturumKullanicisiZorunlu();
  const yetkili = kullanici.roller.some((rol) => (YETKILI_ROLLER as readonly string[]).includes(rol));
  // AUDITOR yalnızca okuyabilir; açma ve durum değiştirme onun işi değil.
  const yazabilir = kullanici.roller.some((rol) => rol === "SYSTEM_ADMIN" || rol === "FORM_REVIEWER");
  return { kullanici, yetkili, yazabilir };
}

export async function durumAction(formData: FormData) {
  const { kullanici, yazabilir } = await basvuruYetkisi();
  if (!yazabilir) return;

  const referans = String(formData.get("referans") ?? "");
  const durum = String(formData.get("durum") ?? "");
  if (!(durum in DURUM_ETIKETLERI)) return;

  const basvuru = await basvuruBul(referans);
  if (!basvuru) return;

  await durumDegistir(basvuru.id, durum as BasvuruDurumu);
  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "BASVURU_DURUM",
    hedefTip: "BASVURU",
    hedefId: basvuru.id,
    detay: `${referans} durumu ${DURUM_ETIKETLERI[durum as BasvuruDurumu]} yapıldı`,
  });
  revalidatePath("/yonetim/basvurular");
  redirect(`/yonetim/basvurular/${referans}`);
}

export async function notAction(formData: FormData) {
  const { kullanici, yazabilir } = await basvuruYetkisi();
  if (!yazabilir) return;

  const referans = String(formData.get("referans") ?? "");
  const govde = String(formData.get("not") ?? "").trim();
  if (!govde) return;

  const basvuru = await basvuruBul(referans);
  if (!basvuru) return;

  await notEkle(basvuru.id, kullanici.id, govde.slice(0, 2000));
  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "BASVURU_NOT",
    hedefTip: "BASVURU",
    hedefId: basvuru.id,
    detay: `${referans} kaydına not eklendi`,
  });
  redirect(`/yonetim/basvurular/${referans}`);
}

// Maskeyi kaldırmak ayrı bir eylem: her açma denetim kaydına yazılır.
export async function acAction(formData: FormData) {
  const { kullanici, yazabilir } = await basvuruYetkisi();
  const referans = String(formData.get("referans") ?? "");
  if (!yazabilir) redirect(`/yonetim/basvurular/${referans}`);

  const basvuru = await basvuruBul(referans);
  if (!basvuru) return;

  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "BASVURU_ACMA",
    hedefTip: "BASVURU",
    hedefId: basvuru.id,
    detay: `${referans} iletişim bilgileri açıldı`,
  });
  redirect(`/yonetim/basvurular/${referans}?ac=1`);
}
