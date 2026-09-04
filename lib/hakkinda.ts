import { randomUUID } from "node:crypto";
import { sql } from "./db";
import hakkindaYedegi from "@/data-ornek/hakkinda.json";

/**
 * HAKKINDA SAYFALARI — TEK KAYNAK.
 *
 * Liste TEK YERDE duruyor çünkü üç yerde basılıyor: ana sayfadaki kart
 * ızgarası, üst menüdeki "Hakkında" açılır listesi ve site haritası. Ayrı ayrı
 * yazılsalardı yeni bir başlık eklendiğinde biri geride kalırdı.
 *
 * SABİT DİZİDEN VERİTABANINA (4 Eylül 2026 · istek: "yap tam çözüm"). Önceden
 * altı kart bu dosyada elle yazılıydı; kart eklemek, silmek ya da bir sayfanın
 * metnini düzeltmek kod değişikliği ve dağıtım demekti. Artık kartın kendisi de
 * gövdesi de "Page" tablosunda: panelden eklenen sayfa hem ızgarada hem menüde
 * hem site haritasında kendiliğinden beliriyor.
 *
 * ÜÇ KART SAYFA DEĞİL BAĞLANTI (linkUrl dolu): "Çalışma Grupları" /temalar'a,
 * "İl GençTek Koordinatörleri" ve "Temel GençTek Etkinlikleri" kendi hazır
 * ekranlarına gidiyor. O listeleri buraya kopyalamak, aynı içeriği iki adreste
 * yaşatmak olurdu — biri güncellenir, öbürü eskir.
 *
 * "İL KOORDİNATÖRLERİ" 20 Ağustos 2026'da Hakkında'nın ALTINA TAŞINDI (istek:
 * "koordinatör sayfasını da hakkındanın içine al"). Eski `/il-koordinatorleri`
 * adresi kalıcı yönlendirmeyle yaşıyor (bkz. next.config.ts) — paylaşılmış
 * bağlantılar ve arama motoru kayıtları kırılmasın.
 */

// Tipler, ikon listesi ve blok süzgeçleri ayrı dosyada: panelin blok editörü
// bir istemci bileşeni ve oradan bu dosyayı almak postgres sürücüsünü tarayıcı
// paketine sokardı. Buradan yeniden dışa aktarılıyorlar ki çağıranlar tek bir
// "@/lib/hakkinda" adresini bilsin.
export * from "./hakkinda-govde";
import {
  bloklariCoz, guvenliAdres, ikonCoz, kartAdresi,
  type HakkindaBlogu, type HakkindaKarti, type HakkindaSayfasi,
} from "./hakkinda-govde";

/* ---------------------------------------------------------------- okuma --- */

type Satir = {
  id: string;
  slug: string;
  title: string;
  pageTitle: string;
  summary: string;
  iconName: string;
  linkUrl: string;
  eyebrow: string;
  lede: string;
  layout: string;
  seoTitle: string | null;
  seoDescription: string | null;
  blocks: unknown;
  status: string;
};

// Fragman her çağrıda yeniden kuruluyor: postgres.js'te sql`` bir sorgu nesnesi
// döndürür ve aynı nesneyi iki sorguda paylaşmak güvenli değil.
const alanlar = () => sql`
  id, slug, title, "pageTitle", summary, "iconName", "linkUrl",
  eyebrow, lede, layout, "seoTitle", "seoDescription", blocks, status
`;

function satirdanSayfa(satir: Satir): HakkindaSayfasi {
  return {
    id: satir.id,
    slug: satir.slug,
    baslik: satir.title,
    sayfaBasligi: satir.pageTitle,
    ozet: satir.summary,
    ikon: ikonCoz(satir.iconName),
    adres: guvenliAdres(satir.linkUrl),
    ustEtiket: satir.eyebrow,
    spot: satir.lede,
    duzen: satir.layout === "ikili" ? "ikili" : "tek",
    seoBaslik: satir.seoTitle ?? "",
    seoAciklama: satir.seoDescription ?? "",
    bloklar: bloklariCoz(satir.blocks),
    yayinda: satir.status === "PUBLISHED",
  };
}

/* Yerel Prisma sunucusu bağlantı sınırına ulaştığında port açık görünmesine
   rağmen sorguları ECONNRESET ile düşürebiliyor. Hakkında kartları ÜST MENÜDE
   olduğu için bu liste her sayfada okunuyor: hata yükseltilseydi bağlantı
   koptuğu anda sitenin tamamı 500 dönerdi. Son sağlam anlık görüntü
   data-ornek/hakkinda.json'da duruyor; şema ve sorgu hataları gizlenmeden
   yukarı iletilmeye devam eder. */
function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

type YedekKaydi = {
  slug: string; baslik: string; sayfaBasligi: string; ozet: string; ikon: string;
  adres: string; ustEtiket: string; spot: string; duzen: string;
  seoBaslik: string; seoAciklama: string; bloklar: unknown;
};

const YEDEK_SAYFALAR: HakkindaSayfasi[] = (hakkindaYedegi as YedekKaydi[]).map((kayit) => ({
  id: kayit.slug,
  slug: kayit.slug,
  baslik: kayit.baslik,
  sayfaBasligi: kayit.sayfaBasligi,
  ozet: kayit.ozet,
  ikon: ikonCoz(kayit.ikon),
  adres: guvenliAdres(kayit.adres),
  ustEtiket: kayit.ustEtiket,
  spot: kayit.spot,
  duzen: kayit.duzen === "ikili" ? "ikili" : "tek",
  seoBaslik: kayit.seoBaslik,
  seoAciklama: kayit.seoAciklama,
  bloklar: bloklariCoz(kayit.bloklar),
  yayinda: true,
}));

/*
 * Sıra "order" sütununda ve panelden ok tuşlarıyla değişiyor. Ana sayfadaki
 * kart numaraları (01, 02, …) bu sıradan üretiliyor — kart listesinin sırası
 * ekranda görünür bir bilgi, tabloya yazılması gerekiyordu.
 */
export async function hakkindaSayfalariniOku(taslaklarDahil = false): Promise<HakkindaSayfasi[]> {
  try {
    const durumKosulu = taslaklarDahil ? sql`` : sql`AND status = 'PUBLISHED'`;
    const satirlar = await sql<Satir[]>`
      SELECT ${alanlar()} FROM "Page"
      WHERE section = 'hakkinda' ${durumKosulu}
      ORDER BY "order", "createdAt"
    `;
    return satirlar.map(satirdanSayfa);
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return YEDEK_SAYFALAR;
  }
}

export async function hakkindaKartlariniOku(): Promise<HakkindaKarti[]> {
  const sayfalar = await hakkindaSayfalariniOku();
  return sayfalar.map((sayfa) => ({
    slug: sayfa.slug,
    baslik: sayfa.baslik,
    ozet: sayfa.ozet,
    adres: kartAdresi(sayfa),
    ikon: sayfa.ikon,
  }));
}

export async function hakkindaSayfasiBul(slug: string): Promise<HakkindaSayfasi | undefined> {
  try {
    const [satir] = await sql<Satir[]>`
      SELECT ${alanlar()} FROM "Page"
      WHERE section = 'hakkinda' AND slug = ${slug}
      LIMIT 1
    `;
    return satir ? satirdanSayfa(satir) : undefined;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return YEDEK_SAYFALAR.find((sayfa) => sayfa.slug === slug);
  }
}

export async function hakkindaSayfasiniIdIleBul(id: string): Promise<HakkindaSayfasi | undefined> {
  const [satir] = await sql<Satir[]>`
    SELECT ${alanlar()} FROM "Page"
    WHERE section = 'hakkinda' AND id = ${id}
    LIMIT 1
  `;
  return satir ? satirdanSayfa(satir) : undefined;
}

/* ---------------------------------------------------------------- yazma --- */

export type HakkindaGirdi = {
  slug: string;
  baslik: string;
  sayfaBasligi: string;
  ozet: string;
  ikon: string;
  adres: string;
  ustEtiket: string;
  spot: string;
  duzen: string;
  seoBaslik: string;
  seoAciklama: string;
  bloklar: HakkindaBlogu[];
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

/*
 * Slug yalnızca "Page" tablosunda değil, /hakkinda ALTINDAKİ SABİT ROTALARLA da
 * çakışmamalı: panelden "temel-etkinlikler" adında yeni bir sayfa açılsaydı
 * kayıt tabloya girer ama adres hep dosya sistemindeki eski sayfayı gösterirdi
 * — düzenlenen sayfa hiçbir yerde görünmezdi.
 */
const SABIT_ROTALAR = ["temel-etkinlikler", "il-koordinatorleri"];

async function benzersizSlug(istenen: string, haricId?: string, mevcutSlug?: string) {
  const temel = sluglastir(istenen) || "sayfa";
  const dolular = await sql<{ slug: string }[]>`
    SELECT slug FROM "Page"
    WHERE (slug = ${temel} OR slug LIKE ${temel + "-%"})
      AND id <> ${haricId ?? ""}
  `;
  const alinmis = new Set([...dolular.map((s) => s.slug), ...SABIT_ROTALAR]);
  /* Kaydın KENDİ adı çakışma sayılmaz. Bu satır olmadan, göçle gelen
     "il-koordinatorleri" ve "temel-etkinlikler" kartları panelde her
     kaydedildiğinde sonlarına sayı eklenir, üstüne bir de eski adresten yeni
     ada 301 açılır ve gerçek sayfaların adresi kırılırdı. */
  if (mevcutSlug) alinmis.delete(mevcutSlug);
  let aday = temel;
  let sayac = 2;
  while (alinmis.has(aday)) aday = `${temel}-${sayac++}`;
  return aday;
}

function girdiCoz(girdi: HakkindaGirdi) {
  return {
    baslik: girdi.baslik.trim(),
    sayfaBasligi: girdi.sayfaBasligi.trim(),
    ozet: girdi.ozet.trim(),
    ikon: ikonCoz(girdi.ikon),
    adres: guvenliAdres(girdi.adres),
    ustEtiket: girdi.ustEtiket.trim(),
    spot: girdi.spot.trim(),
    duzen: girdi.duzen === "ikili" ? "ikili" : "tek",
    seoBaslik: girdi.seoBaslik.trim(),
    seoAciklama: girdi.seoAciklama.trim(),
    // Panelden gelen gövde okuma yolundakiyle aynı süzgeçten geçiyor: tabloya
    // ancak tanınan blok türleri ve güvenli adresler yazılıyor.
    bloklar: bloklariCoz(girdi.bloklar),
    yayinda: girdi.yayinda,
  };
}

export async function hakkindaSayfasiEkle(girdi: HakkindaGirdi): Promise<HakkindaSayfasi> {
  const slug = await benzersizSlug(girdi.slug || girdi.baslik);
  const v = girdiCoz(girdi);
  const id = randomUUID();
  await sql`
    INSERT INTO "Page" (
      id, section, slug, title, "pageTitle", summary, "iconName", "linkUrl",
      eyebrow, lede, layout, "seoTitle", "seoDescription", blocks, status,
      "order", "publishedAt", "updatedAt"
    ) VALUES (
      ${id}, 'hakkinda', ${slug}, ${v.baslik}, ${v.sayfaBasligi}, ${v.ozet}, ${v.ikon}, ${v.adres},
      ${v.ustEtiket}, ${v.spot}, ${v.duzen}, ${v.seoBaslik}, ${v.seoAciklama},
      ${sql.json(v.bloklar)}, ${v.yayinda ? "PUBLISHED" : "DRAFT"},
      (SELECT COALESCE(MAX("order"), -1) + 1 FROM "Page" WHERE section = 'hakkinda'),
      ${v.yayinda ? sql`CURRENT_TIMESTAMP` : sql`NULL`}, CURRENT_TIMESTAMP
    )
  `;
  return (await hakkindaSayfasiniIdIleBul(id))!;
}

export async function hakkindaSayfasiGuncelle(id: string, girdi: HakkindaGirdi): Promise<HakkindaSayfasi> {
  const [mevcut] = await sql<{ slug: string }[]>`SELECT slug FROM "Page" WHERE id = ${id} LIMIT 1`;
  const slug = await benzersizSlug(girdi.slug || girdi.baslik, id, mevcut?.slug);
  const v = girdiCoz(girdi);
  const [satir] = await sql<{ id: string }[]>`
    UPDATE "Page" SET
      slug = ${slug},
      title = ${v.baslik},
      "pageTitle" = ${v.sayfaBasligi},
      summary = ${v.ozet},
      "iconName" = ${v.ikon},
      "linkUrl" = ${v.adres},
      eyebrow = ${v.ustEtiket},
      lede = ${v.spot},
      layout = ${v.duzen},
      "seoTitle" = ${v.seoBaslik},
      "seoDescription" = ${v.seoAciklama},
      blocks = ${sql.json(v.bloklar)},
      status = ${v.yayinda ? "PUBLISHED" : "DRAFT"},
      "publishedAt" = COALESCE("publishedAt", ${v.yayinda ? sql`CURRENT_TIMESTAMP` : sql`NULL`}),
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id} AND section = 'hakkinda'
    RETURNING id
  `;
  if (!satir) throw new Error(`Hakkında sayfası bulunamadı: ${id}`);
  return (await hakkindaSayfasiniIdIleBul(id))!;
}

export async function hakkindaSayfasiSil(id: string) {
  await sql`DELETE FROM "Page" WHERE id = ${id} AND section = 'hakkinda'`;
}

/*
 * Sıra değişimi iki kaydın yerini takas ediyor; "yukarı taşı" düğmesi kendinden
 * önceki kayıtla, "aşağı taşı" sonrakiyle değiştirir. Tüm listeyi yeniden
 * numaralamak yerine takas seçildi: eşzamanlı iki düzenlemede en kötü ihtimalle
 * bir kart yerinde kalır, liste bozulmaz.
 */
export async function hakkindaSirasiniTasi(id: string, yon: "yukari" | "asagi") {
  const sayfalar = await sql<{ id: string; order: number }[]>`
    SELECT id, "order" FROM "Page"
    WHERE section = 'hakkinda'
    ORDER BY "order", "createdAt"
  `;
  const sira = sayfalar.findIndex((s) => s.id === id);
  if (sira < 0) return;
  const hedef = yon === "yukari" ? sira - 1 : sira + 1;
  if (hedef < 0 || hedef >= sayfalar.length) return;

  // Sıra numaraları eşit ya da boş kalmış olabilir (elle girilen satırlar);
  // takas yerine iki kayda da dizideki yeni yerlerini yazıyoruz.
  const a = sayfalar[sira];
  const b = sayfalar[hedef];
  await sql.begin((tx) => [
    tx`UPDATE "Page" SET "order" = ${hedef}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${a.id}`,
    tx`UPDATE "Page" SET "order" = ${sira}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${b.id}`,
  ]);
}
