import { randomUUID } from "node:crypto";
import { sql } from "./db";
import etkinlikYedegi from "@/data-ornek/temel-etkinlikler.json";
import { zirveOzetMetni, zirveleriOku } from "@/lib/zirve";
import {
  etkinlikGovdesiniCoz,
  type EtkinlikListesi,
  type TemelEtkinlik,
} from "./temel-etkinlik-govde";

/**
 * TEMEL GENÇTEK ETKİNLİK PROGRAMLARI.
 *
 * Liste PLATFORMDAKİ referans tablosuyla aynı (gençtek uygulaması ·
 * temel_etkinlik_programi): etkinlik açan kişi adı bu listeden seçiyor.
 * Portalda ayrı bir liste tutmak, iki adın zamanla ayrışması demekti — **bir
 * programın adını değiştirirken ya da yenisini eklerken platform tarafı da
 * güncellenmeli.** Panelde bu uyarı ekranda yazılı.
 *
 * Açıklamalar 27 Ağustos 2026'da YEĞİTEK'in kendi metinleriyle güncellendi.
 *
 * SAYFA DOSYASINDAN LİSTEYE (31 Ağustos 2026 · istek: "temel etkinlik kartları
 * tıklanabilir değil, önceden her birinin kendi sayfası ve geniş içeriği
 * vardı"): kayıtlar iki yerde basılıyor — liste ekranındaki kartlar ve
 * `/hakkinda/temel-etkinlikler/<slug>` detay sayfaları.
 *
 * LİSTEDEN VERİTABANINA (4 Eylül 2026 · istek: "temel etkinlik düzelt ekle de
 * yapalım panelde"). On dokuz kayıt kodda sabit duruyordu; artık "Page"
 * tablosunda (section = 'temel-etkinlik' ve 'grup-etkinligi') ve panelden
 * yönetiliyor. `slug` ADRESİN KENDİSİ olduğu için addan türetilmiyor, elle
 * verilebiliyor: bir başlık düzeltmesi paylaşılmış bağlantıları kırmasın.
 */
export type { TemelEtkinlik, EtkinlikGorseli, EtkinlikListesi, EtkinlikGovdesi } from "./temel-etkinlik-govde";
export { aciklamaParcalari, aciklamaOzeti, guvenliEtkinlikAdresi, etkinlikGovdesiniCoz } from "./temel-etkinlik-govde";

const BOLUMLER: Record<EtkinlikListesi, string> = {
  temel: "temel-etkinlik",
  grup: "grup-etkinligi",
};

type Satir = { id: string; slug: string; title: string; section: string; blocks: unknown; status: string };

const alanlar = () => sql`id, slug, title, section, blocks, status`;

function satirdanEtkinlik(satir: Satir): TemelEtkinlik {
  const govde = etkinlikGovdesiniCoz(satir.blocks);
  return {
    id: satir.id,
    slug: satir.slug,
    ad: satir.title,
    liste: satir.section === BOLUMLER.grup ? "grup" : "temel",
    aciklama: govde.aciklama,
    gorseller: govde.gorseller,
    yayinda: satir.status === "PUBLISHED",
  };
}

function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

type YedekKaydi = { liste: string; slug: string; ad: string; aciklama?: string; gorseller?: unknown };

/* Bağlantı düşerse kamu sayfası hata ekranına dönmesin: son sağlam anlık
   görüntü data-ornek/temel-etkinlikler.json'da. */
const YEDEK_ETKINLIKLER: TemelEtkinlik[] = (etkinlikYedegi as YedekKaydi[]).map((kayit) => ({
  id: kayit.slug,
  slug: kayit.slug,
  ad: kayit.ad,
  liste: kayit.liste === "grup" ? "grup" : "temel",
  ...etkinlikGovdesiniCoz(kayit),
  yayinda: true,
}));

/*
 * ZİRVE KAYDI OKUMA ANINDA DOLUYOR.
 *
 * "GençTek Zirvesi" programının metni ve fotoğrafları zirve sayfalarıyla aynı
 * kaynaktan gelmeli — ikisi ayrı yazılsaydı biri güncellenir, öbürü eskirdi.
 * Bu yüzden bu kaydın açıklaması ve galerisi panelden DEĞİL, Zirveler
 * ekranından yönetiliyor; editör de bunu ekranda söylüyor.
 */
export const ZIRVE_KAYDI = "genctek-zirvesi";

async function zirveKaydiniDoldur(kayit: TemelEtkinlik): Promise<TemelEtkinlik> {
  const zirveler = await zirveleriOku();
  const guncel = zirveler[0];
  return {
    ...kayit,
    aciklama: await zirveOzetMetni(),
    // Kartın kapağı kaydın kendi karesi; ardından en güncel zirvenin galerisi.
    gorseller: [
      ...kayit.gorseller,
      ...(guncel?.gorseller ?? []).map((gorsel) => ({ ...gorsel, alt: `${guncel.ad} · ${gorsel.alt}` })),
    ],
  };
}

async function zenginlestir(kayitlar: TemelEtkinlik[]) {
  return Promise.all(kayitlar.map((k) => (k.slug === ZIRVE_KAYDI ? zirveKaydiniDoldur(k) : k)));
}

/* ---------------------------------------------------------------- okuma --- */

export async function etkinlikleriOku(liste?: EtkinlikListesi, taslaklarDahil = false): Promise<TemelEtkinlik[]> {
  try {
    const bolumKosulu = liste
      ? sql`section = ${BOLUMLER[liste]}`
      : sql`section IN (${BOLUMLER.temel}, ${BOLUMLER.grup})`;
    const durumKosulu = taslaklarDahil ? sql`` : sql`AND status = 'PUBLISHED'`;
    const satirlar = await sql<Satir[]>`
      SELECT ${alanlar()} FROM "Page"
      WHERE ${bolumKosulu} ${durumKosulu}
      ORDER BY section, "order", "createdAt"
    `;
    return satirlar.map(satirdanEtkinlik);
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return YEDEK_ETKINLIKLER.filter((kayit) => !liste || kayit.liste === liste);
  }
}

/** Liste ekranının kaynağı: zirve kaydı doldurulmuş hâliyle. */
export async function temelEtkinlikleriOku(): Promise<TemelEtkinlik[]> {
  return zenginlestir(await etkinlikleriOku("temel"));
}

/** Adresten kayda: bulunamazsa sayfa 404 verir. */
export async function temelEtkinlikBul(slug: string): Promise<TemelEtkinlik | undefined> {
  let kayit: TemelEtkinlik | undefined;
  try {
    const [satir] = await sql<Satir[]>`
      SELECT ${alanlar()} FROM "Page"
      WHERE section IN (${BOLUMLER.temel}, ${BOLUMLER.grup}) AND slug = ${slug}
      LIMIT 1
    `;
    kayit = satir ? satirdanEtkinlik(satir) : undefined;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    kayit = YEDEK_ETKINLIKLER.find((k) => k.slug === slug);
  }
  if (!kayit) return undefined;
  return kayit.slug === ZIRVE_KAYDI ? zirveKaydiniDoldur(kayit) : kayit;
}

export async function etkinligiIdIleBul(id: string): Promise<TemelEtkinlik | undefined> {
  const [satir] = await sql<Satir[]>`
    SELECT ${alanlar()} FROM "Page"
    WHERE section IN (${BOLUMLER.temel}, ${BOLUMLER.grup}) AND id = ${id}
    LIMIT 1
  `;
  return satir ? satirdanEtkinlik(satir) : undefined;
}

/** Detay sayfalarının adres listesi (site haritası için). */
export async function temelEtkinlikSluglari(): Promise<string[]> {
  return (await etkinlikleriOku()).map((kayit) => kayit.slug);
}

/*
 * ÖNCEKİ/SONRAKİ ETKİNLİK (1 Eylül 2026 · istek: "buraya da önceki sonraki
 * etkinlik ekleyelim haberlerdeki gibi").
 *
 * Komşuluk kaydın KENDİ LİSTESİ içinde kalıyor: temel etkinliklerin sonundan
 * çalışma grubu etkinliklerine geçmek, iki ayrı başlık altında listelenen
 * programları tek sıraymış gibi gösterirdi. Liste başında/sonunda o yön boş
 * bırakılıyor — döngü, okuyucuya nerede olduğunu unutturur.
 */
export async function temelEtkinlikKomsulari(slug: string) {
  const hepsi = await etkinlikleriOku();
  const kayit = hepsi.find((k) => k.slug === slug);
  if (!kayit) return { onceki: undefined, sonraki: undefined };
  const liste = hepsi.filter((k) => k.liste === kayit.liste);
  const sira = liste.findIndex((k) => k.slug === slug);
  return { onceki: liste[sira - 1], sonraki: liste[sira + 1] };
}

/* ---------------------------------------------------------------- yazma --- */

export type EtkinlikGirdi = {
  slug: string;
  ad: string;
  liste: string;
  aciklama: string;
  gorseller: unknown;
  yayinda: boolean;
};

function sluglastir(deger: string) {
  const harita: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u" };
  return deger
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (h) => harita[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function benzersizSlug(istenen: string, haricId?: string, mevcutSlug?: string) {
  const temel = sluglastir(istenen) || "etkinlik";
  const dolular = await sql<{ slug: string }[]>`
    SELECT slug FROM "Page"
    WHERE (slug = ${temel} OR slug LIKE ${temel + "-%"})
      AND id <> ${haricId ?? ""}
  `;
  const alinmis = new Set(dolular.map((s) => s.slug));
  if (mevcutSlug) alinmis.delete(mevcutSlug);
  let aday = temel;
  let sayac = 2;
  while (alinmis.has(aday)) aday = `${temel}-${sayac++}`;
  return aday;
}

function girdiCoz(girdi: EtkinlikGirdi) {
  return {
    ad: girdi.ad.trim(),
    bolum: girdi.liste === "grup" ? BOLUMLER.grup : BOLUMLER.temel,
    govde: etkinlikGovdesiniCoz({ aciklama: girdi.aciklama, gorseller: girdi.gorseller }),
    yayinda: girdi.yayinda,
  };
}

export async function etkinlikEkle(girdi: EtkinlikGirdi): Promise<TemelEtkinlik> {
  const slug = await benzersizSlug(girdi.slug || girdi.ad);
  const v = girdiCoz(girdi);
  const id = randomUUID();
  await sql`
    INSERT INTO "Page" (id, section, slug, title, blocks, status, "order", "publishedAt", "updatedAt")
    VALUES (
      ${id}, ${v.bolum}, ${slug}, ${v.ad}, ${sql.json(v.govde)},
      ${v.yayinda ? "PUBLISHED" : "DRAFT"},
      (SELECT COALESCE(MAX("order"), -1) + 1 FROM "Page" WHERE section = ${v.bolum}),
      ${v.yayinda ? sql`CURRENT_TIMESTAMP` : sql`NULL`}, CURRENT_TIMESTAMP
    )
  `;
  return (await etkinligiIdIleBul(id))!;
}

export async function etkinlikGuncelle(id: string, girdi: EtkinlikGirdi): Promise<TemelEtkinlik> {
  const [mevcut] = await sql<{ slug: string }[]>`SELECT slug FROM "Page" WHERE id = ${id} LIMIT 1`;
  const slug = await benzersizSlug(girdi.slug || girdi.ad, id, mevcut?.slug);
  const v = girdiCoz(girdi);
  const [satir] = await sql<{ id: string }[]>`
    UPDATE "Page" SET
      slug = ${slug},
      title = ${v.ad},
      section = ${v.bolum},
      blocks = ${sql.json(v.govde)},
      status = ${v.yayinda ? "PUBLISHED" : "DRAFT"},
      "publishedAt" = COALESCE("publishedAt", ${v.yayinda ? sql`CURRENT_TIMESTAMP` : sql`NULL`}),
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id} AND section IN (${BOLUMLER.temel}, ${BOLUMLER.grup})
    RETURNING id
  `;
  if (!satir) throw new Error(`Etkinlik bulunamadı: ${id}`);
  return (await etkinligiIdIleBul(id))!;
}

export async function etkinlikSil(id: string) {
  await sql`DELETE FROM "Page" WHERE id = ${id} AND section IN (${BOLUMLER.temel}, ${BOLUMLER.grup})`;
}

/* Sıra takası kaydın kendi listesi içinde: iki liste ayrı sıralanıyor. */
export async function etkinlikSirasiniTasi(id: string, yon: "yukari" | "asagi") {
  const [kayit] = await sql<{ section: string }[]>`SELECT section FROM "Page" WHERE id = ${id} LIMIT 1`;
  if (!kayit) return;
  const kayitlar = await sql<{ id: string }[]>`
    SELECT id FROM "Page" WHERE section = ${kayit.section} ORDER BY "order", "createdAt"
  `;
  const sira = kayitlar.findIndex((k) => k.id === id);
  if (sira < 0) return;
  const hedef = yon === "yukari" ? sira - 1 : sira + 1;
  if (hedef < 0 || hedef >= kayitlar.length) return;
  await sql.begin((tx) => [
    tx`UPDATE "Page" SET "order" = ${hedef}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${kayitlar[sira].id}`,
    tx`UPDATE "Page" SET "order" = ${sira}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${kayitlar[hedef].id}`,
  ]);
}
