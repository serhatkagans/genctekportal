import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeCard } from "@/components/theme-card";
import { temalariOku } from "@/lib/tema";
import { YARDIMLASMA_GRUPLARI } from "@/lib/yardimlasma";
import { gorselYolu } from "@/lib/ortam";
import { Icon } from "@/components/icons";
import Link from "next/link";

export const metadata: Metadata = { title: "Çalışma Grupları", description: "GençTek çalışma gruplarını keşfedin." };

// Temalar panelden düzenlenebildiği için her istekte dosyadan okunur.
export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  const themes = await temalariOku();
  return <><Header/><main>
    <section className="page-hero"><div className="container"><span className="eyebrow">{themes.length} farklı üretim yolu</span><h1>Çalışma Grupları</h1><p>İlgini seç, odak alanlarını keşfet, ekibini bul ve üretmeye başla.</p></div></section>
    <section className="section"><div className="container theme-grid theme-grid-page">{themes.map((theme,index)=><ThemeCard theme={theme} index={index} headingLevel={2} key={theme.slug}/>)}</div></section>

    {/* YARDIMLAŞMA GRUPLARI (1 Eylül 2026 · istek: "burada yeni kartlar
        gelecek ama yardımlaşma grupları başlığında olsun"). Çalışma
        gruplarının altında ayrı bir başlık: bunlar bir üretim alanını değil,
        belirli bir yarışma çevresinde yardımlaşan grupları anlatıyor.
        Tanıtım metinleri gelene kadar kartlarda yalnızca ad ve görsel var. */}
    <section className="section themes-section">
      <div className="container">
        <div className="section-heading"><div><span className="eyebrow">Birlikte hazırlanın</span><h2>Yardımlaşma Grupları</h2></div></div>
        <div className="program-izgara">
          {YARDIMLASMA_GRUPLARI.map((grup, sira) => (
            <Link className="program-karti" href={`/yardimlasma/${grup.slug}`} key={grup.slug}>
              <span className="program-kapak"><img src={gorselYolu(grup.gorsel)} alt="" loading="lazy" decoding="async" /></span>
              <span className="program-govde">
                <span className="program-numara">{String(sira + 1).padStart(2, "0")}</span>
                <h3>{grup.ad}</h3>
                <span className="program-git">Ayrıntılar <Icon name="arrow" /></span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </main><Footer/></>;
}
