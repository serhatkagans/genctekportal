"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import {
  yardimlasmaGrubuEkle, yardimlasmaGrubuGuncelle, yardimlasmaGrubuSil,
  yardimlasmaGrubunuIdIleBul, yardimlasmaSirasiniTasi, type YardimlasmaGirdi,
} from "@/lib/yardimlasma";
import { yonlendirmeEkle } from "@/lib/yonlendirme";

/* Gruplar Çalışma Grupları sayfasının altında listeleniyor; düzenleme sonrası
   hem o sayfa hem grubun kendi adresi tazeleniyor. */
function tazele(slug?: string) {
  revalidatePath("/yonetim/yardimlasma");
  revalidatePath("/temalar");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/yardimlasma/${slug}`);
}

function girdiAl(formData: FormData): YardimlasmaGirdi {
  return {
    slug: String(formData.get("slug") ?? ""),
    ad: String(formData.get("ad") ?? ""),
    gorsel: String(formData.get("gorsel") ?? ""),
    metin: String(formData.get("metin") ?? ""),
    yayinda: formData.get("yayinda") === "on",
  };
}

export async function yardimlasmaOlusturAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const girdi = girdiAl(formData);
  if (!girdi.ad.trim()) return;
  const yeni = await yardimlasmaGrubuEkle(girdi);
  tazele(yeni.slug);
  redirect(`/yonetim/yardimlasma/${yeni.id}?kaydedildi=1`);
}

export async function yardimlasmaKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const girdi = girdiAl(formData);
  if (!id || !girdi.ad.trim()) return;

  const onceki = await yardimlasmaGrubunuIdIleBul(id);
  const guncel = await yardimlasmaGrubuGuncelle(id, girdi);

  // Adres değiştiyse eskisine 301: paylaşılmış bağlantılar 404'e düşmesin
  // (Hakkında sayfalarındaki aynı karar).
  if (onceki && onceki.slug !== guncel.slug) {
    await yonlendirmeEkle(`/yardimlasma/${onceki.slug}`, `/yardimlasma/${guncel.slug}`, 301);
    tazele(onceki.slug);
  }

  tazele(guncel.slug);
  redirect(`/yonetim/yardimlasma/${guncel.id}?kaydedildi=1`);
}

export async function yardimlasmaSilAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const grup = await yardimlasmaGrubunuIdIleBul(id);
  await yardimlasmaGrubuSil(id);
  tazele(grup?.slug);
  redirect("/yonetim/yardimlasma?silindi=1");
}

export async function yardimlasmaTasiAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const yon = formData.get("yon") === "yukari" ? "yukari" : "asagi";
  if (!id) return;
  await yardimlasmaSirasiniTasi(id, yon);
  tazele();
  redirect("/yonetim/yardimlasma");
}
