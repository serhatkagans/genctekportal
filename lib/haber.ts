import { randomUUID } from "node:crypto";
import sanitizeHtml from "sanitize-html";
import { sql } from "@/lib/db";
import { govdeHtmlUret, type HaberBicimi } from "@/lib/haber-bicim";
import type { WordPressContent } from "@/lib/wordpress-content";
import haberYedegi from "@/data-ornek/haberler.json";

// Haberler önce lib/generated/wordpress-posts.json'daydı, panelden düzenlenebilmesi
// için data/haberler.json'a taşındı; 3 Eylül 2026'da "Article" tablosuna geçti.
// Dışa açılan fonksiyonların imzaları dosya sürümüyle aynı: haber detayı dışında
// hiçbir çağıran değişmedi.
export type Haber = WordPressContent & {
  bicim?: HaberBicimi;
  kaynak?: string;
};

const KESIK_OZET_SONU = /\s*(?:\[…\]|\[\.\.\.\]|…)\s*$/u;

function duzMetin(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/* WordPress otomatik özetleri yaklaşık 150 karakterde kesip sonuna […] koyar.
   Kesilmiş cümleyi yalnızca işareti atarak bırakmak yerine, gövdedeki ilgili
   paragrafın sonuna kadar tamamlarız. Elle yazılmış özetlere dokunulmaz.

   Bu iş eskiden her okumada yapılıyordu ve haber listesini istek başına ~41 ms
   CPU'ya mal ediyordu (yük testi, 3 Eylül 2026). Göçle birlikte tamamlanmış
   özet tabloya yazıldı; burada kalması yalnızca veritabanı yedeğine düşüldüğü
   an için, o anlık görüntü hâlâ ham WordPress özetlerini taşıyor. */
export function haberOzetiniTamamla(excerpt: string, html: string) {
  const ozet = excerpt.trim();
  if (!KESIK_OZET_SONU.test(ozet)) return ozet;

  const kesik = ozet.replace(KESIK_OZET_SONU, "").trim();
  const paragraflar = Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((eslesme) => duzMetin(eslesme[1]))
    .filter(Boolean);
  const govde = paragraflar.join(" ") || duzMetin(html);
  const onEk = kesik.slice(0, Math.min(40, kesik.length));
  if (!kesik || !govde.startsWith(onEk)) return kesik;

  let tamamlanan = "";
  for (const paragraf of paragraflar) {
    tamamlanan = `${tamamlanan} ${paragraf}`.trim();
    if (tamamlanan.length >= kesik.length) return tamamlanan;
  }

  return kesik;
}

/* Tablonun birincil anahtarı cuid; uygulamanın haber kimliği ise refNo, yani
   WordPress'ten devralınan sayı. Sebep migration dosyasında: /yonetim/icerik/[id]
   adresleri ve [...slug] rotasındaki statik sayfalarla birleşme buna dayanıyor. */
type HaberSatiri = {
  refNo: number;
  slug: string;
  title: string;
  summary: string;
  body: unknown;
  coverImage: string;
  categories: number[];
  format: string;
  source: string;
  publishedAt: Date;
  updatedAt: Date;
};

const ALANLAR = sql`
  "refNo", slug, title, summary, body, "coverImage", categories, format, source,
  COALESCE("publishedAt", "createdAt") AS "publishedAt", "updatedAt"
`;

// Dosya sürümündeki sıra "en yeni önce"ydi; sitede de, panelde de o sıra bekleniyor.
const SIRA = sql`COALESCE("publishedAt", "createdAt") DESC, "refNo" DESC`;

/* Kamuya açık okumalar yalnızca yayımlanmış haberi görür. Bugün tabloya yazan
   iki yer de (bu dosya ve scripts/goc-haberler.mjs) hep 'PUBLISHED' yazıyor,
   yani koşul şu an hiçbir satırı elemiyor; taslak ya da zamanlanmış yayın
   eklendiği gün yayımlanmamış haberin siteye sızmasını engellemek için
   şimdiden duruyor. Panel okumaları bu koşulun dışında: haberBulId hiç
   uygulamaz, haberleriOku ise taslaklarDahil ile atlar. */
const YAYINDA = sql`status = 'PUBLISHED'`;

/* ALANLAR/SIRA gibi bir kez kurulup yeniden kullanılan parçalar: haberleriOku
   iki koşuldan birini seçiyor, bunları çağrı anında üretmenin faydası yok. */
const YAYINDA_KOSULU = sql`WHERE ${YAYINDA}`;
const KOSULSUZ = sql``;

function satirdanHaber(satir: HaberSatiri): Haber {
  return {
    id: satir.refNo,
    type: "post",
    slug: satir.slug,
    path: satir.slug,
    title: satir.title,
    excerpt: satir.summary,
    date: satir.publishedAt.toISOString(),
    modified: satir.updatedAt.toISOString(),
    link: "",
    parent: 0,
    menuOrder: 0,
    categories: satir.categories,
    featuredImage: satir.coverImage,
    html: typeof satir.body === "string" ? satir.body : "",
    bicim: satir.format === "duz" ? "duz" : "html",
    kaynak: satir.source,
  };
}

/* Yedek anlık görüntü, temalardakiyle aynı gerekçe: bağlantı geçici olarak
   düştüğünde kamu sayfalarını hata ekranına çevirmek yerine son sağlam hâli
   göster. Şema ve sorgu hataları gizlenmeden yukarı iletilir. Bu kayıtlar
   dosya çağındaki ham hâl olduğu için özetleri burada tamamlanıyor. */
let yedekBellek: Haber[] | null = null;

function yedekHaberler(): Haber[] {
  // Tembel: sağlıklı bir sunucu bu anlık görüntüyü hiç açmaz, özet tamamlamanın
  // ~41 ms'ini de ödemez.
  yedekBellek ??= (haberYedegi as unknown as Haber[]).map((haber) => ({
    ...haber,
    excerpt: haberOzetiniTamamla(haber.excerpt, haber.html),
  }));
  return yedekBellek;
}

function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

export async function haberleriOku(taslaklarDahil = false): Promise<Haber[]> {
  try {
    const satirlar = await sql<HaberSatiri[]>`
      SELECT ${ALANLAR} FROM "Article"
      ${taslaklarDahil ? KOSULSUZ : YAYINDA_KOSULU}
      ORDER BY ${SIRA}
    `;
    return satirlar.map(satirdanHaber);
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return yedekHaberler();
  }
}

// Kart listeleri yalnızca bu alanları gösterir. Gövde html'i (74 haberde ~450 KB)
// sunucu bileşeni akışına girmesin diye kartlara ayıklanmış kayıt verilir.
export type HaberKarti = Pick<Haber, "id" | "slug" | "title" | "excerpt" | "date" | "featuredImage" | "categories">;

export const HABER_SAYFA_BOYUTU = 12;

type KartSatiri = Pick<HaberSatiri, "refNo" | "slug" | "title" | "summary" | "coverImage" | "categories" | "publishedAt">;

const KART_ALANLARI = sql`
  "refNo", slug, title, summary, "coverImage", categories,
  COALESCE("publishedAt", "createdAt") AS "publishedAt"
`;

function satirdanKart(satir: KartSatiri): HaberKarti {
  return {
    id: satir.refNo,
    slug: satir.slug,
    title: satir.title,
    excerpt: satir.summary,
    date: satir.publishedAt.toISOString(),
    featuredImage: satir.coverImage,
    categories: satir.categories,
  };
}

function karta({ id, slug, title, excerpt, date, featuredImage, categories }: Haber): HaberKarti {
  return { id, slug, title, excerpt, date, featuredImage, categories };
}

export async function haberKartlariOku(limit?: number): Promise<HaberKarti[]> {
  try {
    const satirlar = await sql<KartSatiri[]>`
      SELECT ${KART_ALANLARI} FROM "Article"
      WHERE ${YAYINDA}
      ORDER BY ${SIRA}
      ${limit ? sql`LIMIT ${limit}` : sql``}
    `;
    return satirlar.map(satirdanKart);
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return (limit ? yedekHaberler().slice(0, limit) : yedekHaberler()).map(karta);
  }
}

// Sayfa numarası aralık dışındaysa en yakın geçerli sayfaya çekilir; boş liste
// dönmektense ilk/son sayfayı göstermek kullanıcıyı çıkmaza sokmaz.
export async function haberSayfasi(istenenSayfa: number) {
  try {
    const [{ toplam }] = await sql<{ toplam: number }[]>`SELECT count(*)::int AS toplam FROM "Article" WHERE ${YAYINDA}`;
    const sonSayfa = Math.max(1, Math.ceil(toplam / HABER_SAYFA_BOYUTU));
    const sayfa = Math.min(Math.max(1, istenenSayfa), sonSayfa);
    const satirlar = await sql<KartSatiri[]>`
      SELECT ${KART_ALANLARI} FROM "Article"
      WHERE ${YAYINDA}
      ORDER BY ${SIRA}
      LIMIT ${HABER_SAYFA_BOYUTU} OFFSET ${(sayfa - 1) * HABER_SAYFA_BOYUTU}
    `;
    return { kartlar: satirlar.map(satirdanKart), toplam, sayfa, sonSayfa };
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    const toplam = yedekHaberler().length;
    const sonSayfa = Math.max(1, Math.ceil(toplam / HABER_SAYFA_BOYUTU));
    const sayfa = Math.min(Math.max(1, istenenSayfa), sonSayfa);
    const baslangic = (sayfa - 1) * HABER_SAYFA_BOYUTU;
    return {
      kartlar: yedekHaberler().slice(baslangic, baslangic + HABER_SAYFA_BOYUTU).map(karta),
      toplam,
      sayfa,
      sonSayfa,
    };
  }
}

export async function haberBul(slug: string) {
  try {
    const [satir] = await sql<HaberSatiri[]>`
      SELECT ${ALANLAR} FROM "Article" WHERE slug = ${slug} AND ${YAYINDA} LIMIT 1
    `;
    return satir ? satirdanHaber(satir) : undefined;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return yedekHaberler().find((haber) => haber.slug === slug);
  }
}

export async function haberBulId(id: number) {
  try {
    const [satir] = await sql<HaberSatiri[]>`
      SELECT ${ALANLAR} FROM "Article" WHERE "refNo" = ${id} LIMIT 1
    `;
    return satir ? satirdanHaber(satir) : undefined;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return yedekHaberler().find((haber) => haber.id === id);
  }
}

export type HaberKomsusu = { slug: string; title: string };

/* Haber detayı eskiden bütün haberleri okuyup dizide komşu arıyordu; dosya
   sürümünde bu bedavaydı, tabloda 74 gövdeyi (~450 KB) boşuna taşımak olurdu.
   "Önceki" daha eski, "sonraki" daha yeni haber — dosya sürümündeki dizi
   sırasının anlamı buydu. */
export async function haberDetayi(slug: string) {
  const item = await haberBul(slug);
  if (!item) return undefined;

  try {
    const [[onceki], [sonraki]] = await Promise.all([
      sql<HaberKomsusu[]>`
        SELECT slug, title FROM "Article"
        WHERE ${YAYINDA} AND COALESCE("publishedAt", "createdAt") < ${new Date(item.date)}
        ORDER BY COALESCE("publishedAt", "createdAt") DESC, "refNo" DESC
        LIMIT 1
      `,
      sql<HaberKomsusu[]>`
        SELECT slug, title FROM "Article"
        WHERE ${YAYINDA} AND COALESCE("publishedAt", "createdAt") > ${new Date(item.date)}
        ORDER BY COALESCE("publishedAt", "createdAt") ASC, "refNo" ASC
        LIMIT 1
      `,
    ]);
    return { item, previous: onceki, next: sonraki };
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    const sira = yedekHaberler().findIndex((haber) => haber.slug === slug);
    return { item, previous: yedekHaberler()[sira + 1], next: yedekHaberler()[sira - 1] };
  }
}

export type HaberGirdi = {
  title: string;
  slug: string;
  excerpt: string;
  bicim: HaberBicimi;
  icerik: string;
  featuredImage: string;
  date: string;
};

// Tek yerde çöz: düz metin girildiyse html üretilir, kaynak metin saklanır.
function govdeCoz(girdi: HaberGirdi) {
  return {
    bicim: girdi.bicim,
    html: govdeHtmlUret(girdi.bicim, girdi.icerik),
    kaynak: girdi.bicim === "duz" ? girdi.icerik : "",
  };
}

function sluglastir(deger: string) {
  const harita: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u" };
  return deger
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (h) => harita[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Slug çakışırsa sonuna sayı eklenir; aksi halde iki haber aynı adrese düşer.
async function benzersizSlug(istenen: string, hariçRefNo?: number) {
  const temel = sluglastir(istenen) || "haber";
  const dolular = await sql<{ slug: string }[]>`
    SELECT slug FROM "Article"
    WHERE (slug = ${temel} OR slug LIKE ${temel + "-%"})
      AND "refNo" <> ${hariçRefNo ?? -1}
  `;
  const alinmis = new Set(dolular.map((s) => s.slug));
  let aday = temel;
  let sayac = 2;
  while (alinmis.has(aday)) aday = `${temel}-${sayac++}`;
  return aday;
}

export async function haberGuncelle(id: number, girdi: HaberGirdi) {
  const slug = await benzersizSlug(girdi.slug || girdi.title, id);
  const govde = govdeCoz(girdi);
  const [satir] = await sql<HaberSatiri[]>`
    UPDATE "Article" SET
      title = ${girdi.title.trim()},
      slug = ${slug},
      summary = ${girdi.excerpt.trim()},
      body = ${sql.json(govde.html)},
      format = ${govde.bicim},
      source = ${govde.kaynak},
      "coverImage" = ${girdi.featuredImage.trim()},
      ${girdi.date ? sql`"publishedAt" = ${new Date(girdi.date)},` : sql``}
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "refNo" = ${id}
    RETURNING ${ALANLAR}
  `;
  if (!satir) throw new Error(`Haber bulunamadı: ${id}`);
  return satirdanHaber(satir);
}

export async function haberEkle(girdi: HaberGirdi) {
  const slug = await benzersizSlug(girdi.slug || girdi.title);
  const govde = govdeCoz(girdi);
  const [satir] = await sql<HaberSatiri[]>`
    INSERT INTO "Article" (
      id, title, slug, summary, body, format, source, "coverImage", categories,
      status, "publishedAt", "updatedAt"
    )
    VALUES (
      ${randomUUID()}, ${girdi.title.trim()}, ${slug}, ${girdi.excerpt.trim()},
      ${sql.json(govde.html)}, ${govde.bicim}, ${govde.kaynak},
      ${girdi.featuredImage.trim()}, '{}'::int[],
      'PUBLISHED', ${girdi.date ? new Date(girdi.date) : sql`CURRENT_TIMESTAMP`},
      CURRENT_TIMESTAMP
    )
    RETURNING ${ALANLAR}
  `;
  return satirdanHaber(satir);
}

export async function haberSil(id: number) {
  await sql`DELETE FROM "Article" WHERE "refNo" = ${id}`;
}
