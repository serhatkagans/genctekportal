import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EtkinlikKarti } from "@/components/etkinlik-karti";
import { genctekEtkinlikleriOku } from "@/lib/genctek-etkinlik";

/**
 * ETKİNLİKLER — PLATFORMDAKİ TÜM ETKİNLİKLER (20 Ağustos 2026 · istek:
 * "etkinlik sayfasında platformdaki tüm etkinlikler görülebilecekti").
 *
 * Ana sayfadaki bölüm yalnızca altı kart gösteriyor ve "şu sıralar ne var"
 * sorusuna cevap veriyor; burası ise listenin tamamı. İkisi de AYNI kaynaktan
 * besleniyor (GençTek platformunun herkese açık ucu), yani portalda ikinci bir
 * etkinlik kaydı tutulmuyor — bkz. lib/genctek-etkinlik.ts.
 *
 * İKİ BÖLÜM, İKİ AYRI SORGU: süren/yaklaşanlar en yakın tarihten uzağa,
 * geçmiştekiler en yeniden eskiye sıralanır. Tek listede birleştirilseydi,
 * listenin ortasında sıralama yön değiştirirdi ve okuyan kişi nerede olduğunu
 * kaybederdi.
 *
 * SAYFA HER İSTEKTE TAZE: etkinlik listesi başvuru pencerelerine göre saat
 * saat değişiyor, statik üretilmiş bir sayfa "başvuru açık" derken kapanmış
 * olabilirdi. Uçtan gelen yanıt yine de bir dakika önbellekleniyor.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Etkinlikler · GençTek",
  description:
    "GençTek platformunda açılmış, başvuruya açık ve geçmiş etkinliklerin tamamı.",
};

const EN_FAZLA = 100;

export default async function EtkinliklerSayfasi() {
  const [suren, gecmis] = await Promise.all([
    genctekEtkinlikleriOku(EN_FAZLA),
    genctekEtkinlikleriOku(EN_FAZLA, { gecmis: true }),
  ]);

  return <>
    <Header />
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Takvimde ne var</span>
          <h1>Etkinlikler</h1>
          <p>GençTek platformunda açılan il ve ulusal etkinliklerin tamamı. Başvuru, etkinliğin kendi sayfasında ve giriş yaptıktan sonra yapılır.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Şimdi</span>
              <h2>Süren ve yaklaşan etkinlikler</h2>
            </div>
          </div>
          {suren.length === 0
            ? <p className="etkinlik-bos">Şu an süren ya da yaklaşan etkinlik yok. Yeni etkinlikler açıldığında burada görünecek.</p>
            : <div className="card-grid">{suren.map((etkinlik) => <EtkinlikKarti etkinlik={etkinlik} key={etkinlik.id} />)}</div>}
        </div>
      </section>

      {/*
        GEÇMİŞ BÖLÜMÜ BOŞSA HİÇ BASILMAZ: yaklaşan etkinlik yokluğu bir bilgidir
        ("şu an bir şey yok"), ama geçmişin boş olması yalnızca sistemin yeni
        olduğunu söyler ve ekranda yer kaplamasının bir karşılığı yoktur.
      */}
      {gecmis.length > 0 && (
        <section className="section themes-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Arşiv</span>
                <h2>Geçmiş etkinlikler</h2>
                <p>Tamamlanmış etkinlikler; en yeniden eskiye.</p>
              </div>
            </div>
            <div className="card-grid">{gecmis.map((etkinlik) => <EtkinlikKarti etkinlik={etkinlik} key={etkinlik.id} />)}</div>
          </div>
        </section>
      )}
    </main>
    <Footer />
  </>;
}
