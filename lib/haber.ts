import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { govdeHtmlUret, type HaberBicimi } from "@/lib/haber-bicim";
import type { WordPressContent } from "@/lib/wordpress-content";

// bicim/kaynak isteğe bağlı: içe aktarılan eski kayıtlarda yok, onlar "html" sayılır.
// Site her koşulda html alanını basar; kaynak yalnızca editöre geri yüklenir.
export type Haber = WordPressContent & {
  bicim?: HaberBicimi;
  kaynak?: string;
};

const DOSYA = path.join(process.cwd(), "data", "haberler.json");

// Tek yazma noktası. Postgres'e geçilirse yalnızca bu dosya değişir.
export async function haberleriOku(): Promise<Haber[]> {
  try {
    const ham = await readFile(DOSYA, "utf8");
    return JSON.parse(ham) as Haber[];
  } catch (hata) {
    if ((hata as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw hata;
  }
}

async function yaz(kayitlar: Haber[]) {
  await mkdir(path.dirname(DOSYA), { recursive: true });
  await writeFile(DOSYA, JSON.stringify(kayitlar, null, 2) + "\n", "utf8");
}

// Kart listeleri yalnızca bu alanları gösterir. Gövde html'i (72 haberde ~500 KB)
// sunucu bileşeni akışına girmesin diye kartlara ayıklanmış kayıt verilir.
export type HaberKarti = Pick<Haber, "id" | "slug" | "title" | "excerpt" | "date" | "featuredImage" | "categories">;

export const HABER_SAYFA_BOYUTU = 12;

function karta({ id, slug, title, excerpt, date, featuredImage, categories }: Haber): HaberKarti {
  return { id, slug, title, excerpt, date, featuredImage, categories };
}

export async function haberKartlariOku(limit?: number): Promise<HaberKarti[]> {
  const kayitlar = await haberleriOku();
  return (limit ? kayitlar.slice(0, limit) : kayitlar).map(karta);
}

// Sayfa numarası aralık dışındaysa en yakın geçerli sayfaya çekilir; boş liste
// dönmektense ilk/son sayfayı göstermek kullanıcıyı çıkmaza sokmaz.
export async function haberSayfasi(istenenSayfa: number) {
  const kayitlar = await haberleriOku();
  const toplam = kayitlar.length;
  const sonSayfa = Math.max(1, Math.ceil(toplam / HABER_SAYFA_BOYUTU));
  const sayfa = Math.min(Math.max(1, istenenSayfa), sonSayfa);
  const baslangic = (sayfa - 1) * HABER_SAYFA_BOYUTU;
  return {
    kartlar: kayitlar.slice(baslangic, baslangic + HABER_SAYFA_BOYUTU).map(karta),
    toplam,
    sayfa,
    sonSayfa,
  };
}

export async function haberBul(slug: string) {
  return (await haberleriOku()).find((h) => h.slug === slug);
}

export async function haberBulId(id: number) {
  return (await haberleriOku()).find((h) => h.id === id);
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
async function benzersizSlug(istenen: string, hariçId?: number) {
  const kayitlar = await haberleriOku();
  const temel = sluglastir(istenen) || "haber";
  let aday = temel;
  let sayac = 2;
  while (kayitlar.some((h) => h.slug === aday && h.id !== hariçId)) aday = `${temel}-${sayac++}`;
  return aday;
}

export async function haberGuncelle(id: number, girdi: HaberGirdi) {
  const kayitlar = await haberleriOku();
  const mevcut = kayitlar.find((h) => h.id === id);
  if (!mevcut) throw new Error(`Haber bulunamadı: ${id}`);

  const slug = await benzersizSlug(girdi.slug || girdi.title, id);
  const guncel: Haber = {
    ...mevcut,
    title: girdi.title.trim(),
    slug,
    path: slug,
    excerpt: girdi.excerpt.trim(),
    ...govdeCoz(girdi),
    featuredImage: girdi.featuredImage.trim(),
    date: girdi.date || mevcut.date,
    modified: new Date().toISOString(),
  };
  await yaz(kayitlar.map((h) => (h.id === id ? guncel : h)));
  return guncel;
}

export async function haberEkle(girdi: HaberGirdi) {
  const kayitlar = await haberleriOku();
  const slug = await benzersizSlug(girdi.slug || girdi.title);
  const simdi = new Date().toISOString();
  const yeni: Haber = {
    id: kayitlar.length ? Math.max(...kayitlar.map((h) => h.id)) + 1 : 1,
    type: "post",
    slug,
    path: slug,
    title: girdi.title.trim(),
    excerpt: girdi.excerpt.trim(),
    date: girdi.date || simdi,
    modified: simdi,
    link: "",
    parent: 0,
    menuOrder: 0,
    categories: [],
    featuredImage: girdi.featuredImage.trim(),
    ...govdeCoz(girdi),
  };
  await yaz([yeni, ...kayitlar]);
  return yeni;
}

export async function haberSil(id: number) {
  const kayitlar = await haberleriOku();
  await yaz(kayitlar.filter((h) => h.id !== id));
}
