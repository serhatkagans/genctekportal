import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordPressArticle } from "@/components/wordpress-article";
import { getWordPressPage } from "@/lib/wordpress-content";

export const metadata: Metadata = {
  title: "2. GençTek Zirvesi 2026",
  description: "2. GençTek Zirvesi 2026 programı ve etkinlik içeriği.",
};

export default function SecondSummitPage() {
  const item = getWordPressPage("2-genctek-zirvesi-2026");
  if (!item) notFound();
  return <WordPressArticle item={item}/>;
}
