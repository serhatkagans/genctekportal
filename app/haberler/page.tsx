import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WordPressCard } from "@/components/wordpress-card";
import { HABER_SAYFA_BOYUTU, haberSayfasi } from "@/lib/haber";

export const metadata: Metadata = { title: "Haberler", description: "GençTek etkinlik, duyuru ve ekosistem haberleri." };

// Panelden yapılan düzenleme anında yansısın diye her istekte dosyadan okunur.
export const dynamic = "force-dynamic";

// Sayfa başına HABER_SAYFA_BOYUTU kart basılır; tümünü tek sayfada basmak hem
// yüzlerce görsel hem de büyük bir sunucu bileşeni akışı demekti.
function sayfaYolu(sayfa: number) {
  return sayfa <= 1 ? "/haberler" : `/haberler?sayfa=${sayfa}`;
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ sayfa?: string }> }) {
  const { sayfa: istenen } = await searchParams;
  const { kartlar, toplam, sayfa, sonSayfa } = await haberSayfasi(Number.parseInt(istenen ?? "1", 10) || 1);
  const ilk = (sayfa - 1) * HABER_SAYFA_BOYUTU + 1;
  const son = ilk + kartlar.length - 1;

  return <><Header /><main>
    {/* Başlık ile sayaç arasındaki boşluk azaltıldı (31 Ağustos 2026 · istek:
        "Son Haberler / 74 yayımlanmış içerik bu ikisi arasında fazla boşluk
        var"). Hero "compact", liste bölümü de kendi üst boşluğunu daraltıyor. */}
    <section className="page-hero compact"><div className="container"><span className="eyebrow">GençTek Ekosisteminden</span><h1>Son Haberler</h1></div></section>
    <section className="section haber-listesi"><div className="container">
      <div className="archive-heading">
        <div className="archive-summary"><strong>{toplam}</strong><span>yayımlanmış içerik</span></div>
      </div>
      <div className="card-grid wordpress-grid">{kartlar.map((item, sira) => <WordPressCard item={item} key={item.id} oncelikli={sira < 3} />)}</div>
      {sonSayfa > 1 && (
        <nav className="haber-sayfalama" aria-label="Haber sayfaları">
          {sayfa > 1
            ? <Link className="button button-secondary" href={sayfaYolu(sayfa - 1)} rel="prev">Önceki</Link>
            : <span className="haber-sayfalama-bosluk" />}
          <span className="haber-sayfalama-durum">Sayfa {sayfa} / {sonSayfa} · {toplam ? `${ilk}-${son}` : "0"} arası</span>
          {sayfa < sonSayfa
            ? <Link className="button button-secondary" href={sayfaYolu(sayfa + 1)} rel="next">Sonraki</Link>
            : <span className="haber-sayfalama-bosluk" />}
        </nav>
      )}
    </div></section>
  </main><Footer /></>;
}
