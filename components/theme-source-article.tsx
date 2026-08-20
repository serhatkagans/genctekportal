import Link from "next/link";
import sourceContent from "@/lib/generated/theme-source-content.json";
import { sanitizeRichText } from "@/lib/content-services/sanitize";

type SourceEntry = { title: string; publishedAt: string; sourceUrl: string; html: string; images: string[]; documents?: string[]; documentUrl?: string };

export function ThemeSourceArticle({ slug }: { slug: string }) {
  const entry = (sourceContent as Record<string, SourceEntry>)[slug];
  if (!entry) return null;
  const date = new Intl.DateTimeFormat("tr-TR", { day:"numeric", month:"long", year:"numeric" }).format(new Date(entry.publishedAt));
  return <section className="theme-source-section"><div className="container">
    <article className="theme-source-article">
      <header><span className="eyebrow">GençTek arşivinden tam içerik</span><h2>{entry.title}</h2><p className="theme-source-meta">Yayın tarihi: {date}</p></header>
      <div className="theme-source-body" dangerouslySetInnerHTML={{ __html: sanitizeRichText(entry.html) }} />
      <footer>
        {entry.documentUrl ? <Link className="button button-secondary" href={entry.documentUrl} target="_blank">Dijital Yürüyüş bilgi notunu aç</Link> : null}
        <Link className="text-link" href={entry.sourceUrl} target="_blank" rel="noreferrer">Kaynak yazıyı görüntüle ↗</Link>
      </footer>
    </article>
  </div></section>;
}
