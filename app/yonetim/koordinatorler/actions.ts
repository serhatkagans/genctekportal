"use server";
import { revalidatePath } from "next/cache";
import { koordinatorEkle, koordinatorGuncelle, koordinatorSil } from "@/lib/koordinator";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";

/*
 * YETKİ KONTROLÜ EYLEMİN KENDİSİNDE OLMAK ZORUNDA (1 Eylül 2026 · sızma testi
 * öncesi denetim).
 *
 * Bu üç eylem hiçbir kontrol yapmıyordu. app/yonetim/layout.tsx yalnızca
 * SAYFANIN görüntülenmesini oturuma bağlar; sunucu eylemi ayrı bir POST ucudur
 * ve layout'tan geçmez. Eylem kimliğini ele geçiren kimliksiz biri il
 * koordinatörü ekleyebilir, adını/görselini değiştirebilir ya da silebilirdi —
 * üstelik liste herkese açık /hakkinda/il-koordinatorleri sayfasında basılıyor,
 * yani sonuç doğrudan sitede görünürdü.
 *
 * Diğer içerik eylemleri (tema, haber, etkinlik, yönlendirme) 27 Ağustos 2026
 * denetiminde bu guard'a bağlanmıştı; koordinatörler atlanmış.
 */

function tazele() {
  revalidatePath("/yonetim/koordinatorler");
  revalidatePath("/hakkinda/il-koordinatorleri");
}

function girdiAl(formData: FormData) {
  return {
    ad: String(formData.get("ad") ?? ""),
    il: String(formData.get("il") ?? ""),
    rol: String(formData.get("rol") ?? ""),
    gorsel: String(formData.get("gorsel") ?? ""),
  };
}

export async function ekleAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const girdi = girdiAl(formData);
  if (!girdi.il.trim()) return;
  await koordinatorEkle(girdi);
  tazele();
}

export async function guncelleAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const girdi = girdiAl(formData);
  if (!id || !girdi.il.trim()) return;
  await koordinatorGuncelle(id, girdi);
  tazele();
}

export async function silAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await koordinatorSil(id);
  tazele();
}
