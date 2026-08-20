import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeCard } from "@/components/theme-card";
import { temalariOku } from "@/lib/tema";

export const metadata: Metadata = { title: "Teknoloji Temaları", description: "GençTek'in teknoloji ve üretim temalarını keşfedin." };

// Temalar panelden düzenlenebildiği için her istekte dosyadan okunur.
export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  const themes = await temalariOku();
  return <><Header/><main>
    <section className="page-hero"><div className="container"><span className="eyebrow">{themes.length} farklı üretim yolu</span><h1>Teknoloji temaları</h1><p>İlgini seç, odak alanlarını keşfet, ekibini bul ve üretmeye başla.</p></div></section>
    <section className="section"><div className="container theme-grid theme-grid-page">{themes.map((theme,index)=><ThemeCard theme={theme} index={index} headingLevel={2} key={theme.slug}/>)}</div></section>
  </main><Footer/></>;
}
