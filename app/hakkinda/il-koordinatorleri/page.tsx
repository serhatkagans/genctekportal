import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { KoordinatorRehberi } from "@/components/koordinator-rehberi";
import { ileGoreSirala, koordinatorleriOku } from "@/lib/koordinator";

export const metadata: Metadata = {
  title: "İl Koordinatörleri",
  description: "81 ildeki GençTek il koordinatörleri, il yöneticileri ve komisyon üyeleri.",
};

// Panelden yapılan değişiklik anında yansısın diye her istekte dosyadan okunur.
export const dynamic = "force-dynamic";

export default async function CoordinatorsPage() {
  const kayitlar = ileGoreSirala(await koordinatorleriOku());
  const ilSayisi = new Set(kayitlar.map((k) => k.il)).size;

  return (
    <>
      <Header />
      <main>
        <section className="page-hero compact">
          <div className="container">
            <Link className="back-link" href="/hakkinda">← Hakkında</Link>
            <span className="eyebrow">Ekosistem</span>
            <h1>İl koordinatörleri</h1>
            <p>
              {ilSayisi} ilde görev yapan {kayitlar.length} koordinatör, il yöneticisi ve komisyon üyesi.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <KoordinatorRehberi kayitlar={kayitlar} />
          </div>
        </section>
        {/*
          "DİĞER BAŞLIKLAR" ŞERİDİ BU SAYFADA YOK (20 Ağustos 2026 · istek:
          "il koordinatörleri sayfasından en altta Devamı / Diğer başlıklar bu
          bölümü çıkart").

          Sayfa 101 kartlık bir rehber: aranan kişiyi bulan okuyucu zaten
          işini bitirmiş oluyor, altına altı kart daha koymak sayfayı uzatmak
          ve konudan çıkarmaktan başka bir şey yapmıyordu. Hakkında'ya dönüş
          en üstteki bağlantıda duruyor.
        */}
      </main>
      <Footer />
    </>
  );
}
