import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { EgitijamProgram } from "@/components/egitijam-program";
import { ThemeOfficialProgram } from "@/components/theme-official-program";
import { ThemeSourceArticle } from "@/components/theme-source-article";
import { temaBul, temaGorseli, temalariOku } from "@/lib/tema";
import { getThemeProgram } from "@/lib/theme-programs";

// Temalar panelden düzenlenebildiği için her istekte dosyadan okunur.
export const dynamic = "force-dynamic";

export async function generateStaticParams() { return (await temalariOku()).map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const theme = await temaBul(slug);
  return theme ? { title: theme.name, description: theme.shortDescription } : {};
}

export default async function ThemeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const theme = await temaBul(slug); if (!theme) notFound();
  const themes = await temalariOku();
  const index = themes.findIndex((item) => item.slug === theme.slug);
  const program = getThemeProgram(theme.slug);
  return <><Header/><main>
    <article className="theme-detail">
      <header className="theme-detail-hero"><div className="container theme-detail-grid">
        <div><Link className="back-link" href="/temalar">← Tüm temalar</Link><span className="eyebrow">Tema {String(index + 1).padStart(2,"0")} / {themes.length}</span><h1>{theme.name}</h1><p>{theme.shortDescription}</p></div>
        <div className="theme-detail-image"><Image src={temaGorseli(theme)} alt={`${theme.name} tema görseli`} fill priority sizes="(max-width: 900px) 100vw, 44vw" /></div>
      </div></header>
      <section className="section"><div className="container theme-detail-content">
        <div className="theme-intro"><span className="eyebrow">Tema hakkında</span><h2>Keşfet, dene, birlikte üret.</h2><p>{theme.description}</p></div>
        <div className="theme-detail-lists">
          <section><span className="theme-list-label">Odak alanları</span><h2>Neler öğreneceksin?</h2><ol>{theme.focus.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,"0")}</span>{item}</li>)}</ol></section>
          <section><span className="theme-list-label">Üretim çıktıları</span><h2>Neler geliştirebilirsin?</h2><ol>{theme.outcomes.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,"0")}</span>{item}</li>)}</ol></section>
        </div>
      </div></section>
      {theme.slug === "oyun-tasarimi-egitijam" ? <EgitijamProgram /> : null}
      {program ? <ThemeOfficialProgram program={program} /> : null}
      <ThemeSourceArticle slug={theme.slug} />
      <section className="section theme-detail-cta"><div className="container join-card"><div><span className="eyebrow eyebrow-light">Bu tema seni heyecanlandırdı mı?</span><h2>{theme.name} ekibinde yerini al.</h2><p>Öğrenci veya danışman öğretmen olarak GençTek ekosistemine katıl.</p></div><Link className="button button-light" href="/katilim">Katılım formuna git <Icon name="arrow"/></Link></div></section>
    </article>
  </main><Footer/></>;
}
