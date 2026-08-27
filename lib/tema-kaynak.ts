import sourceContent from "@/lib/generated/theme-source-content.json";

/*
 * ARŞİVLENMİŞ KAYNAK YAZILAR.
 *
 * genctek.eba.gov.tr'deki duyuruların metni, görselleri ve belgeleri
 * scripts/import-theme-content.mjs ile bir kez indirildi: yazı
 * lib/generated/theme-source-content.json'da, görsel ve PDF'ler
 * public/temalar/icerik altında duruyor. Yani içerik BİZDE — tema sayfasındaki
 * "GençTek arşivinden tam içerik" bölümü onu basıyor.
 *
 * Bu yüzden sayfadaki düğmeler dış siteye değil, aynı sayfadaki arşiv
 * bölümüne iniyor (27 Ağustos 2026). Dışarıya yalnızca künye niteliğindeki
 * "özgün yayın" bağlantısı kalıyor.
 */
export type TemaKaynagi = {
  title: string;
  publishedAt: string;
  sourceUrl: string;
  html: string;
  images: string[];
  documents?: string[];
  documentUrl?: string;
};

// Arşiv bölümünün çapası; düğmeler buraya iniyor.
export const TEMA_ARSIV_CAPASI = "genctek-arsivi";

export function temaKaynagi(slug: string): TemaKaynagi | undefined {
  return (sourceContent as Record<string, TemaKaynagi>)[slug];
}
