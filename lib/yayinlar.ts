import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * YAYINLAR (23 Kasım 2026 · istek: "flip page tarzı ... yayınlar olsun").
 *
 * Yayınlar veritabanında değil, DİSKTE: her biri public/yayinlar/<kisa-ad>/
 * altında bir klasör ve içinde scripts/yayin-hazirla.py'nin yazdığı yayin.json.
 * Sayfa görselleri zaten sunucuya elle (scp) gidiyor; kaydı da yanlarında
 * durursa görsel ile kayıt birbirinden kopamaz, yeni yayın ya da ikinci dil
 * için koda dokunmak gerekmez.
 *
 * Klasör yoksa ya da bir yayin.json bozuksa liste o yayın olmadan döner:
 * menü her sayfada basılıyor, tek bir bozuk dosya siteyi düşürmemeli.
 */

export type YayinDili = "tr" | "en";

export type YayinBaskisi = {
  baslik: string;
  sayfaSayisi: number;
  genislik: number;
  yukseklik: number;
  pdf: string;
  metinler: string[];
};

export type Yayin = {
  kisaAd: string;
  diller: Partial<Record<YayinDili, YayinBaskisi>>;
};

export const DIL_ADLARI: Record<YayinDili, string> = { tr: "Türkçe", en: "English" };
const DIL_SIRASI: YayinDili[] = ["tr", "en"];

const KOK = path.join(process.cwd(), "public", "yayinlar");
const KISA_AD = /^[a-z0-9][a-z0-9-]*$/;

function baskiyiCoz(ham: unknown): YayinBaskisi | null {
  const b = (ham ?? {}) as Record<string, unknown>;
  const sayi = (d: unknown) => (typeof d === "number" && Number.isFinite(d) && d > 0 ? d : 0);
  const sayfaSayisi = sayi(b.sayfaSayisi);
  if (!sayfaSayisi || typeof b.baslik !== "string" || typeof b.pdf !== "string") return null;
  return {
    baslik: b.baslik,
    sayfaSayisi,
    genislik: sayi(b.genislik) || 595,
    yukseklik: sayi(b.yukseklik) || 842,
    pdf: path.basename(b.pdf),
    metinler: Array.isArray(b.metinler) ? b.metinler.map((m) => (typeof m === "string" ? m : "")) : [],
  };
}

export async function yayinBul(kisaAd: string): Promise<Yayin | null> {
  if (!KISA_AD.test(kisaAd)) return null;
  try {
    const ham = JSON.parse(await readFile(path.join(KOK, kisaAd, "yayin.json"), "utf-8"));
    const diller: Yayin["diller"] = {};
    for (const dil of DIL_SIRASI) {
      const baski = baskiyiCoz(ham?.diller?.[dil]);
      if (baski) diller[dil] = baski;
    }
    return Object.keys(diller).length ? { kisaAd, diller } : null;
  } catch {
    return null;
  }
}

export async function yayinlariOku(): Promise<Yayin[]> {
  let adlar: string[];
  try {
    adlar = (await readdir(KOK, { withFileTypes: true }))
      .filter((g) => g.isDirectory() && KISA_AD.test(g.name))
      .map((g) => g.name)
      .sort();
  } catch {
    return [];
  }
  return (await Promise.all(adlar.map(yayinBul))).filter((y): y is Yayin => y !== null);
}

/** İstenen dil yoksa ilk mevcut dile düşer (önce Türkçe). */
export function baskiSec(yayin: Yayin, dil: string | undefined): [YayinDili, YayinBaskisi] {
  const istenen = DIL_SIRASI.find((d) => d === dil && yayin.diller[d]);
  const secilen = istenen ?? DIL_SIRASI.find((d) => yayin.diller[d])!;
  return [secilen, yayin.diller[secilen]!];
}

export function yayinDilleri(yayin: Yayin): YayinDili[] {
  return DIL_SIRASI.filter((d) => yayin.diller[d]);
}

export function baskiAdresi(kisaAd: string, dil: YayinDili): string {
  return dil === "tr" ? `/yayinlar/${kisaAd}` : `/yayinlar/${kisaAd}?dil=${dil}`;
}

/**
 * HER DİL AYRI SATIR (23 Kasım 2026 · istek: "/yayinlar'da sadece tr versiyon
 * var"). Tek kartta İngilizceye yalnızca okuyucunun içindeki düğmeden
 * gidiliyordu; listede ve menüde her baskı kendi kapağı ve adıyla duruyor.
 */
export function baskilar(yayinlar: Yayin[]) {
  return yayinlar.flatMap((yayin) =>
    yayinDilleri(yayin).map((dil) => ({
      yayin, dil, baski: yayin.diller[dil]!, adres: baskiAdresi(yayin.kisaAd, dil),
    })),
  );
}
