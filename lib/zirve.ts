import { randomUUID } from "node:crypto";
import { sql } from "./db";
import zirveYedegi from "@/data-ornek/zirveler.json";
import {
  zirveGovdesiniCoz, zirveYolu, guvenliZirveAdresi,
  type Zirve, type ZirveGovdesi,
} from "./zirve-govde";

/**
 * GENÇTEK ZİRVELERİ — TEK KAYNAK.
 *
 * Metinler YEĞİTEK'ten geldi (31 Ağustos 2026). Aynı içerik üç yerde
 * görünüyor ve üçü de buradan besleniyor:
 *   /zirve                                      → 1. Zirve (2025)
 *   /2-genctek-zirvesi-2026                     → 2. Zirve (2026)
 *   /hakkinda/temel-etkinlikler/genctek-zirvesi → ikisi bir arada
 *
 * ÖNCESİNDE İKİ ZİRVE SAYFASI WORDPRESS AKTARIMINDAN OKUNUYORDU
 * (`lib/generated/wordpress-pages.json`). O dosya kaynak sitenin arşivi; elle
 * düzeltilirse bir sonraki içe aktarımda geri gider. Sayfalar bu yüzden kendi
 * içeriğine geçti — arşiv kaydı `/arsiv/sayfalar` altında duruyor.
 *
 * SABİT DİZİDEN VERİTABANINA (4 Eylül 2026 · istek: "zirve sayfalarını da
 * yapalım"). İki zirve bu dosyada elle yazılıydı: her yeni zirve bir kod
 * değişikliği ve dağıtım demekti, metnin bir cümlesini düzeltmek de öyle.
 * Artık "Page" tablosunda (section = 'zirve') ve panelden yönetiliyorlar —
 * Hakkında sayfalarıyla aynı desen (bkz. lib/hakkinda.ts).
 *
 * ADRESLER DEĞİŞMEDİ: eski iki zirvenin yolu ("/zirve",
 * "/2-genctek-zirvesi-2026") satırın kendisinde duruyor. Panelden açılan yeni
 * zirveler `/zirve/<slug>` altına düşer; kök dizini her yıl yeni bir kısa
 * adresle doldurmak, paylaşılan bağlantıları da adres yapısını da karıştırırdı.
 */
export type { Zirve, ZirveGorseli, ZirveVideosu, ZirveVurgusu, ZirveBolumu } from "./zirve-govde";
export { zirveYolu, guvenliZirveAdresi } from "./zirve-govde";

type Satir = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  eyebrow: string;
  linkUrl: string;
  blocks: unknown;
  status: string;
};

// Fragman her çağrıda yeniden kuruluyor: postgres.js'te sql`` bir sorgu nesnesi
// döndürür, aynı nesneyi iki sorguda paylaşmak güvenli değil.
const alanlar = () => sql`id, slug, title, summary, eyebrow, "linkUrl", blocks, status`;

function satirdanZirve(satir: Satir): Zirve {
  const govde = zirveGovdesiniCoz(satir.blocks);
  return {
    id: satir.id,
    slug: satir.slug,
    yol: zirveYolu(satir.slug, satir.linkUrl),
    ad: satir.title,
    yil: govde.yil,
    tarihYer: satir.eyebrow,
    ozet: satir.summary,
    metin: govde.metin,
    vurgular: govde.vurgular,
    bolumler: govde.bolumler,
    gorseller: govde.gorseller,
    video: govde.video ?? undefined,
    yayinda: satir.status === "PUBLISHED",
  };
}

/* Zirve bağlantıları ÜST MENÜDE, yani her sayfada okunuyor: bağlantı düştüğünde
   hata yükseltilseydi sitenin tamamı 500 dönerdi. Son sağlam anlık görüntü
   data-ornek/zirveler.json'da duruyor. Şema ve sorgu hataları gizlenmiyor. */
function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

type YedekKaydi = {
  slug: string; yol: string; ad: string; yil: string; tarihYer: string;
  ozet: string; metin: string; vurgular: unknown; bolumler: unknown;
  gorseller: unknown; video: unknown;
};

const YEDEK_ZIRVELER: Zirve[] = (zirveYedegi as YedekKaydi[]).map((kayit) => {
  const govde = zirveGovdesiniCoz(kayit);
  return {
    id: kayit.slug,
    slug: kayit.slug,
    yol: zirveYolu(kayit.slug, kayit.yol),
    ad: kayit.ad,
    yil: kayit.yil,
    tarihYer: kayit.tarihYer,
    ozet: kayit.ozet,
    metin: govde.metin,
    vurgular: govde.vurgular,
    bolumler: govde.bolumler,
    gorseller: govde.gorseller,
    video: govde.video ?? undefined,
    yayinda: true,
  };
});

/**
 * SIRA YENİDEN ESKİYE: menüyü açan ya da listeye bakan kişi neredeyse her zaman
 * güncel zirveyi arıyor, o yüzden en üstte o duruyor. "order" sütunu panelden
 * ok tuşlarıyla değişiyor.
 */
export async function zirveleriOku(taslaklarDahil = false): Promise<Zirve[]> {
  try {
    const durumKosulu = taslaklarDahil ? sql`` : sql`AND status = 'PUBLISHED'`;
    const satirlar = await sql<Satir[]>`
      SELECT ${alanlar()} FROM "Page"
      WHERE section = 'zirve' ${durumKosulu}
      ORDER BY "order", "createdAt"
    `;
    return satirlar.map(satirdanZirve);
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return YEDEK_ZIRVELER;
  }
}

export async function zirveBul(slug: string): Promise<Zirve | undefined> {
  try {
    const [satir] = await sql<Satir[]>`
      SELECT ${alanlar()} FROM "Page"
      WHERE section = 'zirve' AND slug = ${slug}
      LIMIT 1
    `;
    return satir ? satirdanZirve(satir) : undefined;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return YEDEK_ZIRVELER.find((zirve) => zirve.slug === slug);
  }
}

/**
 * Sayfanın ihtiyacı bu: gösterilecek zirve ve altta bağlantısı verilecek
 * ötekiler. Üç zirve rotası da (iki tarihsel adres ve /zirve/<slug>) bunu
 * çağırıyor; liste tek sorguda okunup ikiye ayrılıyor, aynı sorgu iki kez
 * çalışmasın diye.
 */
export async function zirveVeDigerleri(slug: string) {
  const hepsi = await zirveleriOku();
  return {
    zirve: hepsi.find((kayit) => kayit.slug === slug),
    digerleri: hepsi.filter((kayit) => kayit.slug !== slug),
  };
}

export async function zirveyiIdIleBul(id: string): Promise<Zirve | undefined> {
  const [satir] = await sql<Satir[]>`
    SELECT ${alanlar()} FROM "Page"
    WHERE section = 'zirve' AND id = ${id}
    LIMIT 1
  `;
  return satir ? satirdanZirve(satir) : undefined;
}

/** Temel etkinlik sayfasında iki zirve tek metin hâlinde basılıyor. */
export async function zirveOzetMetni() {
  const zirveler = await zirveleriOku();
  return zirveler.map((zirve) => `${zirve.ad} (${zirve.yil})\n\n${zirve.metin}`).join("\n\n");
}

/* ---------------------------------------------------------------- yazma --- */

export type ZirveGirdi = {
  slug: string;
  ad: string;
  yil: string;
  tarihYer: string;
  ozet: string;
  yol: string;
  govde: ZirveGovdesi;
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
  const temel = sluglastir(istenen) || "zirve";
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

function girdiCoz(girdi: ZirveGirdi) {
  const govde = zirveGovdesiniCoz({ ...girdi.govde, yil: girdi.yil });
  return {
    ad: girdi.ad.trim(),
    tarihYer: girdi.tarihYer.trim(),
    ozet: girdi.ozet.trim(),
    // Yol yalnızca eski iki zirvenin tarihsel adresi için doldurulur; yeni
    // kayıtta boş kalır ve /zirve/<slug> kullanılır.
    yol: guvenliZirveAdresi(girdi.yol),
    govde,
    yayinda: girdi.yayinda,
  };
}

export async function zirveEkle(girdi: ZirveGirdi): Promise<Zirve> {
  const slug = await benzersizSlug(girdi.slug || girdi.ad);
  const v = girdiCoz(girdi);
  const id = randomUUID();
  await sql`
    INSERT INTO "Page" (
      id, section, slug, title, summary, eyebrow, "linkUrl", blocks, status,
      "order", "publishedAt", "updatedAt"
    ) VALUES (
      ${id}, 'zirve', ${slug}, ${v.ad}, ${v.ozet}, ${v.tarihYer}, ${v.yol},
      ${sql.json(v.govde)}, ${v.yayinda ? "PUBLISHED" : "DRAFT"},
      (SELECT COALESCE(MIN("order"), 0) - 1 FROM "Page" WHERE section = 'zirve'),
      ${v.yayinda ? sql`CURRENT_TIMESTAMP` : sql`NULL`}, CURRENT_TIMESTAMP
    )
  `;
  return (await zirveyiIdIleBul(id))!;
}

export async function zirveGuncelle(id: string, girdi: ZirveGirdi): Promise<Zirve> {
  const [mevcut] = await sql<{ slug: string }[]>`SELECT slug FROM "Page" WHERE id = ${id} LIMIT 1`;
  const slug = await benzersizSlug(girdi.slug || girdi.ad, id, mevcut?.slug);
  const v = girdiCoz(girdi);
  const [satir] = await sql<{ id: string }[]>`
    UPDATE "Page" SET
      slug = ${slug},
      title = ${v.ad},
      summary = ${v.ozet},
      eyebrow = ${v.tarihYer},
      "linkUrl" = ${v.yol},
      blocks = ${sql.json(v.govde)},
      status = ${v.yayinda ? "PUBLISHED" : "DRAFT"},
      "publishedAt" = COALESCE("publishedAt", ${v.yayinda ? sql`CURRENT_TIMESTAMP` : sql`NULL`}),
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id} AND section = 'zirve'
    RETURNING id
  `;
  if (!satir) throw new Error(`Zirve bulunamadı: ${id}`);
  return (await zirveyiIdIleBul(id))!;
}

export async function zirveSil(id: string) {
  await sql`DELETE FROM "Page" WHERE id = ${id} AND section = 'zirve'`;
}

/* Sıra değişimi iki kaydın yerini takas ediyor (bkz. lib/hakkinda.ts'teki
   aynı işlev): tüm listeyi yeniden numaralamak yerine, eşzamanlı iki
   düzenlemede en kötü ihtimalle bir kayıt yerinde kalsın. */
export async function zirveSirasiniTasi(id: string, yon: "yukari" | "asagi") {
  const zirveler = await sql<{ id: string }[]>`
    SELECT id FROM "Page" WHERE section = 'zirve' ORDER BY "order", "createdAt"
  `;
  const sira = zirveler.findIndex((z) => z.id === id);
  if (sira < 0) return;
  const hedef = yon === "yukari" ? sira - 1 : sira + 1;
  if (hedef < 0 || hedef >= zirveler.length) return;
  await sql.begin((tx) => [
    tx`UPDATE "Page" SET "order" = ${hedef}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${zirveler[sira].id}`,
    tx`UPDATE "Page" SET "order" = ${sira}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${zirveler[hedef].id}`,
  ]);
}
