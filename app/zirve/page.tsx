import { notFound } from "next/navigation";
import { WordPressArticle } from "@/components/wordpress-article";
import { getWordPressPage } from "@/lib/wordpress-content";
export default function SummitPage() { const item=getWordPressPage("zirve"); if(!item) notFound(); return <WordPressArticle item={item}/>; }
