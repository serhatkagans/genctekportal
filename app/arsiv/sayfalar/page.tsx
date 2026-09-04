import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { wordpressPages } from "@/lib/wordpress-content";

/* ÜST MENÜ VERİTABANINDAN GELİYOR (4 Eylül 2026): Hakkında başlıkları ve zirve
   listesi panelden değişiyor. Bu sayfa derleme anında basılsaydı menüsü o günün
   hâlinde donar, panelden eklenen başlık burada görünmezdi. */
export const dynamic = "force-dynamic";

export default function PageArchive() {
  return <><Header/><main><section className="page-hero"><div className="container"><span className="eyebrow">Tam site arşivi</span><h1>Sabit sayfalar</h1><p>Kaynak GençTek sitesinden içerikleri ve medyalarıyla aktarılan tüm sabit sayfalar.</p></div></section><section className="section"><div className="container imported-page-list">{wordpressPages.map((page)=><Link href={`/arsiv/sayfalar/${page.path || "home"}`} key={page.id}><span>{page.parent ? "Alt sayfa" : "Sayfa"}</span><strong>{page.title}</strong><small>/{page.path}</small></Link>)}</div></section></main><Footer/></>;
}
