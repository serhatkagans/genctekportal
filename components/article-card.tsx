import Link from "next/link";
import type { Article } from "@/lib/content";
import { Icon } from "./icons";

export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  return (
    <Link className="content-card" href={`/haberler/${article.slug}`}>
      <div className={`card-visual visual-${index % 3}`} aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></div>
      <div className="card-body">
        <span className="chip">{article.category}</span>
        <h3>{article.title}</h3>
        <p>{article.summary}</p>
        <div className="meta-row"><span><Icon name="calendar" />{article.publishedAt}</span><span><Icon name="location" />{article.location}</span></div>
      </div>
    </Link>
  );
}
