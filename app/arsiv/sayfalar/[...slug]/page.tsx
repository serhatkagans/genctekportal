import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordPressArticle } from "@/components/wordpress-article";
import { wordpressPages } from "@/lib/wordpress-content";

/* ÜST MENÜ VERİTABANINDAN GELİYOR (4 Eylül 2026): Hakkında başlıkları ve zirve
   listesi panelden değişiyor. Bu sayfa derleme anında basılsaydı menüsü o günün
   hâlinde donar, panelden eklenen başlık burada görünmezdi. */
export const dynamic = "force-dynamic";

function findPage(parts: string[]) {
  const value = parts.join("/");
  return wordpressPages.find((item) => item.path === (value === "home" ? "" : value));
}
export default async function ImportedPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const item = findPage((await params).slug);
  if (!item) notFound();
  return <WordPressArticle item={item} archiveHref="/arsiv/sayfalar"/>;
}
