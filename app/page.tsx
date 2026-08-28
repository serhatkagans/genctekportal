import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HaberGalerisi } from "@/components/HaberGalerisi";
import { EtkinlikKarti } from "@/components/etkinlik-karti";
import { Icon } from "@/components/icons";
import { haberKartlariOku } from "@/lib/haber";
import { genctekGirisAdresi } from "@/lib/genctek-baglanti";
import { genctekEtkinlikleriOku } from "@/lib/genctek-etkinlik";
import { genctekIstatistigiOku, sayiyiBicimle } from "@/lib/genctek-istatistik";

// Ana sayfa da haber listesi/detayıyla aynı kaynağı kullanmalı; ayrı tohum verisi
// kullanıldığında slug'lar tutmadığı için her kart 404'e gidiyordu.
export const dynamic = "force-dynamic";

export default async function Home() {
  const sonHaberler = await haberKartlariOku(12);
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
  /*
   * PANELDEKİ SAYILAR DA AYNI UYGULAMADAN (28 Ağustos 2026 · istek: "buraya
   * platformdan gelecek öğrenci sayısı öğretmen sayısı mentör sayısı, etkinlik
   * sayısı, ürün sayısı"). Elle yazılmış "81 / 16 / 1200+" kaldırıldı: yazıldığı
   * gün doğru, ertesi ay yanlıştı. Uç kapalıysa şerit hiç basılmaz.
   */
  const istatistik = await genctekIstatistigiOku();
  const paneldekiSayilar = istatistik
    ? [
        { deger: istatistik.ogrenci, etiket: "Öğrenci" },
        { deger: istatistik.ogretmen, etiket: "Öğretmen" },
        { deger: istatistik.mentor, etiket: "Mentör" },
        { deger: istatistik.etkinlik, etiket: "Etkinlik" },
        { deger: istatistik.urun, etiket: "Ürün" },
      ]
    : [];
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
            <h1>Sektörün yeni <em>liderleri</em></h1>
            <p>GençTek, Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü koordinasyonunda, bilişim alanında çalışma gerçekleştirmek isteyen, çalışmalar yürüten ya da mevcut çalışmalarının etkisini arttırmak isteyen öğrencilerin ve danışman öğretmenlerin desteklendiği, birbirleriyle ve paydaşlarla iletişim ve iş birliğinin sağlandığı Genç Bilişim Ekosistemidir.</p>
            {/*
              HERO DÜĞMESİ DE PLATFORMA (20 Ağustos 2026 · istek: "herodaki
              ekosisteme katıl da giriş olsun ve platforma girişe
              yönlendirsin"). Sayfadaki üç çağrı — üst menü, hero ve alttaki
              şerit — artık aynı adı taşıyıp aynı kapıya gidiyor.
            */}
            <div className="button-row"><a className="button button-primary" href={genctekGirisAdresi()}>Giriş <Icon name="arrow" /></a><Link className="text-link" href="/hakkinda">GençTek’i keşfet <Icon name="arrow" /></Link></div>
          </div>
          <div className="hero-panel" aria-label="GençTek etki özeti">
            <div className="hero-panel-head"><span>2025–2026</span><span className="live-dot">Aktif dönem</span></div>
            <div className="signal"><span>GençTek</span><strong>Genç bilişim <em>ekosistemi</em></strong></div>
            {paneldekiSayilar.length > 0 && (
              <div className="mini-stats mini-stats-bes">
                {paneldekiSayilar.map((sayi) => (
                  <div key={sayi.etiket}><strong>{sayiyiBicimle(sayi.deger)}</strong><span>{sayi.etiket}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section stats-band"><div className="container stat-row"><span>Akran öğrenme modeli</span><span>Genç bilişim ekosistemi</span><span>Öğrenen topluluklar</span></div></section>

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

      {/*
        ALT ÇAĞRI DA PLATFORMA GİDİYOR (20 Ağustos 2026 · istek: "Başvuruyu
        başlat burayı da girişe bağla ve ismi platforma giriş olsun").

        Üstteki düğmeyle aynı yere gider ve aynı şeyi söyler: katılmak, portalda
        ikinci bir form doldurmak değil platforma girmektir. İki düğmenin farklı
        adlar taşıması ("Başvuruyu başlat" / "Giriş") aynı kapıyı iki ayrı kapı
        gibi gösteriyordu.
      */}
      <section className="section join-section"><div className="container join-card"><div><span className="eyebrow eyebrow-light">Sıra sende</span><h2>Fikrini ekibe, ekibini harekete dönüştür.</h2><p>Öğrenci veya danışman öğretmen olarak GençTek ekosistemine katıl.</p></div><a className="button button-light" href={genctekGirisAdresi()}>Platforma giriş <Icon name="arrow" /></a></div></section>
    </main>
    <Footer />
  </>;
}
