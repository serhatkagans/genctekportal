/*
 * YÜKLENEN DOSYANIN İÇERİĞİ, BİLDİRDİĞİ TÜRLE UYUŞUYOR MU
 * (3 Eylül 2026 · dış güvenlik incelemesi).
 *
 * Kabul kararı yalnızca `File.type`'a bakıyordu — `app/api/basvurular` ve
 * `lib/medya.ts`'te. O değer multipart gövdesinde İSTEMCİNİN yazdığı bir
 * dizedir, doğrulanmış bir şey değil: içeriği HTML olan bir dosya `image/png`
 * etiketiyle geçerdi.
 *
 * BURADA NİYE ÖNEMLİ: yüklenen görseller `public/` altından, siteyle AYNI
 * KÖKENDEN sunuluyor. Tarayıcının içeriğe bakıp tipi kendi tahmin etmesi
 * (MIME sniffing) hâlinde, görsel diye yüklenmiş bir HTML dosyası aynı kökende
 * çalışan bir sayfaya dönüşürdü. `lib/medya.ts` SVG'yi tam bu gerekçeyle
 * kapatmış; imza kontrolü aynı düşüncenin eksik kalan yarısı.
 *
 * SAF TUTULUR: yalnızca baytlara ve tür dizesine bakar; dosya sistemine ve
 * veritabanına gitmez.
 */

/** İmza tablosunun bakması gereken en uzun önek (avif/webp'te 12 bayt). */
const AZAMI_ONEK = 12;

function baytlarEsitMi(
  baytlar: Uint8Array,
  konum: number,
  beklenen: readonly number[],
): boolean {
  if (baytlar.length < konum + beklenen.length) return false;
  return beklenen.every((deger, i) => baytlar[konum + i] === deger);
}

function ascii(metin: string): readonly number[] {
  return [...metin].map((harf) => harf.charCodeAt(0));
}

/**
 * MIME türü → içeriğin taşıması gereken imza.
 *
 * İMZA DOSYANIN BAŞINDA ARANIR, içinde bir yerde değil. "Başta bir yerde"
 * demek, saldırganın istediği içeriğin önüne dolgu koyup geçmesine izin
 * vermektir.
 */
const IMZALAR: Record<string, (baytlar: Uint8Array) => boolean> = {
  "image/png": (b) =>
    baytlarEsitMi(b, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),

  "image/jpeg": (b) => baytlarEsitMi(b, 0, [0xff, 0xd8, 0xff]),

  /*
   * WebP bir RIFF kabıdır: 0–3 "RIFF", 4–7 uzunluk, 8–11 kap türü "WEBP".
   * Yalnızca "RIFF"e bakmak wav ve avi'yi de geçirirdi.
   */
  "image/webp": (b) =>
    baytlarEsitMi(b, 0, ascii("RIFF")) && baytlarEsitMi(b, 8, ascii("WEBP")),

  /*
   * AVIF bir ISO-BMFF kabıdır: 4–7 "ftyp", 8–11 marka. Marka "avif" (tek
   * görsel) ya da "avis" (dizi) olabilir; ikisi de bu uçlarda geçerli görsel.
   * İlk dört bayt kutu uzunluğudur ve sabit değildir, o yüzden 4'ten başlanır.
   */
  "image/avif": (b) =>
    baytlarEsitMi(b, 4, ascii("ftyp")) &&
    (baytlarEsitMi(b, 8, ascii("avif")) || baytlarEsitMi(b, 8, ascii("avis"))),

  "image/gif": (b) =>
    baytlarEsitMi(b, 0, ascii("GIF87a")) || baytlarEsitMi(b, 0, ascii("GIF89a")),

  "application/pdf": (b) => baytlarEsitMi(b, 0, ascii("%PDF-")),
};

export interface ImzaKarari {
  olurMu: boolean;
  neden?: string;
}

/**
 * Dosyanın ilk baytları, bildirdiği türle uyuşuyor mu?
 *
 * TANINMAYAN TÜR REDDEDİLİR (fail-closed). Tablo, iki ucun kabul ettiği
 * türlerin hepsini kapsıyor; kapsamayan bir tür geldiğinde onu doğrulayamadan
 * geçirmek, kontrolü o tür için sessizce kapatmak olurdu. Yeni bir tür
 * açılacaksa imzası da buraya yazılmalı — kabul listesine eklemek tek başına
 * yetmez ve bu bilinçli.
 *
 * `baytlar` dosyanın tamamı olabilir; yalnızca ilk 12 baytına bakılır.
 */
export function dosyaImzasiUyuyorMu(
  baytlar: Uint8Array,
  mimeTuru: string,
): ImzaKarari {
  const dogrula = IMZALAR[mimeTuru];
  if (!dogrula) {
    return {
      olurMu: false,
      neden: `"${mimeTuru}" türündeki dosyanın içeriği sunucuda doğrulanamıyor.`,
    };
  }

  if (!dogrula(baytlar.subarray(0, AZAMI_ONEK))) {
    return {
      olurMu: false,
      neden: "Dosyanın içeriği uzantısıyla uyuşmuyor.",
    };
  }

  return { olurMu: true };
}
