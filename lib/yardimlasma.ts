import { randomUUID } from "node:crypto";
import { sql } from "./db";
import yardimlasmaYedegi from "@/data-ornek/yardimlasma.json";
import { yardimlasmaGovdesiniCoz, type YardimlasmaGrubu } from "./yardimlasma-govde";

/**
 * YARDIMLAŞMA GRUPLARI (1 Eylül 2026 · istek: "yardımlaşma grupları
 * başlığında olsun … meb robot yarışması, teknofest, tübitak, oyun tasarımı
 * şeklinde 4 bölüm. yazıları sonra gelecek").
 *
 * Çalışma gruplarından ayrı bir liste: onlar bir üretim alanını (yapay zekâ,
 * robotik…) anlatıyor, bunlar belirli bir yarışma/etkinlik çevresinde
 * yardımlaşan grupları.
 *
 * SABİT DİZİDEN VERİTABANINA (4 Eylül 2026 · istek: "üstteki temalar
 * düzenlenip yeni tema eklenebiliyor ama alttaki yardımlaşma gruplarını
 * düzenleyemiyor yenisini ekleyemiyorum panelde"). Dört başlık kodda yazılıydı
 * ve tanıtım metinleri "sonra gelecek" diye boş bırakılmıştı; metin geldiğinde
 * kod değişikliği gerekiyordu. Artık "Page" tablosunda (section =
 * 'yardimlasma') ve panelden yönetiliyorlar — çalışma gruplarının yanındaki
 * liste de nihayet onlarla aynı şekilde düzenleniyor.
 */
export type { YardimlasmaGrubu, YardimlasmaGovdesi } from "./yardimlasma-govde";
export { guvenliYardimlasmaAdresi, yardimlasmaGovdesiniCoz, yardimlasmaParagraflari } from "./yardimlasma-govde";

type Satir = { id: string; slug: string; title: string; blocks: unknown; status: string };

const alanlar = () => sql`id, slug, title, blocks, status`;

function satirdanGrup(satir: Satir): YardimlasmaGrubu {
  const govde = yardimlasmaGovdesiniCoz(satir.blocks);
  return {
    id: satir.id,
    slug: satir.slug,
    ad: satir.title,
    gorsel: govde.gorsel,
    metin: govde.metin,
    yayinda: satir.status === "PUBLISHED",
  };
}

/* Bağlantı düştüğünde kamu sayfası hata ekranına dönmesin: son sağlam anlık
   görüntü data-ornek/yardimlasma.json'da. Şema ve sorgu hataları gizlenmiyor. */
function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

type YedekKaydi = { slug: string; ad: string; gorsel: string; metin?: string };

const YEDEK_GRUPLAR: YardimlasmaGrubu[] = (yardimlasmaYedegi as YedekKaydi[]).map((kayit) => ({
  id: kayit.slug,
  slug: kayit.slug,
  ad: kayit.ad,
  ...yardimlasmaGovdesiniCoz(kayit),
  yayinda: true,
}));

/** Sıra "order" sütununda; kart numaraları (01, 02, …) buradan geliyor. */
export async function yardimlasmaGruplariniOku(taslaklarDahil = false): Promise<YardimlasmaGrubu[]> {
  try {
    const durumKosulu = taslaklarDahil ? sql`` : sql`AND status = 'PUBLISHED'`;
    const satirlar = await sql<Satir[]>`
      SELECT ${alanlar()} FROM "Page"
      WHERE section = 'yardimlasma' ${durumKosulu}
      ORDER BY "order", "createdAt"
    `;
    return satirlar.map(satirdanGrup);
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return YEDEK_GRUPLAR;
  }
}

export async function yardimlasmaGrubuBul(slug: string): Promise<YardimlasmaGrubu | undefined> {
  try {
    const [satir] = await sql<Satir[]>`
      SELECT ${alanlar()} FROM "Page"
      WHERE section = 'yardimlasma' AND slug = ${slug}
      LIMIT 1
    `;
    return satir ? satirdanGrup(satir) : undefined;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return YEDEK_GRUPLAR.find((grup) => grup.slug === slug);
  }
}

export async function yardimlasmaGrubunuIdIleBul(id: string): Promise<YardimlasmaGrubu | undefined> {
  const [satir] = await sql<Satir[]>`
    SELECT ${alanlar()} FROM "Page"
    WHERE section = 'yardimlasma' AND id = ${id}
    LIMIT 1
  `;
  return satir ? satirdanGrup(satir) : undefined;
}

/* ---------------------------------------------------------------- yazma --- */

export type YardimlasmaGirdi = {
  slug: string;
  ad: string;
  gorsel: string;
  metin: string;
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
  const temel = sluglastir(istenen) || "grup";
  const dolular = await sql<{ slug: string }[]>`
    SELECT slug FROM "Page"
    WHERE (slug = ${temel} OR slug LIKE ${temel + "-%"})
      AND id <> ${haricId ?? ""}
  `;
  const alinmis = new Set(dolular.map((s) => s.slug));
  // Kaydın kendi adı çakışma sayılmaz; yoksa her kaydedişte sonuna sayı eklenir.
  if (mevcutSlug) alinmis.delete(mevcutSlug);
  let aday = temel;
  let sayac = 2;
  while (alinmis.has(aday)) aday = `${temel}-${sayac++}`;
  return aday;
}

function girdiCoz(girdi: YardimlasmaGirdi) {
  return {
    ad: girdi.ad.trim(),
    govde: yardimlasmaGovdesiniCoz({ gorsel: girdi.gorsel, metin: girdi.metin }),
    yayinda: girdi.yayinda,
  };
}

export async function yardimlasmaGrubuEkle(girdi: YardimlasmaGirdi): Promise<YardimlasmaGrubu> {
  const slug = await benzersizSlug(girdi.slug || girdi.ad);
  const v = girdiCoz(girdi);
  const id = randomUUID();
  await sql`
    INSERT INTO "Page" (id, section, slug, title, blocks, status, "order", "publishedAt", "updatedAt")
    VALUES (
      ${id}, 'yardimlasma', ${slug}, ${v.ad}, ${sql.json(v.govde)},
      ${v.yayinda ? "PUBLISHED" : "DRAFT"},
      (SELECT COALESCE(MAX("order"), -1) + 1 FROM "Page" WHERE section = 'yardimlasma'),
      ${v.yayinda ? sql`CURRENT_TIMESTAMP` : sql`NULL`}, CURRENT_TIMESTAMP
    )
  `;
  return (await yardimlasmaGrubunuIdIleBul(id))!;
}

export async function yardimlasmaGrubuGuncelle(id: string, girdi: YardimlasmaGirdi): Promise<YardimlasmaGrubu> {
  const [mevcut] = await sql<{ slug: string }[]>`SELECT slug FROM "Page" WHERE id = ${id} LIMIT 1`;
  const slug = await benzersizSlug(girdi.slug || girdi.ad, id, mevcut?.slug);
  const v = girdiCoz(girdi);
  const [satir] = await sql<{ id: string }[]>`
    UPDATE "Page" SET
      slug = ${slug},
      title = ${v.ad},
      blocks = ${sql.json(v.govde)},
      status = ${v.yayinda ? "PUBLISHED" : "DRAFT"},
      "publishedAt" = COALESCE("publishedAt", ${v.yayinda ? sql`CURRENT_TIMESTAMP` : sql`NULL`}),
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id} AND section = 'yardimlasma'
    RETURNING id
  `;
  if (!satir) throw new Error(`Yardımlaşma grubu bulunamadı: ${id}`);
  return (await yardimlasmaGrubunuIdIleBul(id))!;
}

export async function yardimlasmaGrubuSil(id: string) {
  await sql`DELETE FROM "Page" WHERE id = ${id} AND section = 'yardimlasma'`;
}

/* Sıra takası: bkz. lib/hakkinda.ts'teki aynı işlev. */
export async function yardimlasmaSirasiniTasi(id: string, yon: "yukari" | "asagi") {
  const gruplar = await sql<{ id: string }[]>`
    SELECT id FROM "Page" WHERE section = 'yardimlasma' ORDER BY "order", "createdAt"
  `;
  const sira = gruplar.findIndex((g) => g.id === id);
  if (sira < 0) return;
  const hedef = yon === "yukari" ? sira - 1 : sira + 1;
  if (hedef < 0 || hedef >= gruplar.length) return;
  await sql.begin((tx) => [
    tx`UPDATE "Page" SET "order" = ${hedef}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${gruplar[sira].id}`,
    tx`UPDATE "Page" SET "order" = ${sira}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${gruplar[hedef].id}`,
  ]);
}
