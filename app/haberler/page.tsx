import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WordPressCard } from "@/components/wordpress-card";
import { haberleriOku } from "@/lib/haber";

export const metadata: Metadata = { title: "Haberler", description: "GençTek etkinlik, duyuru ve ekosistem haberleri." };

// Panelden yapılan düzenleme anında yansısın diye her istekte dosyadan okunur.
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const haberler = await haberleriOku();
  return <><Header/><main><section className="page-hero"><div className="container"><span className="eyebrow">Güncel</span><h1>Haberler ve etkinlikler</h1><p>GençTek arşivindeki tüm haberler, etkinlikler ve duyurular.</p></div></section><section className="section"><div className="container"><div className="archive-heading"><div className="archive-summary"><strong>{haberler.length}</strong><span>yayımlanmış içerik</span></div><Link className="button button-secondary" href="/arsiv/sayfalar">Sabit sayfalar arşivi</Link></div><div className="card-grid wordpress-grid">{haberler.map((item)=><WordPressCard item={item} key={item.id}/>)}</div></div></section></main><Footer/></>;
}
