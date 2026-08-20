import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HakkindaKartlari } from "@/components/hakkinda-kartlari";

export const metadata = {
  title: "Temel GençTek etkinlikleri · GençTek",
  description:
    "GençTek'in her yıl tekrarlanan temel etkinlik programları ve çalışma grubu etkinlikleri.",
};

/**
 * TEMEL ETKİNLİK PROGRAMLARI.
 *
 * Liste PLATFORMDAKİ referans tablosuyla aynı (gençtek uygulaması ·
 * temel_etkinlik_programi): etkinlik açan kişi adı bu listeden seçiyor.
 * Portalda ayrı bir liste tutmak, iki adın zamanla ayrışması demekti — yeni bir
 * program eklendiğinde burası da güncellenmeli.
 *
 * AÇIKLAMALAR YALNIZCA KAYNAĞI OLANLARDA yazılı. Uydurulmuş bir tanım, resmî
 * bir programın ne olduğunu yanlış anlatır; adı bilinen ama tanımı elimizde
 * olmayan programlar açıklamasız duruyor ve doldurulmayı bekliyor.
 */
const temelEtkinlikler = [
  { ad: "Genç Gölge", aciklama: "" },
  { ad: "Sahne Senin", aciklama: "" },
  {
    ad: "G2S Genç Sektör Buluşmaları",
    aciklama:
      "Bilişim sektöründeki uzmanları öğrencilerle yüz yüze ya da çevrim içi buluşturan format; yazılım geliştirme, oyun tasarımı ve espor gibi alanlarda seri buluşmalar düzenlenir.",
  },
  { ad: "Sınır Ötesi (Beyond The Borders)", aciklama: "" },
  { ad: "Öğrenci Forumu", aciklama: "" },
  { ad: "Hack The Idea", aciklama: "" },
  { ad: "Akran Öğretimi", aciklama: "" },
  {
    ad: "Dijital Yürüyüş STEM",
    aciklama:
      "Öğrencilerin gerçek dünya problemlerine ekip hâlinde çözüm üretip çalışmalarını jüri ve akranlarıyla paylaştığı STEM etkinliği.",
  },
  { ad: "Oyunun e Hâli", aciklama: "" },
  {
    ad: "Tek Maraton",
    aciklama:
      "Eğitim teknolojileri alanında çözüm ve fikir geliştirilen ideathon modeli; ekipler yapay zekâ, artırılmış gerçeklik, oyunlaştırma ve dijital içerik alanlarında çalışır.",
  },
  { ad: "Misafir Öğretmenlik/Öğrencilik", aciklama: "" },
  {
    ad: "GençTek Zirvesi",
    aciklama:
      "Yılın büyük buluşması; ekiplerin ürettiklerini paylaştığı ulusal program.",
  },
];

const calismaGrubuEtkinlikleri = [
  {
    ad: "EğitiJAM",
    aciklama:
      "K12 düzeyinde oyun geliştirme farkındalığını artıran, eğitim amaçlı oyun fikirlerinin geliştirildiği çalışma grubu etkinliği.",
  },
  { ad: "Capture The Flag (Bayrağı Yakala)", aciklama: "" },
  { ad: "Mobil Uygulama Geliştirme Yarışması", aciklama: "" },
  { ad: "Teknik Gezi", aciklama: "" },
  {
    ad: "Master Tek",
    aciklama:
      "Alanında uzman öğretmenlerin verilen temalarda yarışırken takım çalışması ve centilmenlik örneğiyle öğrencilere rol model olduğu etkinlik.",
  },
  { ad: "E-Ticaret Ideathonu", aciklama: "" },
];

function EtkinlikListesi({ kayitlar }: { kayitlar: { ad: string; aciklama: string }[] }) {
  return (
    <div className="value-list">
      {kayitlar.map((kayit, sira) => (
        <article key={kayit.ad}>
          <span>{String(sira + 1).padStart(2, "0")}</span>
          <h3>{kayit.ad}</h3>
          {kayit.aciklama ? <p>{kayit.aciklama}</p> : null}
        </article>
      ))}
    </div>
  );
}

export default function TemelEtkinliklerSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/hakkinda">← Hakkında</Link>
          <span className="eyebrow">Program ailesi</span>
          <h1>Temel GençTek etkinlikleri</h1>
          <p>Her yıl tekrarlanan program adları. Bir etkinlik açılırken adı bu listeden seçilir; tarihli duyurular ve başvurular <Link className="text-link" href="/etkinlikler">Etkinlikler</Link> sayfasındadır.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Ulusal</span>
              <h2>Temel etkinlikler</h2>
            </div>
          </div>
          <EtkinlikListesi kayitlar={temelEtkinlikler} />
        </div>
      </section>

      <section className="section themes-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Çalışma gruplarıyla</span>
              <h2>Çalışma grubu etkinlikleri</h2>
              <p>Çalışma gruplarının yıl boyunca planlayıp yürüttüğü programlar.</p>
            </div>
          </div>
          <EtkinlikListesi kayitlar={calismaGrubuEtkinlikleri} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Devamı</span>
              <h2>Diğer başlıklar</h2>
            </div>
          </div>
          <HakkindaKartlari haric="temel-etkinlikler" />
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
