/*
 * YARDIMLAŞMA GRUPLARI (1 Eylül 2026 · istek: "yardımlaşma grupları
 * başlığında olsun … meb robot yarışması, teknofest, tübitak, oyun tasarımı
 * şeklinde 4 bölüm. yazıları sonra gelecek").
 *
 * Çalışma gruplarından ayrı bir liste: onlar bir üretim alanını (yapay zekâ,
 * robotik…) anlatıyor, bunlar belirli bir yarışma/etkinlik çevresinde
 * yardımlaşan grupları. Kayıtlar burada sabit duruyor — panelde düzenlenen
 * çalışma gruplarının aksine dört başlık ve tanıtım metinleri henüz gelmedi.
 *
 * METİN GELMEDEN DE SAYFA VAR: kart açılıyor, sayfa metnin hazırlandığını
 * söylüyor. Tanıtım yazıları geldiğinde `metin` alanına yazılacak.
 */
export type YardimlasmaGrubu = {
  slug: string;
  ad: string;
  gorsel: string;
  metin?: string;
  /*
   * Bu gruba taşınmış çalışma grubu arşivi (1 Eylül 2026 · istek: "oyun
   * tasarımında üst yazı kalsın, alttaki eğitijam içeriği yeni kart sayfası
   * olsun … bölelim yani bunu").
   *
   * EğitiJAM maratonu ve finalistleri, oyun tasarımı çalışma grubunun tanıtım
   * metninin altında duruyordu: sayfanın yarısı grubu, yarısı bir etkinliği
   * anlatıyordu. Arşiv içeriği burada basılıyor, çalışma grubu sayfasında
   * basılmıyor — kaynak tek yerde, iki sayfada birden görünmüyor.
   */
  arsivTemasi?: string;
};

export const YARDIMLASMA_GRUPLARI: YardimlasmaGrubu[] = [
  { slug: "meb-robot-yarismasi", ad: "MEB Robot Yarışması", gorsel: "/medya/yardimlasma/meb-robot-yarismasi.webp" },
  { slug: "teknofest", ad: "TEKNOFEST", gorsel: "/medya/yardimlasma/teknofest.webp" },
  { slug: "tubitak", ad: "TÜBİTAK", gorsel: "/medya/yardimlasma/tubitak.webp" },
  { slug: "oyun-tasarimi", ad: "Oyun Tasarımı", gorsel: "/medya/yardimlasma/oyun-tasarimi.webp", arsivTemasi: "oyun-tasarimi-egitijam" },
];

export function yardimlasmaGrubuBul(slug: string) {
  return YARDIMLASMA_GRUPLARI.find((grup) => grup.slug === slug);
}

/** Arşivi bir yardımlaşma grubuna taşınmış çalışma grupları. */
export function arsiviTasinanTema(temaSlug: string) {
  return YARDIMLASMA_GRUPLARI.some((grup) => grup.arsivTemasi === temaSlug);
}
