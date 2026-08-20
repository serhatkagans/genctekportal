import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gorselYolu } from "./ortam";

// Temalar önce lib/content.ts içinde sabit diziydi; panelden düzenlenebilmesi için
// data/temalar.json'a taşındı. Haberlerle aynı desen: tek yazma noktası burası.
export type Tema = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  focus: string[];
  outcomes: string[];
};

const DOSYA = path.join(process.cwd(), "data", "temalar.json");

// Görsel seçilmeden tema oluşturulabiliyor; next/image boş src ile patladığı için
// her okuma noktasının bu yedeğe düşmesi gerekiyor.
export const TEMA_YEDEK_GORSELI = "/Genc.png";

// Depolanan yol site köküne göre ("/temalar/espor.jpg"); alt dizin kurulumunda
// önüne uygulama eki gelmeli. next/image bu eki kendiliğinden koymuyor —
// iyileştirici dosyayı kökte arayıp "received null" ile düşüyor.
export function temaGorseli(tema: Pick<Tema, "image">) {
  return gorselYolu(tema.image.trim() || TEMA_YEDEK_GORSELI);
}

export async function temalariOku(): Promise<Tema[]> {
  try {
    const ham = await readFile(DOSYA, "utf8");
    return JSON.parse(ham) as Tema[];
  } catch (hata) {
    if ((hata as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw hata;
  }
}

async function yaz(kayitlar: Tema[]) {
  await mkdir(path.dirname(DOSYA), { recursive: true });
  await writeFile(DOSYA, JSON.stringify(kayitlar, null, 2) + "\n", "utf8");
}

export async function temaBul(slug: string) {
  return (await temalariOku()).find((t) => t.slug === slug);
}

export type TemaGirdi = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  focus: string;
  outcomes: string;
};

function sluglastir(deger: string) {
  const harita: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u" };
  return deger
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (h) => harita[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function benzersizSlug(istenen: string, hariçSlug?: string) {
  const kayitlar = await temalariOku();
  const temel = sluglastir(istenen) || "tema";
  let aday = temel;
  let sayac = 2;
  while (kayitlar.some((t) => t.slug === aday && t.slug !== hariçSlug)) aday = `${temel}-${sayac++}`;
  return aday;
}

// Odak ve çıktı listeleri editörde satır satır giriliyor.
function satirlaraBol(deger: string) {
  return deger.split("\n").map((s) => s.trim()).filter(Boolean);
}

function govdeCoz(girdi: TemaGirdi, slug: string): Tema {
  return {
    slug,
    name: girdi.name.trim(),
    shortDescription: girdi.shortDescription.trim(),
    description: girdi.description.trim(),
    image: girdi.image.trim(),
    focus: satirlaraBol(girdi.focus),
    outcomes: satirlaraBol(girdi.outcomes),
  };
}

export async function temaEkle(girdi: TemaGirdi) {
  const kayitlar = await temalariOku();
  const slug = await benzersizSlug(girdi.slug || girdi.name);
  const yeni = govdeCoz(girdi, slug);
  await yaz([...kayitlar, yeni]);
  return yeni;
}

export async function temaGuncelle(mevcutSlug: string, girdi: TemaGirdi) {
  const kayitlar = await temalariOku();
  const mevcut = kayitlar.find((t) => t.slug === mevcutSlug);
  if (!mevcut) throw new Error(`Tema bulunamadı: ${mevcutSlug}`);

  const slug = await benzersizSlug(girdi.slug || girdi.name, mevcutSlug);
  const guncel = govdeCoz(girdi, slug);
  await yaz(kayitlar.map((t) => (t.slug === mevcutSlug ? guncel : t)));
  return guncel;
}

export async function temaSil(slug: string) {
  const kayitlar = await temalariOku();
  await yaz(kayitlar.filter((t) => t.slug !== slug));
}
