"use server";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { temaEkle, temaGuncelle, temaSil, type TemaGirdi } from "@/lib/tema";

function tazele(slug?: string) {
  revalidatePath("/yonetim/temalar");
  revalidatePath("/temalar");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/temalar/${slug}`);
}

function girdiAl(formData: FormData): TemaGirdi {
  return {
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    image: String(formData.get("image") ?? ""),
    focus: String(formData.get("focus") ?? ""),
    outcomes: String(formData.get("outcomes") ?? ""),
  };
}

export async function temaKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const mevcutSlug = String(formData.get("mevcutSlug") ?? "");
  const girdi = girdiAl(formData);
  if (!mevcutSlug || !girdi.name.trim()) return;
  const guncel = await temaGuncelle(mevcutSlug, girdi);
  // Slug değiştiyse eski adres de tazelenmeli, aksi halde 404 önbellekte kalır.
  tazele(mevcutSlug);
  tazele(guncel.slug);
  redirect(`/yonetim/temalar/${guncel.slug}?kaydedildi=1`);
}

export async function temaOlusturAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const girdi = girdiAl(formData);
  if (!girdi.name.trim()) return;
  const yeni = await temaEkle(girdi);
  tazele(yeni.slug);
  redirect(`/yonetim/temalar/${yeni.slug}?kaydedildi=1`);
}

export async function temaSilAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await temaSil(slug);
  tazele(slug);
  redirect("/yonetim/temalar?silindi=1");
}
