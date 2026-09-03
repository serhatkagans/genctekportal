import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { dosyaImzasiUyuyorMu } from "@/lib/security/dosya-imzasi";

// İki kaynak var: WordPress içe aktarımıyla gelen dosyalar ve panelden yüklenenler.
// İçe aktarılan klasöre yazmıyoruz ki yeniden içe aktarma yüklenenleri ezmesin.
const YUKLEME_KLASORU = path.join(process.cwd(), "public", "medya");
const ICE_AKTARIM_KLASORU = path.join(process.cwd(), "public", "wordpress", "media");

export const YUKLEME_URL_ONEKI = "/medya";
const ICE_AKTARIM_URL_ONEKI = "/wordpress/media";

export type MedyaKaynagi = "yuklenen" | "ice-aktarilan";

export type MedyaDosyasi = {
  ad: string;
  url: string;
  boyut: number;
  gorselMi: boolean;
  kaynak: MedyaKaynagi;
  degistirme: number;
};

const GORSEL_UZANTISI = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

// SVG yüklemeye kapalı: içine script gömülebiliyor ve dosyalar aynı kökenden
// sunuluyor. İçe aktarımdan gelmiş SVG'ler listelenir, yenisi kabul edilmez.
const KABUL_EDILEN_TURLER: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

export const EN_BUYUK_BOYUT = 8 * 1024 * 1024;

async function klasoruOku(klasor: string, urlOneki: string, kaynak: MedyaKaynagi): Promise<MedyaDosyasi[]> {
  let adlar: string[];
  try {
    adlar = await readdir(klasor);
  } catch {
    return [];
  }
  const dosyalar = await Promise.all(adlar.map(async (ad) => {
    const bilgi = await stat(path.join(klasor, ad));
    if (!bilgi.isFile()) return null;
    return {
      ad,
      url: `${urlOneki}/${ad}`,
      boyut: bilgi.size,
      gorselMi: GORSEL_UZANTISI.test(ad),
      kaynak,
      degistirme: bilgi.mtimeMs,
    } satisfies MedyaDosyasi;
  }));
  return dosyalar.filter((d): d is MedyaDosyasi => d !== null);
}

// İçe aktarılan klasörde binlerce dosya var; seçici arama yaparken ve sayfa
// atlarken aynı listeyi tekrar tekrar tarayacağı için kısa ömürlü bir kopya
// tutuyoruz. Yükleme kopyayı hemen düşürüyor, yeni dosya anında görünsün.
let kopya: { liste: MedyaDosyasi[]; zaman: number } | null = null;
const KOPYA_OMRU = 15_000;

export function medyaKopyasiniDusur() {
  kopya = null;
}

export async function medyaDosyalari(): Promise<MedyaDosyasi[]> {
  if (kopya && Date.now() - kopya.zaman < KOPYA_OMRU) return kopya.liste;

  const [yuklenen, iceAktarilan] = await Promise.all([
    klasoruOku(YUKLEME_KLASORU, YUKLEME_URL_ONEKI, "yuklenen"),
    klasoruOku(ICE_AKTARIM_KLASORU, ICE_AKTARIM_URL_ONEKI, "ice-aktarilan"),
  ]);
  // Yeni yüklenenler önce: editörde en çok aranan dosya en son eklenendir.
  // Aynı zaman damgasına düşen içe aktarım dosyaları ada göre sıralanıyor ki
  // liste sayfadan sayfaya aynı sırayı korusun.
  const liste = [...yuklenen, ...iceAktarilan].sort((a, b) =>
    b.degistirme - a.degistirme || a.ad.localeCompare(b.ad, "tr-TR"));

  kopya = { liste, zaman: Date.now() };
  return liste;
}

export type MedyaSorgusu = {
  arama?: string;
  kaynak?: MedyaKaynagi | "hepsi";
  yalnizGorsel?: boolean;
  atla?: number;
  adet?: number;
};

// Seçici tek seferde binlerce kaydı çekmesin: arama ve sayfalama sunucuda.
export async function medyaSayfasi(sorgu: MedyaSorgusu = {}) {
  const { arama = "", kaynak = "hepsi", yalnizGorsel = false, atla = 0, adet = 60 } = sorgu;
  const q = arama.trim().toLocaleLowerCase("tr-TR");

  const hepsi = (await medyaDosyalari()).filter((d) =>
    (!yalnizGorsel || d.gorselMi)
    && (kaynak === "hepsi" || d.kaynak === kaynak)
    && (!q || d.ad.toLocaleLowerCase("tr-TR").includes(q)));

  return { dosyalar: hepsi.slice(atla, atla + adet), toplam: hepsi.length };
}

function dosyaAdiUret(orijinalAd: string, uzanti: string) {
  const harita: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
  const govde = path.parse(orijinalAd).name
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (h) => harita[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  // Rastgele son ek: aynı adı taşıyan iki yükleme birbirini ezmesin.
  return `${govde || "gorsel"}-${randomBytes(4).toString("hex")}${uzanti}`;
}

export type YuklemeSonucu =
  | { tamam: true; dosya: MedyaDosyasi }
  | { tamam: false; hata: string };

export async function gorselKaydet(dosya: File): Promise<YuklemeSonucu> {
  const uzanti = KABUL_EDILEN_TURLER[dosya.type];
  if (!uzanti) {
    return { tamam: false, hata: "Yalnızca PNG, JPEG, WebP, AVIF ve GIF yüklenebilir." };
  }
  if (dosya.size === 0) {
    return { tamam: false, hata: "Dosya boş." };
  }
  if (dosya.size > EN_BUYUK_BOYUT) {
    return { tamam: false, hata: `Dosya ${(EN_BUYUK_BOYUT / 1024 / 1024).toFixed(0)} MB sınırını aşıyor.` };
  }

  /*
   * İÇERİK, BİLDİRİLEN TÜRLE UYUŞMALI. `dosya.type` istemciden gelir ve bu
   * dosyalar public/ altından siteyle AYNI KÖKENDEN sunuluyor — sahte türlü
   * bir yükleme, sniffing'e açık bir tarayıcıda aynı kökende çalışan içeriğe
   * dönüşebilirdi. SVG'nin kapalı olmasıyla aynı gerekçe (bkz. yukarısı).
   *
   * Baytlar burada BİR KEZ okunur; diske de aynı tampon yazılır.
   */
  const icerik = Buffer.from(await dosya.arrayBuffer());
  const imza = dosyaImzasiUyuyorMu(icerik, dosya.type);
  if (!imza.olurMu) {
    return { tamam: false, hata: imza.neden ?? "Dosya içeriği doğrulanamadı." };
  }

  const ad = dosyaAdiUret(dosya.name, uzanti);
  await mkdir(YUKLEME_KLASORU, { recursive: true });
  await writeFile(path.join(YUKLEME_KLASORU, ad), icerik);
  medyaKopyasiniDusur();

  return {
    tamam: true,
    dosya: {
      ad,
      url: `${YUKLEME_URL_ONEKI}/${ad}`,
      boyut: dosya.size,
      gorselMi: true,
      kaynak: "yuklenen",
      degistirme: Date.now(),
    },
  };
}
