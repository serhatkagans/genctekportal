import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { sanitizeRichText } from "@/lib/content-services/sanitize";
import { gorselYolu } from "@/lib/ortam";
import { categoryName, type WordPressContent } from "@/lib/wordpress-content";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export function WordPressArticle({ item, archiveHref = "/haberler" }: { item: WordPressContent; archiveHref?: string }) {
  const label = item.type === "page" ? "GençTek" : categoryName(item.categories);
  return <><Header/><main><article className="wordpress-article">
    <header className="wordpress-article-header"><div className="container wordpress-article-container">
      <Link className="back-link" href={archiveHref}>← {item.type === "page" ? "Ana sayfa" : "Haberler"}</Link>
      <span className="eyebrow">{label}</span><h1>{item.title}</h1>
      {item.excerpt ? <p className="article-lede">{item.excerpt}</p> : null}
      {item.type === "post" ? <p className="wordpress-article-date">{formatDate(item.date)}</p> : null}
    </div></header>
    {item.featuredImage ? <div className="container wordpress-featured"><img src={gorselYolu(item.featuredImage)} alt="" /></div> : null}
    <div className="container wordpress-article-container"><div className="theme-source-body wordpress-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.html) }} /></div>
  </article></main><Footer/></>;
}
