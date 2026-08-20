import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordPressArticle } from "@/components/wordpress-article";
import { wordpressPages } from "@/lib/wordpress-content";

function findPage(parts: string[]) {
  const value = parts.join("/");
  return wordpressPages.find((item) => item.path === (value === "home" ? "" : value));
}
export function generateStaticParams() { return wordpressPages.map(({ path }) => ({ slug: (path || "home").split("/") })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const item = findPage((await params).slug);
  return item ? { title: item.title, description: item.excerpt || undefined } : {};
}
export default async function ImportedPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const item = findPage((await params).slug);
  if (!item) notFound();
  return <WordPressArticle item={item} archiveHref="/arsiv/sayfalar"/>;
}
