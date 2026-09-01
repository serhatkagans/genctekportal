import Link from "next/link";
import { gorselleriAt, sanitizeRichText } from "@/lib/content-services/sanitize";
import { TEMA_ARSIV_CAPASI, temaKaynagi } from "@/lib/tema-kaynak";

export function ThemeSourceArticle({ slug }: { slug: string }) {
  const entry = temaKaynagi(slug);
  if (!entry) return null;
  const date = new Intl.DateTimeFormat("tr-TR", { day:"numeric", month:"long", year:"numeric" }).format(new Date(entry.publishedAt));
  return <section className="theme-source-section" id={TEMA_ARSIV_CAPASI}><div className="container">
    <article className="theme-source-article">
      <header><span className="eyebrow">GençTek arşivinden tam içerik</span><h2>{entry.title}</h2><p className="theme-source-meta">Yayın tarihi: {date}</p></header>
      <div className="theme-source-body" dangerouslySetInnerHTML={{ __html: sanitizeRichText(gorselleriAt(entry.html)) }} />
      <footer>
        {entry.documentUrl ? <Link className="button button-secondary" href={entry.documentUrl} target="_blank">Dijital Yürüyüş bilgi notunu aç</Link> : null}
        <span className="theme-source-credit">Özgün yayın: GençTek arşivi</span>
      </footer>
    </article>
  </div></section>;
}
