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
  const item = await haberBul((await params).slug);
  if (!item) notFound();
  return <WordPressArticle item={item}/>;
}
