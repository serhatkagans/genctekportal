import type { MetadataRoute } from "next";
import { haberleriOku } from "@/lib/haber";
import { temalariOku } from "@/lib/tema";
import { wordpressPages } from "@/lib/wordpress-content";
import { siteAdresi } from "@/lib/ortam";
import { temelEtkinlikSluglari } from "@/lib/temel-etkinlik";
import { hakkindaSayfalariniOku, baglantiKartiMi } from "@/lib/hakkinda";
import { zirveleriOku } from "@/lib/zirve";
import { yardimlasmaGruplariniOku } from "@/lib/yardimlasma";

// Temalar veritabanından geliyor; öntanımlı davranışta bu dosya derleme
// sırasında üretilirdi ve build'i veritabanına bağımlı kılardı. Sayfaların
// tamamı zaten force-dynamic, site haritası da istek anında üretiliyor.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Site haritası bu sitenin adreslerini listeler; eskiden kaynak sitenin
  // adresi yazılıydı ve arama motorlarına kapanacak bir alan adı bildiriliyordu.
  const base = siteAdresi();
  // Hakkında sayfaları elle yazılıydı; 4 Eylül 2026'da veritabanına taşındılar ve
  // panelden ekleniyorlar — liste de oradan geliyor. Bağlantı kartları (Çalışma
  // Grupları gibi) burada yok: hedefleri zaten aşağıda ya da kendi satırında.
  const routes = ["", "/haberler", "/temalar", "/hakkinda/il-koordinatorleri", "/hakkinda/temel-etkinlikler", "/etkinlikler", "/katilim", "/kvkk"];
  // Zirve adresleri de tabloda: her yeni zirve site haritasına kendiliğinden girsin.
  const zirveler = await zirveleriOku();
  // Yardımlaşma grupları panelden ekleniyor; site haritasına da oradan girsin.
  const yardimlasmaGruplari = await yardimlasmaGruplariniOku();
  const hakkindaSayfalari = (await hakkindaSayfalariniOku()).filter((s) => !baglantiKartiMi(s));
  const haberler = await haberleriOku();
  const themes = await temalariOku();
  return [
    // Kök girdi eğik çizgili yazılır: eğik çizgisiz hâli (".../genctekportal")
    // kanonik adrese 301 dönüyor ve site haritasının ilk satırı yönlendirme
    // gösteriyordu.
    ...routes.map(route => ({ url: route ? `${base}${route}` : `${base}/`, lastModified: new Date(), changeFrequency: route === "" ? "daily" as const : "weekly" as const, priority: route === "" ? 1 : .7 })),
    ...yardimlasmaGruplari.map(g => ({ url: `${base}/yardimlasma/${g.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .6 })),
    ...zirveler.map(z => ({ url: `${base}${z.yol}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .7 })),
    ...hakkindaSayfalari.map(s => ({ url: `${base}/hakkinda/${s.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .7 })),
    ...haberler.map(a => ({ url: `${base}/haberler/${a.slug}`, lastModified: new Date(a.modified), changeFrequency: "monthly" as const, priority: .65 })),
    ...wordpressPages.filter(p => p.path).map(p => ({ url: `${base}/${p.path}`, lastModified: new Date(p.modified), changeFrequency: "monthly" as const, priority: .7 })),
    ...themes.map(t => ({ url: `${base}/temalar/${t.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .7 })),
    ...(await temelEtkinlikSluglari()).map(slug => ({ url: `${base}/hakkinda/temel-etkinlikler/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .6 })),
  ];
}
