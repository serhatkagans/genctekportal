import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordPressArticle } from "@/components/wordpress-article";
import { haberBul, haberDetayi } from "@/lib/haber";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = await haberBul((await params).slug);
  return item ? { title: item.title, description: item.excerpt || undefined } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const detay = await haberDetayi((await params).slug);
  if (!detay) notFound();

  return <WordPressArticle item={detay.item} navigation={{ previous: detay.previous, next: detay.next }}/>;
}
