"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { haberEkle, haberGuncelle, haberSil, type HaberGirdi } from "@/lib/haber";

function tazele(slug?: string) {
  revalidatePath("/yonetim/icerik");
  revalidatePath("/haberler");
  revalidatePath("/");
  if (slug) revalidatePath(`/haberler/${slug}`);
}

function girdiAl(formData: FormData): HaberGirdi {
  const bicim = formData.get("bicim") === "duz" ? "duz" : "html";
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    bicim,
    icerik: String(formData.get("icerik") ?? ""),
    featuredImage: String(formData.get("featuredImage") ?? ""),
    date: String(formData.get("date") ?? ""),
  };
}

export async function kaydetAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const girdi = girdiAl(formData);
  if (!Number.isFinite(id) || !girdi.title.trim()) return;
  const guncel = await haberGuncelle(id, girdi);
  tazele(guncel.slug);
  redirect(`/yonetim/icerik/${guncel.id}?kaydedildi=1`);
}

export async function olusturAction(formData: FormData) {
  const girdi = girdiAl(formData);
  if (!girdi.title.trim()) return;
  const yeni = await haberEkle(girdi);
  tazele(yeni.slug);
  redirect(`/yonetim/icerik/${yeni.id}?kaydedildi=1`);
}

export async function silAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await haberSil(id);
  tazele();
  redirect("/yonetim/icerik?silindi=1");
}
