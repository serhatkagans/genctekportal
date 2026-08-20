"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  DURUM_ETIKETLERI,
  faaliyetEkle,
  faaliyetGuncelle,
  faaliyetSil,
  type FaaliyetGirdi,
  type YayinDurumu,
} from "@/lib/faaliyet/yonetim";

function tazele() {
  revalidatePath("/yonetim/etkinlikler");
  revalidatePath("/panel/faaliyetler");
}

function durumAl(deger: FormDataEntryValue | null): YayinDurumu {
  const metin = String(deger ?? "");
  return metin in DURUM_ETIKETLERI ? (metin as YayinDurumu) : "DRAFT";
}

function girdiAl(formData: FormData): FaaliyetGirdi {
  const al = (ad: string) => String(formData.get(ad) ?? "");
  return {
    title: al("title"),
    slug: al("slug"),
    summary: al("summary"),
    aciklama: al("aciklama"),
    eventType: al("eventType"),
    status: durumAl(formData.get("status")),
    startsAt: al("startsAt"),
    endsAt: al("endsAt"),
    venue: al("venue"),
    onlineUrl: al("onlineUrl"),
    registrationUrl: al("registrationUrl"),
    capacity: al("capacity"),
    provinceCode: al("provinceCode"),
    organizerName: al("organizerName"),
    organizerUnit: al("organizerUnit"),
  };
}

export async function etkinlikOlusturAction(formData: FormData) {
  const girdi = girdiAl(formData);
  if (!girdi.title.trim() || !girdi.startsAt.trim()) return;
  const yeni = await faaliyetEkle(girdi);
  tazele();
  redirect(`/yonetim/etkinlikler/${yeni.id}?kaydedildi=1`);
}

export async function etkinlikKaydetAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const girdi = girdiAl(formData);
  if (!id || !girdi.title.trim() || !girdi.startsAt.trim()) return;
  await faaliyetGuncelle(id, girdi);
  tazele();
  redirect(`/yonetim/etkinlikler/${id}?kaydedildi=1`);
}

export async function etkinlikSilAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await faaliyetSil(id);
  tazele();
  redirect("/yonetim/etkinlikler?silindi=1");
}
