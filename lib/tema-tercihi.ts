/**
 * GÖRÜNÜM TEMASI TERCİHİ — ÇEREZ ADI VE TİPİ.
 *
 * Ayrı bir dosyada duruyor çünkü hem sunucu (app/layout.tsx, çerezi okuyup
 * `<html data-theme>` basıyor) hem de istemci (components/tema-baglami.tsx,
 * çerezi yazıyor) kullanıyor. Sabiti istemci modülünden almak İŞE YARAMAZ:
 * "use client" modülünden dışa aktarılan bir değer sunucu bileşenine istemci
 * referansı olarak gelir — 4 Eylül 2026'da tam da bu yaşandı, `cookies().get()`
 * çerez adı yerine bir fonksiyon alıp tercihi hiç göremedi.
 *
 * Dosya adı "tema-tercihi": lib/tema.ts ÇALIŞMA GRUPLARI (üretim temaları)
 * modülü, bununla ilgisi yok.
 */
export type Tema = "acik" | "kirmizi";

export const TEMA_CEREZI = "genctek-tema";

export function temaCoz(deger: string | undefined): Tema {
  return deger === "kirmizi" ? "kirmizi" : "acik";
}
