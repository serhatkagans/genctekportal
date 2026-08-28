/**
 * GENÇTEK UYGULAMASINDAKİ SAYILAR (28 Ağustos 2026 · istekler: "buraya
 * platformdan gelecek öğrenci sayısı öğretmen sayısı mentör sayısı, etkinlik
 * sayısı, ürün sayısı", "bi de il sayısı ekleyelim kaç ilde var").
 *
 * Ana sayfa panelindeki rakamlar ELLE YAZILMIYOR. Elle yazılan sayı, yazıldığı
 * gün doğrudur; ekosistem büyüdükçe sessizce yanlışa döner ve kimse fark
 * etmez. Kaynağı, kaydın tutulduğu yer olan gençtek uygulamasıdır
 * (`/api/acik-istatistik`) — bkz. lib/genctek-etkinlik.ts, aynı desen.
 *
 * BAĞLANTI KOPUKSA SAYI GÖSTERİLMEZ: uç kapalıysa ya da adres tanımlı değilse
 * `null` döner ve panel o şeridi hiç basmaz. Yanlış/eski bir rakam basmak,
 * hiç basmamaktan kötüdür.
 */

import { GENCTEK_ADRESI } from "./genctek-baglanti";
import { onbellekliOku } from "./genctek-onbellek";

export type GencTekIstatistigi = {
  ogrenci: number;
  ogretmen: number;
  mentor: number;
  etkinlik: number;
  urun: number;
  /* Kaç FARKLI ilde kullanıcı var; il başına dağılım değil (uç kırılım vermez). */
  il: number;
};

/* Ana sayfa başka bir uygulamanın yavaşlığını beklemesin. */
const ZAMAN_ASIMI_MS = 4000;

/*
 * Beş dakika: sayılar canlı sayaç değil, ekosistemin ölçüsü. Uç da aynı süreyi
 * öneriyor (Cache-Control).
 *
 * ÖNBELLEK NEXT'İN DEĞİL, BİZİM: `next: { revalidate }` kullanıldığında Next
 * bayat kaydı arka planda tazeliyor ve o denemenin hatasını doğrudan günlüğe
 * yazıyordu — bkz. genctek-onbellek.ts. `no-store` ile istek Next'in önbelleğine
 * hiç girmiyor, süreyi bu dosya yönetiyor.
 */
const ONBELLEK_SANIYE = 300;

const ALANLAR = ["ogrenci", "ogretmen", "mentor", "etkinlik", "urun", "il"] as const;

/**
 * Platformdaki toplam sayılar; uç yanıt vermiyorsa `null`.
 */
export async function genctekIstatistigiOku(): Promise<GencTekIstatistigi | null> {
  if (!GENCTEK_ADRESI) return null;

  return onbellekliOku(
    "istatistik",
    ONBELLEK_SANIYE,
    ucuOku,
    (deger) => deger !== null,
  );
}

async function ucuOku(): Promise<GencTekIstatistigi | null> {
  try {
    const yanit = await fetch(`${GENCTEK_ADRESI}/api/acik-istatistik`, {
      signal: AbortSignal.timeout(ZAMAN_ASIMI_MS),
      cache: "no-store",
    });
    if (!yanit.ok) return null;

    /*
     * Gelen veri BAŞKA BİR UYGULAMANIN çıktısı: sürümü ayrı ilerler. Alanların
     * hepsi sayı değilse yarım bir panel basmaktansa hiç basılmıyor — yeni bir
     * alan eklenirken önce uç yayına alınır, sonra portal.
     */
    const govde = (await yanit.json()) as Record<string, unknown>;
    if (!ALANLAR.every((alan) => typeof govde[alan] === "number")) return null;

    return {
      ogrenci: govde.ogrenci as number,
      ogretmen: govde.ogretmen as number,
      mentor: govde.mentor as number,
      etkinlik: govde.etkinlik as number,
      urun: govde.urun as number,
      il: govde.il as number,
    };
  } catch {
    /* Ağ hatası, zaman aşımı ve bozuk JSON aynı sonuca varır: sayı yok. */
    return null;
  }
}

/** Panelde okunur biçim: 1200 → "1.200". */
export function sayiyiBicimle(sayi: number): string {
  return new Intl.NumberFormat("tr-TR").format(sayi);
}
