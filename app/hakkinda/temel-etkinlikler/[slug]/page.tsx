import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { gorselYolu } from "@/lib/ortam";
import { temelEtkinlikBul, temelEtkinlikSluglari } from "@/lib/temel-etkinlik";

/*
 * PROGRAMIN KENDİ SAYFASI (31 Ağustos 2026 · istek: "her birinin kendi sayfası
 * ve geniş içeriği vardı").
 *
 * İçerik kod içinde sabit duruyor (bkz. lib/temel-etkinlik.ts) — veritabanına
 * gitmiyor, o yüzden adresler build'de üretilebiliyor: `generateStaticParams`
 * on dokuz sayfayı da statik basıyor, ziyaretçi hiç bekleme görmüyor.
 */
export function generateStaticParams() {
  return temelEtkinlikSluglari().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kayit = temelEtkinlikBul(slug);
  if (!kayit) return { title: "Bulunamadı · GençTek" };
  return {
    title: `${kayit.ad} · GençTek`,
    // Arama sonucunda başlığın altında çıkan cümle: metnin ilk 155 karakteri.
    description: kayit.aciklama ? `${kayit.aciklama.slice(0, 155)}…` : "Temel GençTek etkinlik programı.",
  };
}

export default async function TemelEtkinlikSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kayit = temelEtkinlikBul(slug);
  if (!kayit) notFound();

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/hakkinda/temel-etkinlikler">← Temel GençTek Etkinlikleri</Link>
          <span className="eyebrow">Temel GençTek etkinliği</span>
          <h1>{kayit.ad}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container program-detay">
          {kayit.aciklama
            ? <p className="program-detay-metin">{kayit.aciklama}</p>
            : <p className="program-detay-metin">Bu programın tanıtım metni hazırlanıyor. Tarihli duyurular ve başvurular <Link className="text-link" href="/etkinlikler">Etkinlikler</Link> sayfasındadır.</p>}

          {kayit.gorseller?.length ? (
            <div className="program-detay-gorseller">
              {kayit.gorseller.map((gorsel) => (
                <figure key={gorsel.url}>
                  <img src={gorselYolu(gorsel.url)} alt={gorsel.alt} loading="lazy" decoding="async" />
                </figure>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
