import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Amaçlar · GençTek",
  description: "GençTek'in hedefleri ve dayandığı ilkeler.",
};

/*
 * Amaç maddeleri tek dizide: sayfa iki yerde (giriş paragrafı ve liste)
 * anlatmıyor, listenin kendisi anlatıyor. Yeni bir amaç eklemek diziye bir
 * satır eklemek demek.
 */
const amaclar = [
  {
    baslik: "Yeteneği erken keşfetmek",
    metin: "Öğrencinin ilgisini ortaöğretim çağında görünür kılmak; bilişimin hangi dalında güçlü olduğunu deneyerek anlamasını sağlamak.",
  },
  {
    baslik: "Gerçek problemlerle çalışmak",
    metin: "Sınıf içi alıştırmaların ötesine geçip yerel ve ulusal ölçekte gerçek problemlere ekip olarak çözüm üretmek.",
  },
  {
    baslik: "Sektörü yakından tanımak",
    metin: "Bilişim sektöründeki rolleri, çalışma biçimlerini ve kariyer yollarını uzmanlarından doğrudan dinlemek.",
  },
  {
    baslik: "Akran öğrenmesini yaymak",
    metin: "Öğrenenin öğretene dönüştüğü bir kültür kurmak; bilgi paylaşımını okul ve il sınırlarının ötesine taşımak.",
  },
  {
    baslik: "Öğretmeni güçlendirmek",
    metin: "Danışman öğretmenin rehberliğini görünür kılmak, öğretmenler arası deneyim aktarımını sürekli hâle getirmek.",
  },
  {
    baslik: "Ülke çapında ağ kurmak",
    metin: "81 ilde aynı programın yürüdüğü, ekiplerin birbirini bulabildiği ortak bir üretim ağı oluşturmak.",
  },
];

export default function AmaclarSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/hakkinda">← Hakkında</Link>
          <span className="eyebrow">Neyi hedefliyoruz</span>
          <h1>Amaçlar</h1>
          <p>Öğrencilerin erken yaşta yeteneklerini keşfetmesi, gerçek problemlere ekip olarak çözüm üretmesi ve bilişim alanındaki kariyerleri yakından tanıması.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="value-list">
            {amaclar.map((amac, sira) => (
              <article key={amac.baslik}>
                <span>{String(sira + 1).padStart(2, "0")}</span>
                <h3>{amac.baslik}</h3>
                <p>{amac.metin}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </>;
}
