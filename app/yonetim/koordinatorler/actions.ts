"use server";
import { revalidatePath } from "next/cache";
import { koordinatorEkle, koordinatorGuncelle, koordinatorSil } from "@/lib/koordinator";

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
  const girdi = girdiAl(formData);
  if (!girdi.il.trim()) return;
  await koordinatorEkle(girdi);
  tazele();
}

export async function guncelleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const girdi = girdiAl(formData);
  if (!id || !girdi.il.trim()) return;
  await koordinatorGuncelle(id, girdi);
  tazele();
}

export async function silAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await koordinatorSil(id);
  tazele();
}
