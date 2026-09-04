import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HakkindaGovdesi } from "@/components/hakkinda-govdesi";
import { baglantiKartiMi, hakkindaSayfasiBul } from "@/lib/hakkinda";

/**
 * HAKKINDA ALT SAYFALARI (4 Eylül 2026 · istek: "yap tam çözüm").
 *
 * Üç sayfa (genctek-nedir, amaclar, logolar) buraya taşındı: her biri kendi
 * dosyasıydı, içerikleri artık "Page" tablosunda ve panelden düzenleniyor.
 *
 * İKİ SAYFA DOSYA OLARAK KALDI: `/hakkinda/temel-etkinlikler` ve
 * `/hakkinda/il-koordinatorleri`. İkisi de canlı veriyle çalışıyor (biri
 * program listesi ve alt sayfaları, öbürü 81 ilin koordinatör rehberi) —
 * blok gövdesine sığmazlar. Next.js'te sabit segment dinamik olana baskın
 * geldiği için burasıyla çakışmıyorlar; kart listesinde ise "bağlantı kartı"
 * olarak duruyorlar (bkz. lib/hakkinda.ts · linkUrl).
 *
 * force-dynamic: içerik veritabanından geliyor ve panelden yapılan düzenleme
 * kaydedilir kaydedilmez sitede görünmeli (tema ve haber sayfalarındaki karar).
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const sayfa = await hakkindaSayfasiBul((await params).slug);
  if (!sayfa) return {};
  const baslik = sayfa.seoBaslik || `${sayfa.sayfaBasligi || sayfa.baslik} · GençTek`;
  return { title: baslik, description: sayfa.seoAciklama || sayfa.ozet };
}

export default async function HakkindaSayfasiEkrani({ params }: { params: Promise<{ slug: string }> }) {
  const sayfa = await hakkindaSayfasiBul((await params).slug);

  // Taslak sayfa da 404: panelde hazırlanan, henüz yayımlanmamış bir başlığın
  // adresi tahminle bulunabilir olmamalı.
  if (!sayfa || !sayfa.yayinda) notFound();

  // Bağlantı kartının kendi gövdesi yok; adresi doğrudan yazan kişi hedefe
  // gitsin — boş bir sayfa göstermek yerine.
  if (baglantiKartiMi(sayfa)) redirect(sayfa.adres);

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/#hakkinda">← Hakkında</Link>
          {sayfa.ustEtiket ? <span className="eyebrow">{sayfa.ustEtiket}</span> : null}
          <h1>{sayfa.sayfaBasligi || sayfa.baslik}</h1>
          {sayfa.spot ? <p>{sayfa.spot}</p> : null}
        </div>
      </section>

      <HakkindaGovdesi sayfa={sayfa} />
    </main>
    <Footer />
  </>;
}
