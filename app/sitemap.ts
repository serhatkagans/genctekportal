import type { MetadataRoute } from "next";
import { haberleriOku } from "@/lib/haber";
import { temalariOku } from "@/lib/tema";
import { wordpressPages } from "@/lib/wordpress-content";
import { siteAdresi } from "@/lib/ortam";
import { temelEtkinlikSluglari } from "@/lib/temel-etkinlik";

// Temalar veritabanından geliyor; öntanımlı davranışta bu dosya derleme
// sırasında üretilirdi ve build'i veritabanına bağımlı kılardı. Sayfaların
// tamamı zaten force-dynamic, site haritası da istek anında üretiliyor.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Site haritası bu sitenin adreslerini listeler; eskiden kaynak sitenin
  // adresi yazılıydı ve arama motorlarına kapanacak bir alan adı bildiriliyordu.
  const base = siteAdresi();
  const routes = ["", "/haberler", "/temalar", "/hakkinda/il-koordinatorleri", "/hakkinda/genctek-nedir", "/hakkinda/amaclar", "/hakkinda/temel-etkinlikler", "/hakkinda/logolar", "/etkinlikler", "/zirve", "/katilim", "/kvkk"];
  const haberler = await haberleriOku();
  const themes = await temalariOku();
  return [
    // Kök girdi eğik çizgili yazılır: eğik çizgisiz hâli (".../genctekportal")
    // kanonik adrese 301 dönüyor ve site haritasının ilk satırı yönlendirme
    // gösteriyordu.
    ...routes.map(route => ({ url: route ? `${base}${route}` : `${base}/`, lastModified: new Date(), changeFrequency: route === "" ? "daily" as const : "weekly" as const, priority: route === "" ? 1 : .7 })),
    ...haberler.map(a => ({ url: `${base}/haberler/${a.slug}`, lastModified: new Date(a.modified), changeFrequency: "monthly" as const, priority: .65 })),
    ...wordpressPages.filter(p => p.path).map(p => ({ url: `${base}/${p.path}`, lastModified: new Date(p.modified), changeFrequency: "monthly" as const, priority: .7 })),
    ...themes.map(t => ({ url: `${base}/temalar/${t.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .7 })),
    ...temelEtkinlikSluglari().map(slug => ({ url: `${base}/hakkinda/temel-etkinlikler/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .6 })),
  ];
}
