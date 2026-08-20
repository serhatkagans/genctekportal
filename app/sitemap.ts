import type { MetadataRoute } from "next";
import { haberleriOku } from "@/lib/haber";
import { temalariOku } from "@/lib/tema";
import { wordpressPages } from "@/lib/wordpress-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://genctek.eba.gov.tr";
  const routes = ["", "/haberler", "/temalar", "/hakkinda", "/hakkinda/il-koordinatorleri", "/hakkinda/genctek-nedir", "/hakkinda/amaclar", "/hakkinda/temel-etkinlikler", "/hakkinda/logolar", "/etkinlikler", "/zirve", "/katilim", "/kvkk"];
  const haberler = await haberleriOku();
  const themes = await temalariOku();
  return [
    ...routes.map(route => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "daily" as const : "weekly" as const, priority: route === "" ? 1 : .7 })),
    ...haberler.map(a => ({ url: `${base}/haberler/${a.slug}`, lastModified: new Date(a.modified), changeFrequency: "monthly" as const, priority: .65 })),
    ...wordpressPages.filter(p => p.path).map(p => ({ url: `${base}/${p.path}`, lastModified: new Date(p.modified), changeFrequency: "monthly" as const, priority: .7 })),
    ...themes.map(t => ({ url: `${base}/temalar/${t.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .7 })),
  ];
}
