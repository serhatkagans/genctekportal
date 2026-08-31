import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { gorselYolu } from "@/lib/ortam";

export const metadata = {
  title: "Ekosistem Yapılanması · GençTek",
  description: "GençTek ekosistemini oluşturan roller ve paydaşlar.",
};

/*
 * SAYFA HEDEFLERDEN YAPILANMAYA GEÇTİ (31 Ağustos 2026 · istekler: "GençTek
 * Hedefleri, GençTek Yapılanma olarak değişsin", "gençtek hedefler yerine
 * konulacak … sayfası içeriği bu olacak", ardından başlık "Ekosistem
 * Yapılanması" oldu). Önce dört maddelik hedef listesi vardı; yerini
 * ekosistemi kimin oluşturduğunu anlatan on iki başlık aldı.
 *
 * ADRES DEĞİŞMEDİ (`/hakkinda/amaclar`): paylaşılmış bağlantılar ve Hakkında
 * kartı aynı yere gidiyor. Başlık ve içerik değişti, adres değişmedi.
 *
 * SIRA ŞEMAYLA AYNI: metin listesi, üstteki yapılanma görselindeki simgelerin
 * soldan sağa, yukarıdan aşağıya sırasını izliyor — okuyan şemadaki bir
 * simgeyi metinde aynı sırada bulsun diye.
 */
const yapilanma: { baslik: string; paragraflar: string[] }[] = [
  {
    baslik: "Danışman Öğretmen",
    paragraflar: [
      "Danışman Öğretmen, okulundaki öğrencilerin bilişim alanındaki ilgi ve yeteneklerini keşfetmelerine, çalışmalarını geliştirmelerine ve GençTek ekosisteminden etkin biçimde yararlanmalarına rehberlik eden öğretmendir. Danışman Öğretmen; bilişim alanında çalışma yapmak isteyen öğrencileri ve mevcut öğrenci ekiplerini destekler, okul GençTek Ekibinin oluşturulmasına rehberlik eder ve öğrencilerin GençTek etkinlikleri, Çalışma Grupları, görevler, projeler ve diğer ekosistem fırsatlarına erişimini kolaylaştırır.",
    ],
  },
  {
    baslik: "Okul / İlçe / İl Temsilcisi",
    paragraflar: [
      "Okul Temsilcisi, danışman öğretmenin rehberliğinde okulundaki öğrenciler arasından belirlenir. Belirlenen öğrenciye Okul Temsilcisi Belgesi verilir ve Öğrenci Temsilcileri Grubuna dâhil edilir. Okul Temsilcisi; GençTek ile okulundaki öğrenciler arasında iletişim ve bilgi akışını güçlendiren, öğrencilerin ihtiyaç ve önerilerini GençTek'e taşıyan ve okulundaki GençTek çalışmalarının planlanmasına destek olan öğrencidir.",
      "İlçe ve İl Temsilcileri, ihtiyaç duyulması hâlinde İl GençTek Koordinatörleri tarafından belirlenir. Temsilciler, bulundukları düzeyde öğrencilerin görüşlerinin alınmasına, öğrenciler arası iletişimin güçlendirilmesine ve GençTek çalışmalarının yaygınlaştırılmasına katkı sağlar.",
    ],
  },
  {
    baslik: "Okul GençTek Ekibi",
    paragraflar: [
      "Okul GençTek Ekibi; bilişim alanında üreten, öğrenen ve üretmek isteyen öğrencilerin bir araya geldiği okul düzeyindeki ekip yapısıdır. Danışman öğretmenin rehberliğinde okul temsilcileri ve öğrenciler tarafından oluşturulabilir. Okulda hâlihazırda faaliyet gösteren bilişim kulüpleri, takımlar veya öğrenci toplulukları da GençTek Ekosistemine dâhil olabilir. Ekipler; etkinlik düzenleme, çalışma gruplarına katılma, okul içi akran öğrenmesini destekleme ve GençTek fırsatlarını diğer öğrencilerle buluşturma gibi çalışmalar yürütür.",
    ],
  },
  {
    baslik: "İl GençTek Koordinatörlüğü / Komisyonu",
    paragraflar: [
      "İl GençTek çalışmaları, İl Millî Eğitim Müdürlüklerinin Yenilik ve Eğitim Teknolojileri Hizmetleri Şube Müdürlüklerinde görevlendirilen İl GençTek Koordinatörleri tarafından yürütülür. İl GençTek Koordinatörleri; ildeki okul ekipleri, danışman öğretmenler, öğrenciler ve paydaşlar arasındaki iletişimi güçlendirir; GençTek çalışmalarını planlar, ihtiyaçları belirler ve öğrencilerin ekosistem olanaklarından yararlanmasını destekler.",
      "Gerekli hâllerde öğretmen, yönetici, akademisyen, öğrenci, girişimci ve sektör temsilcilerinden oluşan GençTek Komisyonu oluşturularak ilde yürütülecek çalışmalar, ekiplerin destek talepleri ve yerel ihtiyaçlar birlikte değerlendirilir. İl düzeyinde üniversiteler, kurum ve kuruluşlar, sektör temsilcileri, öğrenci toplulukları ve okul ekipleri bir araya getirilerek yerel bilişim ekosisteminin güçlendirilmesine ve yeni iş birliklerinin geliştirilmesine katkı sağlanır.",
    ],
  },
  {
    baslik: "Çalışma Grupları",
    paragraflar: [
      "Öğrenciler, ilgi ve üretim alanlarına göre Türkiye'nin farklı illerinden öğrencilerin bir araya geldiği Oyun Tasarımı, Siber Güvenlik, Yapay Zekâ, Robotik ve benzeri Çalışma Gruplarına katılabilir. Çalışma Grupları; aynı alana ilgi duyan öğrencilerin öğrenmesi, birlikte üretmesi, deneyimlerini paylaşması ve alanlarında derinleşmesi amacıyla oluşturulur. Öğrenciler bu gruplarda projeler geliştirir, etkinlik ve maratonlara katılır, uzman ve mentörlerle buluşur ve ortaya çıkardıkları ürünleri diğer öğrencilerle paylaşır.",
      "Çalışma Grupları, GençTek Koordinatörlerinin, danışman öğretmenlerin ve okul temsilcilerinin görüşleri doğrultusunda Genel Müdürlük koordinasyonunda oluşturulur ve geliştirilebilir.",
    ],
  },
  {
    baslik: "GençTek Zirve Ekipleri",
    paragraflar: [
      "GençTek Zirvesi; ekosistemin farklı bileşenlerinin bir araya geldiği, üretilen çalışmaların paylaşıldığı ve yeni dönemin birlikte şekillendirildiği ulusal buluşma alanıdır. GençTek Koordinatörleri, Çalışma Grubu temsilcileri, öğrenciler, danışman öğretmenler ve paydaşlar Zirve kapsamında bir araya gelir. İllerde yürütülen çalışmalar ve ortaya çıkan ürünler paylaşılır; Çalışma Gruplarının yeni dönem planlamaları yapılır. Öğrenci Forumu, G2S, Sahne Senin, Master Tek, Tek Maraton ve Hack The Idea gibi GençTek etkinliklerinin ulusal katılımlı çalışmalarıyla öğrencilerin üretimlerini sergilemeleri, fikirlerini paylaşmaları, farklı illerden akranlarıyla iş birliği kurmaları ve sektör temsilcileriyle buluşmaları desteklenir.",
    ],
  },
  {
    baslik: "Kamu Kurumları",
    paragraflar: [
      "Bilişim alanında öğretmen ve öğrencilere yönelik çalışma yürüten kamu kurumlarıyla; öğrencilerin ve öğretmenlerin ihtiyaçlarına uygun fırsatların geliştirilmesi, çalışmaların etkisinin artırılması ve kamu kaynaklarının etkili kullanılması amacıyla iş birlikleri geliştirilir. Kamu kurumlarının bilgi, deneyim, altyapı ve imkânlarının GençTek ekosistemine kazandırılması; öğrencilerin de kamu tarafından yürütülen çalışmaları tanıması ve katkı sunabileceği alanların oluşturulması desteklenir.",
    ],
  },
  {
    baslik: "Üniversite Toplulukları",
    paragraflar: [
      "Üniversitelerin bilişim, teknoloji, mühendislik, tasarım ve ilgili alanlardaki öğrenci topluluklarıyla iş birlikleri geliştirilir. Üniversite öğrencilerinin sosyal sorumluluk, akran öğrenmesi ve mentörlük yoluyla GençTek öğrencilerine destek olmaları; kendi deneyimlerini paylaşmaları ve ortak çalışmalar yürütmeleri teşvik edilir. Bu iş birlikleri aynı zamanda GençTek öğrencilerinin üniversite yaşamını, üniversite topluluklarını ve bilişim alanındaki farklı eğitim ve kariyer yollarını daha yakından tanımalarına katkı sağlar.",
    ],
  },
  {
    baslik: "Mentörler",
    paragraflar: [
      "Mentörler; bilişim ve teknoloji alanında deneyim sahibi sektör profesyonelleri, akademisyenler, öğretmenler ve öğrencilerden oluşur. Öğrencilerin ilgi duydukları alanlarda deneyimli kişilerle iletişim kurmaları, sorularına yanıt bulmaları ve çalışmalarını geliştirmeleri için rehberlik desteği sunarlar. Özellikle GençTek öğrencilerinin mezuniyet sonrasında da ekosistemle bağlarını sürdürmeleri ve edindikleri deneyimleri yeni nesillere aktarmaları desteklenir. Mezun mentörler; Çalışma Gruplarında, proje ekiplerinde ve organizasyon ekiplerinde danışman veya ekip lideri olarak görev alarak GençTek'e katkılarını sürdürebilir.",
    ],
  },
  {
    baslik: "Sivil Toplum Kuruluşları",
    paragraflar: [
      "Bilişim ve teknoloji alanında öğretmen ve öğrencilere yönelik çalışmalar yürüten sivil toplum kuruluşlarıyla; etki alanını genişletmek, ihtiyaçları doğru analiz etmek, sosyal fayda üretmek ve gönüllülük kültürünü güçlendirmek amacıyla iş birlikleri geliştirilir. STK'ların bilgi, deneyim ve gönüllü ağlarının GençTek öğrencileriyle buluşturulması; öğrencilerin de sosyal sorumluluk projelerinde aktif rol almaları ve teknoloji yoluyla toplumsal fayda üretmeleri desteklenir.",
    ],
  },
  {
    baslik: "Sınır Ötesi Oluşumlar",
    paragraflar: [
      "GençTek'in ulusal bir ekosistem olmanın ötesinde, öğrencilerin ve öğretmenlerin dünyadaki akranları ve teknoloji ekosistemleriyle bağlantı kurmasını hedefler. Öğretmen, öğrenci ve paydaşların uluslararası kurum ve kuruluşlar, öğrenci toplulukları, eğitim ağları ve teknoloji ekosistemleriyle iletişim kurmaları; ortak çalışmalar, deneyim paylaşımları ve uluslararası projeler geliştirmeleri için fırsatlar değerlendirilir. Bu çalışmalarla öğrencilerin dünyadaki teknoloji eğilimlerini takip etmeleri, farklı kültürlerden akranlarıyla üretmeleri ve kendilerini küresel teknoloji ekosisteminin bir parçası olarak görmeleri desteklenir.",
    ],
  },
  {
    baslik: "Sektör Temsilcileri",
    paragraflar: [
      "Bilişim ve teknoloji sektöründe faaliyet gösteren firma temsilcileri, yöneticiler ve uzmanlar GençTek ekosisteminin öğrencilerle sektör arasındaki bağlantısını güçlendiren önemli paydaşlarıdır. Sektör temsilcileri; Çalışma Gruplarında ve GençTek etkinliklerinde deneyim paylaşımı, mentörlük, eğitmenlik, proje desteği, organizasyon desteği ve sektör buluşmaları gibi farklı yollarla öğrencilere katkı sunabilir. Öğrencilerin sektörün bugünkü ihtiyaçlarını, gelecekteki dönüşümünü, farklı meslek ve uzmanlık alanlarını ve kariyer fırsatlarını yakından tanımaları sağlanırken; sektörün de gençlerin fikirlerini, beklentilerini ve ürettikleri projeleri keşfetmesine imkân oluşturulur.",
    ],
  },
];

export default function YapilanmaSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/#hakkinda">← Hakkında</Link>
          <span className="eyebrow">Ekosistemi kimler oluşturuyor</span>
          <h1>Ekosistem Yapılanması</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Şema en üstte: sayfaya gelen önce bütünü görüyor, başlıkları sonra
              tek tek okuyor. Altındaki liste şemadaki sırayı izler. */}
          <figure className="yapilanma-sema">
            <img src={gorselYolu("/medya/genctek-yapilanma.jpg")} alt="GençTek yapılanma şeması: Danışman Öğretmen, Okul Temsilcisi, Okul GençTek Ekibi, İl GençTek Koordinatörlüğü, Çalışma Grupları, GençTek Zirve Ekipleri, Kamu Kurumları, Üniversite Toplulukları, Mezun Mentörler, Sivil Toplum Kuruluşları, Sınır Ötesi Oluşumlar ve Sektör Temsilcileri" />
          </figure>

          <div className="yapilanma-liste">
            {yapilanma.map((madde, sira) => (
              <article key={madde.baslik}>
                <span>{String(sira + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{madde.baslik}</h2>
                  {madde.paragraflar.map((paragraf) => <p key={paragraf}>{paragraf}</p>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </>;
}
