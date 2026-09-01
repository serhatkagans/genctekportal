import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { ThemeOfficialProgram } from "@/components/theme-official-program";
import { ThemeSourceArticle } from "@/components/theme-source-article";
import { genctekGirisAdresi } from "@/lib/genctek-baglanti";
import { temaBul, temalariOku } from "@/lib/tema";
import { getThemeProgram } from "@/lib/theme-programs";
import { EgitijamProgram } from "@/components/egitijam-program";
import { temaKaynagi } from "@/lib/tema-kaynak";

// Temalar panelden düzenlenebildiği için her istekte dosyadan okunur.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const theme = await temaBul(slug);
  return theme ? { title: theme.name, description: theme.shortDescription } : {};
}

export default async function ThemeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const theme = await temaBul(slug); if (!theme) notFound();
  const themes = await temalariOku();
  const index = themes.findIndex((item) => item.slug === theme.slug);
  const program = getThemeProgram(theme.slug);
  const arsivVar = Boolean(temaKaynagi(theme.slug));
  return <><Header/><main>
    <article className="theme-detail">
      <header className="theme-detail-hero"><div className="container theme-detail-grid">
        <div><Link className="back-link" href="/temalar">← Tüm çalışma grupları</Link><span className="eyebrow">Çalışma grubu {String(index + 1).padStart(2,"0")} / {themes.length}</span><h1>{theme.name}</h1><p>{theme.shortDescription}</p></div>
      </div></header>
      {/*
        SAYFADA YALNIZCA GÖVDE METNİ (1 Eylül 2026 · istekler: "çalışma
        gruplarında sayfa içi fotoları sil ama kartlarda kalsın" ve "Keşfet,
        dene, birlikte üret. / ODAK ALANLARI / ÜRETİM ÇIKTILARI … bu yazıları
        kaldır, sadece gövde metni kalsın").

        Kapak görseli, tanıtım başlığı ve iki liste kalktı. Odak alanları ile
        üretim çıktıları kayıtta duruyor (panelden düzenlenebiliyor); sayfada
        basılmıyorlar.
      */}
      <section className="section"><div className="container theme-detail-content">
        <p className="theme-govde-metni">{theme.description}</p>
      </div></section>
      {program ? <ThemeOfficialProgram program={program} arsivVar={arsivVar} /> : null}
      {theme.slug === "egitijam" ? <EgitijamProgram /> : null}
      <ThemeSourceArticle slug={theme.slug} />
      <section className="section theme-detail-cta"><div className="container join-card"><div><span className="eyebrow eyebrow-light">Bu çalışma grubu seni heyecanlandırdı mı?</span><h2>{theme.name} ekibinde yerini al.</h2><p>Öğrenci veya danışman öğretmen olarak GençTek ekosistemine katıl.</p></div><a className="button button-light" href={genctekGirisAdresi()}>Platforma giriş <Icon name="arrow"/></a></div></section>
    </article>
  </main><Footer/></>;
}
