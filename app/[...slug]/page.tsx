import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordPressArticle } from "@/components/wordpress-article";
import { haberleriOku } from "@/lib/haber";
import { wordpressPages, type WordPressContent } from "@/lib/wordpress-content";

export const dynamic = "force-dynamic";

const reserved = new Set(["haberler", "temalar", "hakkinda", "il-koordinatorleri", "zirve", "2-genctek-zirvesi-2026", "katilim", "kvkk", "giris", "mfa", "panel", "yonetim", "davet", "hesabim", "parola-sifirla", "arsiv", "api"]);

// Haberler artık düzenlenebilir depodan geliyor; sabit sayfalar içe aktarım çıktısında.
async function tumIcerik(): Promise<WordPressContent[]> {
  return [...wordpressPages, ...(await haberleriOku())];
}

async function yoldanBul(contentPath: string) {
  const normalized = decodeURIComponent(contentPath).replace(/^\/+|\/+$/g, "");
  return (await tumIcerik()).find((item) => item.path === normalized);
}

export async function generateStaticParams() {
  return (await tumIcerik()).filter((item) => item.path && !reserved.has(item.path.split("/")[0])).map((item) => ({ slug: item.path.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const item = await yoldanBul((await params).slug.join("/"));
  return item ? { title: item.title, description: item.excerpt || undefined } : {};
}

export default async function LegacyWordPressPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const parts = (await params).slug;
  if (reserved.has(parts[0])) notFound();
  // Yönlendirmeler proxy.ts'te, render başlamadan önce uygulanıyor (gerçek 301).
  const item = await yoldanBul(parts.join("/"));
  if (!item) notFound();
  return <WordPressArticle item={item}/>;
}
