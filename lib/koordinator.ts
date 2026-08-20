import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Koordinator = {
  id: string;
  ad: string;
  il: string;
  rol: string;
  gorsel: string;
  sira: number;
};

export const ROLLER = [
  "İl Koordinatörü",
  "İl Yöneticisi",
  "Yeğitek İl Yöneticisi",
  "Komisyon Üyesi",
] as const;

export const VARSAYILAN_GORSEL = "/wordpress/media/genctek-1-9f875b56c3d924e4.png";

const DOSYA = path.join(process.cwd(), "data", "koordinatorler.json");

// Tek yazma noktası. Postgres'e geçilirse yalnızca bu dosya değişir;
// panel ve genel sayfa aynı kalır.
export async function koordinatorleriOku(): Promise<Koordinator[]> {
  try {
    const ham = await readFile(DOSYA, "utf8");
    const veri = JSON.parse(ham) as Koordinator[];
    return veri.sort((a, b) => a.sira - b.sira);
  } catch (hata) {
    if ((hata as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw hata;
  }
}

async function yaz(kayitlar: Koordinator[]) {
  await mkdir(path.dirname(DOSYA), { recursive: true });
  await writeFile(DOSYA, JSON.stringify(kayitlar, null, 2) + "\n", "utf8");
}

type Girdi = { ad: string; il: string; rol: string; gorsel: string };

export async function koordinatorEkle(girdi: Girdi): Promise<Koordinator> {
  const kayitlar = await koordinatorleriOku();
  const yeni: Koordinator = {
    id: randomUUID(),
    ad: girdi.ad.trim(),
    il: girdi.il.trim(),
    rol: girdi.rol.trim(),
    gorsel: girdi.gorsel.trim() || VARSAYILAN_GORSEL,
    sira: kayitlar.length ? Math.max(...kayitlar.map((k) => k.sira)) + 1 : 0,
  };
  await yaz([...kayitlar, yeni]);
  return yeni;
}

export async function koordinatorGuncelle(id: string, girdi: Girdi) {
  const kayitlar = await koordinatorleriOku();
  const sonuc = kayitlar.map((k) =>
    k.id === id
      ? { ...k, ad: girdi.ad.trim(), il: girdi.il.trim(), rol: girdi.rol.trim(), gorsel: girdi.gorsel.trim() || VARSAYILAN_GORSEL }
      : k,
  );
  await yaz(sonuc);
}

export async function koordinatorSil(id: string) {
  const kayitlar = await koordinatorleriOku();
  await yaz(kayitlar.filter((k) => k.id !== id));
}

// Genel sayfa il adına göre sıralanır; aynı ilde koordinatör önce, üyeler sonra.
export function ileGoreSirala(kayitlar: Koordinator[]) {
  const agirlik = (rol: string) => (rol.includes("Koordinatör") ? 0 : rol.includes("Yönetici") ? 1 : 2);
  return [...kayitlar].sort(
    (a, b) => a.il.localeCompare(b.il, "tr") || agirlik(a.rol) - agirlik(b.rol) || a.ad.localeCompare(b.ad, "tr"),
  );
}
