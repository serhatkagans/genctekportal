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
          <h1>Sektörün Yeni Liderleri</h1>
          <p>GençTek, Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü koordinasyonunda, bilişim alanında çalışma gerçekleştirmek isteyen, çalışmalar yürüten ya da mevcut çalışmalarının etkisini arttırmak isteyen öğrencilerin ve danışman öğretmenlerin desteklendiği, birbirleriyle ve paydaşlarla iletişim ve iş birliğinin sağlandığı Genç Bilişim Ekosistemidir. Akran öğrenme modeline dayalı olarak bilişim ekosisteminin gelişip güçlendirilmesini hedefler.</p>
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
