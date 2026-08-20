import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HaberGalerisi } from "@/components/HaberGalerisi";
import { EtkinlikKarti } from "@/components/etkinlik-karti";
import { Icon } from "@/components/icons";
import { haberleriOku } from "@/lib/haber";
import { genctekEtkinlikleriOku } from "@/lib/genctek-etkinlik";

// Ana sayfa da haber listesi/detayıyla aynı kaynağı kullanmalı; ayrı tohum verisi
// kullanıldığında slug'lar tutmadığı için her kart 404'e gidiyordu.
export const dynamic = "force-dynamic";

export default async function Home() {
  const sonHaberler = (await haberleriOku()).slice(0, 12);
  /*
   * ETKİNLİKLER GENÇTEK UYGULAMASINDAN GELİR (20 Ağustos 2026 · istek: "ana
   * sayfada Üretim temaları yerine az önce oluşturulan etkinlikler gelecek,
   * oradan takip edilebilecek etkinlikler").
   *
   * Portalın kendi Event tablosu değil, etkinliğin AÇILDIĞI uygulama kaynak:
   * başvuru orada alınıyor (bkz. lib/genctek-etkinlik.ts). Uygulama kapalıysa
   * liste boş döner ve bölüm boş durumunu basar; ana sayfa çökmez.
   */
  const etkinlikler = await genctekEtkinlikleriOku(6);
  return <>
    <Header />
    <main>
      <section className="hero">
        <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
        <div className="container hero-grid">
          <div className="hero-copy">
            {/*
              HERO BAŞLIĞI (20 Ağustos 2026 · istek: "Teknolojiyi izleyen değil,
              üreten gençler yazısı, sektörün yeni liderleri olacak, yeğitek
              genel müdürlüğü de yazacak orada bir yerde").

              Üst satır artık sahibini söylüyor: YEĞİTEK Genel Müdürlüğü. Başlık
              ise gençleri bugünün izleyicisi olarak değil yarının sektör lideri
              olarak konumluyor; vurgu "liderleri" kelimesinde.
            */}
            <span className="eyebrow">YEĞİTEK Genel Müdürlüğü</span>
            <h1>Sektörün yeni <em>liderleri</em>.</h1>
            <p>Fikirlerin ekiplere, ekiplerin gerçek projelere dönüştüğü; öğrencileri, öğretmenleri ve sektörü buluşturan öğrenme ağı.</p>
            <div className="button-row"><Link className="button button-primary" href="/katilim">Ekosisteme katıl <Icon name="arrow" /></Link><Link className="text-link" href="/hakkinda">GençTek’i keşfet <Icon name="arrow" /></Link></div>
          </div>
          <div className="hero-panel" aria-label="GençTek etki özeti">
            <div className="hero-panel-head"><span>2025–2026</span><span className="live-dot">Aktif dönem</span></div>
            <div className="signal"><span>Bir fikir</span><strong><em>81</em> ile yayılır.</strong></div>
            <div className="mini-stats"><div><strong>81</strong><span>İl ağı</span></div><div><strong>16</strong><span>Teknoloji teması</span></div><div><strong>1200+</strong><span>Genç üretici</span></div></div>
          </div>
        </div>
      </section>

      <section className="section stats-band"><div className="container stat-row"><span>Birlikte öğren.</span><span>Cesurca üret.</span><span>Geleceği paylaş.</span></div></section>

      <section className="section" id="haberler">
        <div className="container"><div className="section-heading"><div><span className="eyebrow">Ekosistemden</span><h2>Son gelişmeler</h2></div><Link className="text-link" href="/haberler">Tüm haberler <Icon name="arrow" /></Link></div>
          <HaberGalerisi haberler={sonHaberler} />
        </div>
      </section>

      {/*
        "ÜRETİM TEMALARI" BÖLÜMÜNÜN YERİNİ ETKİNLİKLER ALDI (20 Ağustos 2026).
        Temalar silinmedi: /temalar sayfası ve tema kartları yerinde duruyor,
        menüden ve diğer sayfalardan açılıyor. Ana sayfadaki bu yer, ziyaretçinin
        BUGÜN yapabileceği bir şeye ayrıldı — tema bir ilgi alanı, etkinlik ise
        tarihli bir çağrı.
      */}
      <section className="section themes-section" id="etkinlikler">
        <div className="container"><div className="section-heading"><div><span className="eyebrow">Takvimde ne var</span><h2>Takip edilebilecek etkinlikler</h2><p>GençTek panelinde açılmış, başvuruya açık ve yaklaşan etkinlikler.</p></div><Link className="text-link" href="/etkinlikler">Tüm etkinlikler <Icon name="arrow" /></Link></div>
          {etkinlikler.length === 0
            ? <p className="etkinlik-bos">Şu an listelenecek etkinlik yok. Yeni etkinlikler açıldığında burada görünecek.</p>
            : <div className="card-grid">{etkinlikler.map((etkinlik) => <EtkinlikKarti etkinlik={etkinlik} key={etkinlik.id} />)}</div>}
        </div>
      </section>

      <section className="section join-section"><div className="container join-card"><div><span className="eyebrow eyebrow-light">Sıra sende</span><h2>Fikrini ekibe, ekibini harekete dönüştür.</h2><p>Öğrenci veya danışman öğretmen olarak GençTek ekosistemine katıl.</p></div><Link className="button button-light" href="/katilim">Başvuruyu başlat <Icon name="arrow" /></Link></div></section>
    </main>
    <Footer />
  </>;
}
