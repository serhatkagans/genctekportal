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
};

export const YARDIMLASMA_GRUPLARI: YardimlasmaGrubu[] = [
  { slug: "meb-robot-yarismasi", ad: "MEB Robot Yarışması", gorsel: "/medya/yardimlasma/meb-robot-yarismasi.webp" },
  { slug: "teknofest", ad: "TEKNOFEST", gorsel: "/medya/yardimlasma/teknofest.webp" },
  { slug: "tubitak", ad: "TÜBİTAK", gorsel: "/medya/yardimlasma/tubitak.webp" },
  { slug: "oyun-tasarimi", ad: "Oyun Tasarımı", gorsel: "/medya/yardimlasma/oyun-tasarimi.webp" },
];

export function yardimlasmaGrubuBul(slug: string) {
  return YARDIMLASMA_GRUPLARI.find((grup) => grup.slug === slug);
}

