"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import {
  bloklariCoz,
  hakkindaSayfasiEkle,
  hakkindaSayfasiGuncelle,
  hakkindaSayfasiSil,
  hakkindaSayfasiniIdIleBul,
  hakkindaSirasiniTasi,
  type HakkindaGirdi,
} from "@/lib/hakkinda";
import { yonlendirmeEkle } from "@/lib/yonlendirme";

/*
 * Hakkında kartları ÜST MENÜDE ve ANA SAYFADA basıldığı için tazeleme geniş:
 * yalnız sayfanın kendisi değil, menüyü taşıyan bütün ekranlar eskir. Menü her
 * sayfada olduğundan tek tek saymak yerine düzenleme sonrası ana sayfa, liste
 * ve ilgili adresler tazeleniyor; kalanlar force-dynamic olduğu için zaten her
 * istekte yeniden üretiliyor.
 */
function tazele(slug?: string) {
  revalidatePath("/yonetim/hakkinda");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/hakkinda/${slug}`);
}

function girdiAl(formData: FormData): HakkindaGirdi {
  // Gövde tek bir gizli alanda JSON olarak geliyor (bkz. hakkinda-editoru.tsx).
  // Bozuk JSON sayfayı çökertmesin diye ayrıştırma korumalı; içeriği yazma
  // yolunda ayrıca bloklariCoz süzgecinden geçiyor.
  let bloklar: unknown = [];
  try {
    bloklar = JSON.parse(String(formData.get("bloklar") ?? "[]"));
  } catch {
    bloklar = [];
  }
  return {
    slug: String(formData.get("slug") ?? ""),
    baslik: String(formData.get("baslik") ?? ""),
    sayfaBasligi: String(formData.get("sayfaBasligi") ?? ""),
    ozet: String(formData.get("ozet") ?? ""),
    ikon: String(formData.get("ikon") ?? "badge"),
    adres: String(formData.get("adres") ?? ""),
    ustEtiket: String(formData.get("ustEtiket") ?? ""),
    spot: String(formData.get("spot") ?? ""),
    duzen: String(formData.get("duzen") ?? "tek"),
    seoBaslik: String(formData.get("seoBaslik") ?? ""),
    seoAciklama: String(formData.get("seoAciklama") ?? ""),
    bloklar: bloklariCoz(bloklar),
    yayinda: formData.get("yayinda") === "on",
  };
}

export async function hakkindaOlusturAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const girdi = girdiAl(formData);
  if (!girdi.baslik.trim()) return;
  const yeni = await hakkindaSayfasiEkle(girdi);
  tazele(yeni.slug);
  redirect(`/yonetim/hakkinda/${yeni.id}?kaydedildi=1`);
}

export async function hakkindaKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const girdi = girdiAl(formData);
  if (!id || !girdi.baslik.trim()) return;

  const onceki = await hakkindaSayfasiniIdIleBul(id);
  const guncel = await hakkindaSayfasiGuncelle(id, girdi);

  /*
   * SLUG DEĞİŞTİYSE ESKİ ADRESE YÖNLENDİRME (301) AÇILIYOR. Paylaşılmış
   * bağlantılar ve arama motoru kayıtları sessizce 404'e düşmesin diye; aynı
   * karar `/il-koordinatorleri` taşınırken de verilmişti, orada next.config.ts
   * içinde elle yazılıydı. Panelden yapılan değişikliğin elle yönlendirme
   * yazılmasını beklemesi, unutulacak bir adım olurdu.
   */
  if (onceki && onceki.slug !== guncel.slug) {
    await yonlendirmeEkle(`/hakkinda/${onceki.slug}`, `/hakkinda/${guncel.slug}`, 301);
    tazele(onceki.slug);
  }

  tazele(guncel.slug);
  redirect(`/yonetim/hakkinda/${guncel.id}?kaydedildi=1`);
}

export async function hakkindaSilAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sayfa = await hakkindaSayfasiniIdIleBul(id);
  await hakkindaSayfasiSil(id);
  tazele(sayfa?.slug);
  redirect("/yonetim/hakkinda?silindi=1");
}

export async function hakkindaTasiAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const id = String(formData.get("id") ?? "");
  const yon = formData.get("yon") === "yukari" ? "yukari" : "asagi";
  if (!id) return;
  await hakkindaSirasiniTasi(id, yon);
  tazele();
  redirect("/yonetim/hakkinda");
}
