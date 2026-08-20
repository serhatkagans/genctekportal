import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HakkindaKartlari } from "@/components/hakkinda-kartlari";

export const metadata = {
  title: "GençTek nedir? · GençTek",
  description:
    "GençTek; öğrencileri, danışman öğretmenleri ve bilişim sektörünü buluşturan ülke çapında bir üretim ekosistemidir.",
};

export default function GenctekNedirSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/hakkinda">← Hakkında</Link>
          <span className="eyebrow">Tanım</span>
          <h1>GençTek nedir?</h1>
          <p>Gençlerin teknolojiyle ürettiği, paylaştığı ve birlikte büyüdüğü bilişim ekosistemi.</p>
        </div>
      </section>

      <section className="section">
        <div className="container prose-grid">
          <div>
            <h2>Kısaca</h2>
            <p>GençTek, ortaöğretim öğrencilerinin bilişim alanında üretim yapmasını; danışman öğretmenleriyle, akranlarıyla ve sektör temsilcileriyle bir araya gelmesini sağlayan ülke çapında bir programdır. Ders dışı öğrenmeyi okulun içinde bırakmaz: il ve ulusal etkinlikler, çalışma grupları ve sektör buluşmaları aynı ağda birleşir.</p>
            <p>Ekosistemin üç tarafı vardır: <strong>öğrenciler</strong> üretir ve etkinliklere katılır; <strong>danışman öğretmenler</strong> okulundaki çalışmayı yürütür ve etkinlik açar; <strong>il koordinatörleri</strong> ilindeki programı düzenler, okulları ve paydaşları bir araya getirir.</p>
          </div>
          <div className="value-list">
            <article>
              <span>01</span>
              <h3>Akran öğrenmesi</h3>
              <p>Gençler birbirinden öğrenir, bilgisini paylaşarak güçlenir.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Gerçek deneyim</h3>
              <p>Etkinlik, atölye ve sektör buluşmaları sınıfla hayat arasında köprü kurar.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Ülke çapında ağ</h3>
              <p>Farklı şehirlerden ekipler ortak üretim kültüründe buluşur.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section themes-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Devamı</span>
              <h2>Diğer başlıklar</h2>
            </div>
          </div>
          <HakkindaKartlari haric="genctek-nedir" />
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
