import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { uygulamaYolu } from "@/lib/ortam";
import { baskilar, yayinlariOku, DIL_ADLARI } from "@/lib/yayinlar";

/**
 * YAYINLAR LİSTESİ (23 Kasım 2026). Menüdeki "Yayınlar" başlığının kendisi
 * buraya gelir; açılır listesi her yayına ayrı ayrı gider.
 *
 * force-dynamic: liste diskten okunuyor (bkz. lib/yayinlar.ts); yeni bir yayın
 * ya da ikinci dil sunucuya konunca derleme gerekmeden görünsün.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Yayınlar · GençTek",
  description: "GençTek yayınları: sayfalarını çevirerek çevrim içi okuyun.",
};

export default async function YayinlarSayfasi() {
  const yayinlar = await yayinlariOku();

  return <>
    <Header />
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Kitaplık</span>
          <h1>Yayınlar</h1>
          <p>Sayfaları köşesinden tutup çevirerek okuyabilir, dilerseniz PDF olarak indirebilirsiniz.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {yayinlar.length === 0
            ? <p>Henüz yayın eklenmedi.</p>
            : (
              <div className="yayin-listesi">
                {baskilar(yayinlar).map(({ yayin, dil, baski, adres }) => (
                  <Link className="yayin-karti" href={adres} key={`${yayin.kisaAd}-${dil}`} lang={dil}
                    style={{ "--yayin-oran": baski.genislik / baski.yukseklik } as React.CSSProperties}>
                    <img src={uygulamaYolu(`/yayinlar/${yayin.kisaAd}/${dil}/s001.webp`)} alt="" />
                    {baski.baslik}
                    <span>{DIL_ADLARI[dil]} · {baski.sayfaSayisi} {dil === "en" ? "pages" : "sayfa"}</span>
                  </Link>
                ))}
              </div>
            )}
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
