import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { aciklamaParcalari, temelEtkinlikBul, temelEtkinlikKomsulari } from "@/lib/temel-etkinlik";

/*
 * PROGRAMIN KENDİ SAYFASI (31 Ağustos 2026 · istek: "her birinin kendi sayfası
 * ve geniş içeriği vardı").
 *
 * İÇERİK ARTIK BUILD'DE ÜRETİLMİYOR (4 Eylül 2026): programların metni kod
 * içinde sabit ama "GençTek Zirvesi" kaydı zirve sayfalarıyla aynı kaynaktan,
 * yani veritabanından besleniyor. `generateStaticParams` ile statik basmak
 * build'i veritabanına bağımlı kılardı — tema ve haber göçlerinde aynı tuzağa
 * düşülmüştü (bkz. app/sitemap.ts'teki not).
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kayit = await temelEtkinlikBul(slug);
  if (!kayit) return { title: "Bulunamadı · GençTek" };
  return {
    title: `${kayit.ad} · GençTek`,
    // Arama sonucunda başlığın altında çıkan cümle: metnin ilk 155 karakteri.
    description: kayit.aciklama ? `${kayit.aciklama.slice(0, 155)}…` : "Temel GençTek etkinlik programı.",
  };
}

export default async function TemelEtkinlikSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kayit = await temelEtkinlikBul(slug);
  if (!kayit) notFound();

  const { onceki, sonraki } = await temelEtkinlikKomsulari(slug);

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container program-detay">
          <Link className="back-link" href="/hakkinda/temel-etkinlikler">← Temel GençTek Etkinlikleri</Link>
          <span className="eyebrow">Temel GençTek etkinliği</span>
          <h1>{kayit.ad}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container program-detay">
          {kayit.aciklama
            ? aciklamaParcalari(kayit.aciklama).map((parca) => (parca.baslikMi
                ? <h2 className="program-detay-baslik" key={parca.metin}>{parca.metin}</h2>
                : <p className="program-detay-metin" key={parca.metin}>{parca.metin}</p>))
            : <p className="program-detay-metin">Bu programın tanıtım metni hazırlanıyor. Tarihli duyurular ve başvurular <Link className="text-link" href="/etkinlikler">Etkinlikler</Link> sayfasındadır.</p>}

          {/* SAYFA İÇİ FOTOĞRAFLAR KALKTI (1 Eylül 2026 · istek: "temel
             etkinlikler kartlarında resimler dursun ama sayfa içlerindeki
             görseller kalksın sadece yazılar kalsın"). Görseller kayıtta
             duruyor: liste ekranındaki kapak oradan geliyor. */}

          {/* Haber sayfalarındaki gezinmenin aynısı: aynı biçim, aynı sınıflar
             (bkz. components/wordpress-article.tsx). */}
          {onceki || sonraki ? (
            <nav className="haber-gezinme etkinlik-gezinme" aria-label="Etkinlikler arasında gezinme">
              {onceki ? <Link className="haber-gezinme-baglanti haber-gezinme-onceki" href={`/hakkinda/temel-etkinlikler/${onceki.slug}`}>
                <span>← Önceki Etkinlik</span><strong>{onceki.ad}</strong>
              </Link> : null}
              {sonraki ? <Link className="haber-gezinme-baglanti haber-gezinme-sonraki" href={`/hakkinda/temel-etkinlikler/${sonraki.slug}`}>
                <span>Sonraki Etkinlik →</span><strong>{sonraki.ad}</strong>
              </Link> : null}
            </nav>
          ) : null}
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
