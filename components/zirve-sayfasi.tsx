import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ZirveGorselGalerisi } from "@/components/zirve-gorsel-galerisi";
import { gorselYolu } from "@/lib/ortam";
import type { Zirve } from "@/lib/zirve-govde";

/**
 * Bir zirvenin sayfası: /zirve ve /2-genctek-zirvesi-2026 aynı düzeni kullanır.
 *
 * Metin ve fotoğraflar veritabanından geliyor (4 Eylül 2026'da lib/zirve.ts'in
 * sabit dizisinden "Page" tablosuna taşındılar); sayfa dosyaları yalnızca hangi
 * zirve olduğunu söylüyor. Altta öteki zirvelerin bağlantısı var — iki sayfa
 * arasında gidip gelmek için menüye dönmek gerekmesin.
 *
 * ÖTEKİ ZİRVELER DIŞARIDAN GELİYOR: bu bileşen listeyi kendisi sorgulamıyor,
 * çağıran sayfa zaten bütün listeyi okuyup içinden bunu seçiyor — aynı sorgu
 * iki kez çalışmasın.
 */
export function ZirveSayfasi({ zirve, digerleri = [] }: { zirve: Zirve; digerleri?: Zirve[] }) {

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container program-detay">
          <Link className="back-link" href="/hakkinda/temel-etkinlikler/genctek-zirvesi">← GençTek Zirvesi</Link>
          <span className="eyebrow">{zirve.tarihYer}</span>
          <h1>{zirve.ad}</h1>
          <p>{zirve.ozet}</p>

          {/* Sayı şeridi: zirvenin ölçeği metne dalmadan da okunsun. */}
          {zirve.vurgular?.length ? (
            <dl className="zirve-vurgular">
              {zirve.vurgular.map((vurgu) => (
                <div key={vurgu.etiket}>
                  <dt>{vurgu.deger}</dt>
                  <dd>{vurgu.etiket}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container program-detay">
          {zirve.metin.split(/\n{2,}/).map((paragraf) => (
            <p className="program-detay-metin" key={paragraf}>{paragraf}</p>
          ))}

          {/* Program bölümleri: giriş metninin ardından, fotoğraflardan önce.
             Her biri kendi başlığıyla duruyor ki sayfada göz gezdiren okuyucu
             aradığı oturumu tek bakışta bulabilsin. */}
          {zirve.bolumler?.length ? (
            <div className="zirve-bolumler">
              <h2 className="zirve-bolumler-baslik">Zirve programından</h2>
              {zirve.bolumler.map((bolum) => (
                <section className="zirve-bolum" key={bolum.baslik}>
                  <h3>{bolum.baslik}</h3>
                  <p>{bolum.metin}</p>
                </section>
              ))}
            </div>
          ) : null}

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
            <ZirveGorselGalerisi gorseller={zirve.gorseller} zirveAdi={zirve.ad} />
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
