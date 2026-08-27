import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Hedefler · GençTek",
  description: "GençTek'in hedefleri.",
};

/*
 * Hedef maddeleri tek dizide: sayfa iki yerde (giriş paragrafı ve liste)
 * anlatmıyor, listenin kendisi anlatıyor. Yeni bir hedef eklemek diziye bir
 * satır eklemek demek. Maddelerin başlığı yok; her biri tek cümlelik bir
 * hedef olduğu için numara + metin yeterli.
 */
const hedefler = [
  "Hızlı yenilenen bilişim alanında öğrenci ve öğretmenlerin Yenilik ve Eğitim Teknolojileri Genel Müdürlüğümüzün uzmanlık alanında sürekli güncellenmesini sağlamak",
  "Bilişim ekosisteminde akran öğretimini ve iş birliğini güçlendirerek, öğrencilerin ve öğretmenlerin ekosistemden ve paydaşlardan destek almasını sağlamak",
  "Sektörün ihtiyaç duyduğu nitelikli bireylerin yetiştirilmesi için öğrencilere kariyer hedefleri sunarak ve sektör tanıtımlarına yer vererek sektörün gelişimini sağlamak",
  "Yeni çalışma, proje ve etkinliklerin geliştirilmesine ve mevcut çalışmaların yaygınlaştırılmasına katkıda bulunmak",
];

export default function HedeflerSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/hakkinda">← Hakkında</Link>
          <span className="eyebrow">Neyi hedefliyoruz</span>
          <h1>Hedefler</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="value-list">
            {hedefler.map((hedef, sira) => (
              <article key={hedef}>
                <span>{String(sira + 1).padStart(2, "0")}</span>
                <p>{hedef}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </>;
}
