import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { gorselYolu } from "@/lib/ortam";
import {
  aciklamaOzeti,
  temelEtkinlikleriOku,
  type TemelEtkinlik,
} from "@/lib/temel-etkinlik";

export const metadata = {
  title: "Temel GençTek Etkinlikleri · GençTek",
  description:
    "GençTek'in her yıl tekrarlanan temel etkinlik programları ve çalışma grubu etkinlikleri.",
};

/*
 * KARTLAR ARTIK TIKLANABİLİR (31 Ağustos 2026 · istek: "temel etkinlik
 * kartları tıklanabilir değil, önceden her birinin kendi sayfası ve geniş
 * içeriği vardı").
 *
 * Liste ekranı tanıtım yapıyor: kapak fotoğrafı, ad ve açıklamanın ilk
 * cümleleri. Uzun metnin tamamı ile fotoğrafların hepsi kendi sayfasında
 * (`/hakkinda/temel-etkinlikler/<slug>`) duruyor — on dokuz programın tam
 * metnini tek ekrana dizmek, aradığını bulmayı imkânsız kılıyordu.
 *
 * KAPAK GÖRSELİ KIRPILMIYOR (istek: "görseller ezilmiş"): dikey afişler ve
 * geniş salon fotoğrafları aynı kutuya `contain` ile yerleşiyor, arkasında
 * yumuşak bir zemin var. Kutu ölçüsü sabit olduğu için kartlar da eşit boyda.
 */
function ProgramIzgarasi({ kayitlar }: { kayitlar: TemelEtkinlik[] }) {
  return (
    <div className="program-izgara">
      {kayitlar.map((kayit, sira) => {
        const kapak = kayit.gorseller?.[0];
        return (
          <Link className="program-karti" href={`/hakkinda/temel-etkinlikler/${kayit.slug}`} key={kayit.slug}>
            <span className="program-kapak">
              {kapak
                ? <img src={gorselYolu(kapak.url)} alt={kapak.alt} loading="lazy" decoding="async" />
                : <span className="program-kapak-bos" aria-hidden="true"><Icon name="calendar" /></span>}
            </span>
            <span className="program-govde">
              <span className="program-numara">{String(sira + 1).padStart(2, "0")}</span>
              <h3>{kayit.ad}</h3>
              {kayit.aciklama ? <p>{aciklamaOzeti(kayit.aciklama)}</p> : null}
              <span className="program-git">Ayrıntılar <Icon name="arrow" /></span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* Liste artık veritabanına uğruyor: "GençTek Zirvesi" kaydının metni ve
   galerisi zirve sayfalarıyla aynı kaynaktan geliyor (bkz. lib/temel-etkinlik.ts
   · temelEtkinlikleriOku). Bu yüzden sayfa istek anında üretiliyor. */
export const dynamic = "force-dynamic";

export default async function TemelEtkinliklerSayfasi() {
  const temelEtkinlikler = await temelEtkinlikleriOku();

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/#hakkinda">← Hakkında</Link>
          {/* Üstteki açıklama 1 Eylül 2026'da kaldırıldı (istek: "burada
             açıklama silinecek"); kartların kendisi zaten ne olduklarını
             söylüyordu. */}
          <span className="eyebrow">Ekosistem etkinlikleri</span>
          <h1>Temel GençTek Etkinlikleri</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ProgramIzgarasi kayitlar={temelEtkinlikler} />
        </div>
      </section>

      {/*
        ÇALIŞMA GRUBU ETKİNLİKLERİ BÖLÜMÜ KALKTI (1 Eylül 2026 · istekler:
        "alttan Çalışma gruplarıyla / Çalışma Grubu Etkinlikleri … bunları
        kaldır" ve "kartlar da kalkacaktı çalışma grubu etkinliklerinin").

        Kayıtlar SİLİNMEDİ: EĞİTİJAM, Capture The Flag, Mobil Uygulama
        Geliştirme Yarışması, Teknik Gezi, Master Tek ve E-Ticaret Ideathonu
        `lib/temel-etkinlik.ts`'te duruyor, kendi sayfaları da açılıyor —
        paylaşılmış bağlantılar çalışmayı sürdürsün diye. Kalkan yalnızca bu
        listedeki kartlar.
      */}

    </main>
    <Footer />
  </>;
}
