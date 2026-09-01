import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordPressArticle } from "@/components/wordpress-article";
import { haberBul, haberleriOku } from "@/lib/haber";

export const dynamic = "force-dynamic";

export async function generateStaticParams() { return (await haberleriOku()).map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = await haberBul((await params).slug);
  return item ? { title: item.title, description: item.excerpt || undefined } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const haberler = await haberleriOku();
  const index = haberler.findIndex((haber) => haber.slug === slug);
  if (index < 0) notFound();

  const item = haberler[index];
  const previous = haberler[index + 1];
  const next = haberler[index - 1];

  return <WordPressArticle item={item} navigation={{ previous, next }}/>;
}
