"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import { zirveGovdesiniCoz } from "@/lib/zirve-govde";
import {
  zirveEkle, zirveGuncelle, zirveSil, zirveSirasiniTasi, zirveyiIdIleBul,
  type ZirveGirdi,
} from "@/lib/zirve";
import { yonlendirmeEkle } from "@/lib/yonlendirme";

/*
 * Zirve bağlantıları ÜST MENÜDE ve "GençTek Zirvesi" temel etkinlik sayfasında
 * da basılıyor; düzenleme sonrası tazelenmesi gerekenler bunlar. Kalan ekranlar
 * force-dynamic olduğu için zaten her istekte yeniden üretiliyor.
 */
function tazele(yol?: string) {
  revalidatePath("/yonetim/zirveler");
  revalidatePath("/");
  revalidatePath("/hakkinda/temel-etkinlikler");
  revalidatePath("/hakkinda/temel-etkinlikler/genctek-zirvesi");
  revalidatePath("/sitemap.xml");
  if (yol) revalidatePath(yol);
}

function girdiAl(formData: FormData): ZirveGirdi {
  // Tekrarlı alanlar (vurgular, bölümler, fotoğraflar, video) tek bir gizli
  // alanda JSON olarak geliyor; bozuk JSON sayfayı çökertmesin diye korumalı
  // ayrıştırılıyor ve içerik ayrıca zirveGovdesiniCoz süzgecinden geçiyor.
  let ham: unknown = {};
  try {
    ham = JSON.parse(String(formData.get("govde") ?? "{}"));
  } catch {
    ham = {};
  }
  const yil = String(formData.get("yil") ?? "");
  return {
    slug: String(formData.get("slug") ?? ""),
    ad: String(formData.get("ad") ?? ""),
    yil,
    tarihYer: String(formData.get("tarihYer") ?? ""),
    ozet: String(formData.get("ozet") ?? ""),
    yol: String(formData.get("yol") ?? ""),
    govde: zirveGovdesiniCoz({
      ...(ham as Record<string, unknown>),
      yil,
      metin: String(formData.get("metin") ?? ""),
    }),
    yayinda: formData.get("yayinda") === "on",
  };
}

export async function zirveOlusturAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const girdi = girdiAl(formData);
  if (!girdi.ad.trim()) return;
  const yeni = await zirveEkle(girdi);
  tazele(yeni.yol);
  redirect(`/yonetim/zirveler/${yeni.id}?kaydedildi=1`);
}

export async function zirveKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const girdi = girdiAl(formData);
  if (!id || !girdi.ad.trim()) return;

  const onceki = await zirveyiIdIleBul(id);
  const guncel = await zirveGuncelle(id, girdi);

  /*
   * Adres değiştiyse eskisine 301 açılıyor: zirve sayfaları yıllarca paylaşılan
   * bağlantılar, sessizce 404'e düşmemeli. Tarihsel adresli iki zirvenin yolu
   * zaten satırda sabit duruyor, orada bu dal hiç çalışmaz.
   */
  if (onceki && onceki.yol !== guncel.yol) {
    await yonlendirmeEkle(onceki.yol, guncel.yol, 301);
    tazele(onceki.yol);
  }

  tazele(guncel.yol);
  redirect(`/yonetim/zirveler/${guncel.id}?kaydedildi=1`);
}

export async function zirveSilAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const zirve = await zirveyiIdIleBul(id);
  await zirveSil(id);
  tazele(zirve?.yol);
  redirect("/yonetim/zirveler?silindi=1");
}

export async function zirveTasiAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const yon = formData.get("yon") === "yukari" ? "yukari" : "asagi";
  if (!id) return;
  await zirveSirasiniTasi(id, yon);
  tazele();
  redirect("/yonetim/zirveler");
}
