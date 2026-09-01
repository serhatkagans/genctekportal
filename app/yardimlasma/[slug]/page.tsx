import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EgitijamProgram } from "@/components/egitijam-program";
import { ThemeSourceArticle } from "@/components/theme-source-article";
import { YARDIMLASMA_GRUPLARI, yardimlasmaGrubuBul } from "@/lib/yardimlasma";

/*
 * YARDIMLAŞMA GRUBU SAYFASI.
 *
 * EĞİTİJAM İÇERİĞİ BURAYA TAŞINDI (1 Eylül 2026 · istek: "oyun tasarımında
 * üst yazı kalsın, alttaki eğitijam içeriği yeni kart sayfası olsun").
 * Çalışma grubu sayfasında tanıtım metninin altında duran uzun EğitiJAM
 * programı, artık Oyun Tasarımı yardımlaşma grubunun kendi sayfasında.
 */
export function generateStaticParams() {
  return YARDIMLASMA_GRUPLARI.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const grup = yardimlasmaGrubuBul((await params).slug);
  return grup ? { title: `${grup.ad} · GençTek` } : {};
}

export default async function YardimlasmaGrubuSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const grup = yardimlasmaGrubuBul((await params).slug);
  if (!grup) notFound();

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container program-detay">
          <Link className="back-link" href="/temalar">← Çalışma Grupları</Link>
          <span className="eyebrow">Yardımlaşma grubu</span>
          <h1>{grup.ad}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container program-detay">
          {grup.metin
            ? <p className="program-detay-metin">{grup.metin}</p>
            : <p className="program-detay-metin">Bu yardımlaşma grubunun tanıtım metni hazırlanıyor.</p>}
        </div>
      </section>

      {grup.slug === "oyun-tasarimi" ? <EgitijamProgram /> : null}
      {grup.arsivTemasi ? <ThemeSourceArticle slug={grup.arsivTemasi} /> : null}
    </main>
    <Footer />
  </>;
}
