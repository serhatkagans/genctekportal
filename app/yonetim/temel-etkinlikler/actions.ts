"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import {
  etkinlikEkle, etkinlikGuncelle, etkinlikSil, etkinlikSirasiniTasi,
  etkinligiIdIleBul, type EtkinlikGirdi,
} from "@/lib/temel-etkinlik";
import { yonlendirmeEkle } from "@/lib/yonlendirme";

function tazele(slug?: string) {
  revalidatePath("/yonetim/temel-etkinlikler");
  revalidatePath("/hakkinda/temel-etkinlikler");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/hakkinda/temel-etkinlikler/${slug}`);
}

function girdiAl(formData: FormData): EtkinlikGirdi {
  // Galeri tek bir gizli alanda JSON olarak geliyor; bozuk JSON kaydı
  // boşaltmasın diye ayrıştırma korumalı ve içerik ayrıca süzgeçten geçiyor.
  let gorseller: unknown = [];
  try {
    gorseller = JSON.parse(String(formData.get("gorseller") ?? "[]"));
  } catch {
    gorseller = [];
  }
  return {
    slug: String(formData.get("slug") ?? ""),
    ad: String(formData.get("ad") ?? ""),
    liste: String(formData.get("liste") ?? "temel"),
    aciklama: String(formData.get("aciklama") ?? ""),
    gorseller,
    yayinda: formData.get("yayinda") === "on",
  };
}

export async function etkinlikOlusturAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const girdi = girdiAl(formData);
  if (!girdi.ad.trim()) return;
  const yeni = await etkinlikEkle(girdi);
  tazele(yeni.slug);
  redirect(`/yonetim/temel-etkinlikler/${yeni.id}?kaydedildi=1`);
}

export async function etkinlikKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const girdi = girdiAl(formData);
  if (!id || !girdi.ad.trim()) return;

  const onceki = await etkinligiIdIleBul(id);
  const guncel = await etkinlikGuncelle(id, girdi);

  // Adres değiştiyse eskisine 301: program sayfaları dışarıda paylaşılıyor.
  if (onceki && onceki.slug !== guncel.slug) {
    await yonlendirmeEkle(
      `/hakkinda/temel-etkinlikler/${onceki.slug}`,
      `/hakkinda/temel-etkinlikler/${guncel.slug}`,
      301,
    );
    tazele(onceki.slug);
  }

  tazele(guncel.slug);
  redirect(`/yonetim/temel-etkinlikler/${guncel.id}?kaydedildi=1`);
}

export async function etkinlikSilAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const kayit = await etkinligiIdIleBul(id);
  await etkinlikSil(id);
  tazele(kayit?.slug);
  redirect("/yonetim/temel-etkinlikler?silindi=1");
}

export async function etkinlikTasiAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const yon = formData.get("yon") === "yukari" ? "yukari" : "asagi";
  if (!id) return;
  await etkinlikSirasiniTasi(id, yon);
  tazele();
  redirect("/yonetim/temel-etkinlikler");
}
