import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HakkindaKartlari } from "@/components/hakkinda-kartlari";

/**
 * HAKKINDA — ARTIK BİR KART SAYFASI (20 Ağustos 2026 · istek: "hakkında sayfası
 * içinde … her biri kart sayfası olacak, karta tıklayınca kendi sayfasına
 * gidecek").
 *
 * Eskiden tek ekranda iki paragraf ve üç maddelik bir liste vardı; "GençTek
 * nedir", "amaçlar", "hangi etkinlikler" sorularının hepsi aynı sayfaya
 * sıkıştırılmıştı ve hiçbirine bağlantı verilemiyordu. Şimdi her başlık kendi
 * adresinde: paylaşılabilir, aranabilir ve tek tek büyütülebilir.
 *
 * Eski metin kaybolmadı: giriş bölümündeki cümleler ile "amacımız" paragrafı
 * hakkinda/genctek-nedir ve hakkinda/amaclar sayfalarına taşındı.
 */
export const metadata = {
  title: "Hakkında · GençTek",
  description:
    "GençTek nedir, amaçları neler, hangi etkinlikleri ve çalışma gruplarını kapsar.",
};

export default function HakkindaSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Neden GençTek?</span>
          <h1>Gençlerin birlikte ürettiği teknoloji ekosistemi.</h1>
          <p>Ders dışı öğrenmeyi, akran paylaşımını ve sektör deneyimini Türkiye çapında buluşturuyoruz. Aşağıdaki başlıklardan her biri kendi sayfasında ayrıntılanıyor.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <HakkindaKartlari />
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
