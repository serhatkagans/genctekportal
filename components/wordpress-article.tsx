import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { KayanGorselGalerisi } from "@/components/zirve-gorsel-galerisi";
import { altyazilariAt, gorselleriGaleriyeAyir, oneCikanTekrariniAt, sanitizeRichText } from "@/lib/content-services/sanitize";
import { gorselYolu } from "@/lib/ortam";
import { categoryName, type WordPressContent } from "@/lib/wordpress-content";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

type ArticleNavigation = {
  previous?: Pick<WordPressContent, "slug" | "title">;
  next?: Pick<WordPressContent, "slug" | "title">;
};

/* Haberlerde gövde iki elden geçiyor: kapak görselinin tekrarı ve görsel
   altyazıları çıkarılıyor. Arşivden gelen sayfalarda altyazı bilgi taşıyor
   olabilir, onlara dokunulmuyor. */
function govdeHtmli(item: WordPressContent) {
  const govde = oneCikanTekrariniAt(item.html, item.featuredImage);
  return item.type === "post" ? altyazilariAt(govde) : govde;
}

export function WordPressArticle({ item, archiveHref = "/haberler", navigation }: { item: WordPressContent; archiveHref?: string; navigation?: ArticleNavigation }) {
  const label = item.type === "page" ? "GençTek" : categoryName(item.categories);
  const hasNavigation = Boolean(navigation?.previous || navigation?.next);
  const temizGovde = sanitizeRichText(govdeHtmli(item));
  const ayrilmis = item.type === "post" ? gorselleriGaleriyeAyir(temizGovde) : { html: temizGovde, gorseller: [] };
  const galeriGorselleri = item.type === "post"
    ? [
        ...(item.featuredImage ? [{ url: item.featuredImage, alt: `${item.title} kapak görseli` }] : []),
        ...ayrilmis.gorseller.filter((gorsel) => gorsel.url !== item.featuredImage),
      ]
    : [];
  return <><Header/><main><article className="wordpress-article">
    <header className="wordpress-article-header"><div className="container wordpress-article-container">
      <Link className="back-link" href={archiveHref}>← {item.type === "page" ? "Ana sayfa" : "Haberler"}</Link>
      <span className="eyebrow">{label}</span><h1>{item.title}</h1>
      {item.excerpt ? <p className="article-lede">{item.excerpt}</p> : null}
      {item.type === "post" ? <p className="wordpress-article-date">{formatDate(item.date)}</p> : null}
    </div></header>
    {item.type === "page" && item.featuredImage ? <div className="container wordpress-article-container wordpress-featured"><img src={gorselYolu(item.featuredImage)} alt="" /></div> : null}
    <div className="container wordpress-article-container">
      {galeriGorselleri.length ? <KayanGorselGalerisi className="haber-icerik-galerisi" gorseller={galeriGorselleri} galeriAdi={item.title} /> : null}
      <div className={`theme-source-body wordpress-content${hasNavigation ? " wordpress-content-has-navigation" : ""}`} dangerouslySetInnerHTML={{ __html: ayrilmis.html }} />
      {hasNavigation ? <nav className="haber-gezinme" aria-label="Haberler arasında gezinme">
        {navigation?.previous ? <Link className="haber-gezinme-baglanti haber-gezinme-onceki" href={`/haberler/${navigation.previous.slug}`}>
          <span>← Önceki Haber</span><strong>{navigation.previous.title}</strong>
        </Link> : null}
        {navigation?.next ? <Link className="haber-gezinme-baglanti haber-gezinme-sonraki" href={`/haberler/${navigation.next.slug}`}>
          <span>Sonraki Haber →</span><strong>{navigation.next.title}</strong>
        </Link> : null}
      </nav> : null}
    </div>
  </article></main><Footer/></>;
}
