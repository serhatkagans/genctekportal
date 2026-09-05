/**
 * HAKKINDA SAYFALARININ TİPLERİ VE SÜZGEÇLERİ.
 *
 * lib/hakkinda.ts'ten 4 Eylül 2026'da AYRILDI: o dosya `postgres` sürücüsünü
 * içeri alıyor ve panelin blok editörü bir istemci bileşeni — ikon listesini
 * oradan almak, veritabanı sürücüsünü tarayıcı paketine sokup derlemeyi
 * durduruyordu. Burada veritabanına dokunan hiçbir şey yok.
 */

import { siteIciYolMu } from "./guvenli-adres";

// Kartın simgesi. Ad, components/icons.tsx'teki takımdan seçilir; bileşenin tip
// birliğini buraya import etmek yerine karşılığı yazıldı — lib katmanı
// bileşenlere bağlanmasın diye.

export const HAKKINDA_IKONLARI = ["badge", "gauge", "calendar", "tag", "users", "image", "news", "file", "shield", "form"] as const;
export type HakkindaIkonu = (typeof HAKKINDA_IKONLARI)[number];

/*
 * GÖVDE BLOKLARI. Serbest HTML yerine sayılı blok türleri var: panelden gelen
 * metin hiçbir yerde ham HTML olarak basılmıyor, bu yüzden içerik yazarının
 * eline script geçmiyor. Türler mevcut üç sayfanın ihtiyacından çıktı —
 * sayfalar taşınırken görünüşleri birebir korunsun diye.
 */
export type HakkindaBlogu =
  | { tur: "baslik"; metin: string; ustEtiket?: string; yeniBolum?: boolean; sutun?: "sag" }
  | { tur: "metin"; metin: string; sutun?: "sag" }
  | { tur: "liste"; ogeler: { baslik?: string; metin?: string }[]; sutun?: "sag" }
  | { tur: "gorsel"; url: string; alt: string; sutun?: "sag" }
  | { tur: "video"; url: string; sutun?: "sag" }
  | { tur: "kartlar"; ogeler: { ad: string; aciklama: string; dosya?: string }[]; sutun?: "sag" }
  | { tur: "not"; metin: string; sutun?: "sag" };

export type HakkindaSayfasi = {
  id: string;
  slug: string;
  baslik: string;
  /* Sayfa başlığı kart başlığından farklı olabiliyor: kart "GençTek Nedir?"
     diyor, sayfanın kendi H1'i "GençTek". Boşsa kart başlığı kullanılır. */
  sayfaBasligi: string;
  ozet: string;
  ikon: HakkindaIkonu;
  /* Doluysa kart bu adrese gider ve gövde hiç basılmaz. */
  adres: string;
  ustEtiket: string;
  spot: string;
  duzen: "tek" | "ikili";
  seoBaslik: string;
  seoAciklama: string;
  bloklar: HakkindaBlogu[];
  yayinda: boolean;
};

// Kart ızgarasının ve menünün ihtiyaç duyduğu asgari alanlar.
export type HakkindaKarti = {
  slug: string;
  baslik: string;
  ozet: string;
  adres: string;
  ikon: HakkindaIkonu;
};

export function kartAdresi(sayfa: Pick<HakkindaSayfasi, "slug" | "adres">) {
  return sayfa.adres.trim() || `/hakkinda/${sayfa.slug}`;
}

export function baglantiKartiMi(sayfa: Pick<HakkindaSayfasi, "adres">) {
  return sayfa.adres.trim().length > 0;
}

// Tanınmayan simge adı sayfayı düşürmesin: kart yine basılır, öntanımlı bantla.
export function ikonCoz(deger: string): HakkindaIkonu {
  return (HAKKINDA_IKONLARI as readonly string[]).includes(deger) ? (deger as HakkindaIkonu) : "badge";
}

/*
 * Adres alanları yalnızca site içi yol ya da http(s) olabilir. Panelden
 * "javascript:" yazılabilseydi kartın kendisi bir tıklama tuzağına dönerdi;
 * kural okuma tarafında da uygulanıyor çünkü tabloya elle satır da girilebilir.
 */
export function guvenliAdres(deger: unknown): string {
  const metin = typeof deger === "string" ? deger.trim() : "";
  if (!metin) return "";
  if (siteIciYolMu(metin)) return metin;
  return /^https?:\/\//i.test(metin) ? metin : "";
}

// Tabloda blocks JSONB; içeriği bilinmeyen veri olduğu için okurken de
// süzülüyor. Tanınmayan tür sessizce düşer, sayfa yine açılır.
export function bloklariCoz(ham: unknown): HakkindaBlogu[] {
  if (!Array.isArray(ham)) return [];
  const sonuc: HakkindaBlogu[] = [];
  for (const oge of ham) {
    if (!oge || typeof oge !== "object") continue;
    const blok = oge as Record<string, unknown>;
    const sutun = blok.sutun === "sag" ? ("sag" as const) : undefined;
    const yazi = (alan: unknown) => (typeof alan === "string" ? alan : "");
    switch (blok.tur) {
      case "baslik":
        sonuc.push({
          tur: "baslik",
          metin: yazi(blok.metin),
          ustEtiket: yazi(blok.ustEtiket) || undefined,
          yeniBolum: blok.yeniBolum === true || undefined,
          sutun,
        });
        break;
      case "metin":
        sonuc.push({ tur: "metin", metin: yazi(blok.metin), sutun });
        break;
      case "not":
        sonuc.push({ tur: "not", metin: yazi(blok.metin), sutun });
        break;
      case "gorsel":
        sonuc.push({ tur: "gorsel", url: guvenliAdres(blok.url), alt: yazi(blok.alt), sutun });
        break;
      case "video":
        sonuc.push({ tur: "video", url: guvenliAdres(blok.url), sutun });
        break;
      case "liste":
        sonuc.push({
          tur: "liste",
          sutun,
          ogeler: (Array.isArray(blok.ogeler) ? blok.ogeler : []).map((o) => {
            const madde = (o ?? {}) as Record<string, unknown>;
            return { baslik: yazi(madde.baslik), metin: yazi(madde.metin) };
          }),
        });
        break;
      case "kartlar":
        sonuc.push({
          tur: "kartlar",
          sutun,
          ogeler: (Array.isArray(blok.ogeler) ? blok.ogeler : []).map((o) => {
            const kart = (o ?? {}) as Record<string, unknown>;
            return { ad: yazi(kart.ad), aciklama: yazi(kart.aciklama), dosya: guvenliAdres(kart.dosya) };
          }),
        });
        break;
      default:
        break;
    }
  }
  return sonuc;
}
