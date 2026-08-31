import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { gorselYolu } from "@/lib/ortam";
import { ZIRVELER, type Zirve } from "@/lib/zirve";

/**
 * Bir zirvenin sayfası: /zirve ve /2-genctek-zirvesi-2026 aynı düzeni kullanır.
 *
 * Metin ve fotoğraflar `lib/zirve.ts`'ten geliyor; sayfa dosyaları yalnızca
 * hangi zirve olduğunu söylüyor. Altta öteki zirvenin bağlantısı var — iki
 * sayfa arasında gidip gelmek için menüye dönmek gerekmesin.
 */
export function ZirveSayfasi({ zirve }: { zirve: Zirve }) {
  const digerleri = ZIRVELER.filter((kayit) => kayit.yol !== zirve.yol);

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/hakkinda/temel-etkinlikler/genctek-zirvesi">← GençTek Zirvesi</Link>
          <span className="eyebrow">{zirve.tarihYer}</span>
          <h1>{zirve.ad}</h1>
          <p>{zirve.ozet}</p>
        </div>
      </section>

      <section className="section">
        <div className="container program-detay">
          {zirve.metin.split(/\n{2,}/).map((paragraf) => (
            <p className="program-detay-metin" key={paragraf}>{paragraf}</p>
          ))}

          {zirve.video && (
            /* Video metnin hemen altında: sayfaya gelen önce anlatımı okuyor,
               sonra kaydı izliyor. `preload="metadata"` — dosya büyük, sayfa
               açılırken indirilmesin, yalnızca süresi okunsun. */
            <figure className="zirve-video">
              <video controls preload="metadata" poster={zirve.video.kapak ? gorselYolu(zirve.video.kapak) : undefined}>
                <source src={gorselYolu(zirve.video.url)} type="video/mp4" />
              </video>
              <figcaption>{zirve.video.baslik}</figcaption>
            </figure>
          )}

          {zirve.gorseller.length ? (
            <div className="program-detay-gorseller">
              {zirve.gorseller.map((gorsel) => (
                <figure key={gorsel.url}>
                  <img src={gorselYolu(gorsel.url)} alt={`${zirve.ad} · ${gorsel.alt}`} loading="lazy" decoding="async" />
                </figure>
              ))}
            </div>
          ) : (
            /* Fotoğraflar gelmediyse sessizce boş bırakmak yerine bunu yazmak,
               dosyayı elinde tutan kişiye neyin beklendiğini gösterir. */
            <p className="etkinlik-bos">{zirve.ad} fotoğrafları henüz yüklenmedi; dosyalar geldiğinde bu sayfaya eklenecek.</p>
          )}

          {digerleri.map((diger) => (
            <p key={diger.yol}>
              <Link className="text-link" href={diger.yol}>{diger.ad} ({diger.yil}) →</Link>
            </p>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
