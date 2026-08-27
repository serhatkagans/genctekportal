import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { gorselYolu } from "@/lib/ortam";

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
 * Açıklamalar 27 Ağustos 2026'da YEĞİTEK'in kendi metinleriyle güncellendi.
 * Programların görselleri sonra eklenecek.
 */
const temelEtkinlikler = [
  {
    ad: "Genç Gölge",
    gorseller: [
      { url: "/medya/genc-golge-sensiball-vr-1.jpg", alt: "Genç Gölge kapsamında Sensiball VR'ı ziyaret eden öğrenci ve öğretmenlerin toplu fotoğrafı" },
      { url: "/medya/genc-golge-sensiball-vr-2.jpg", alt: "Bir öğrencinin VR başlığıyla Sensiball VR sahasında uygulamayı denemesi" },
    ],
    aciklama:
      "GençTek Ekosisteminde yer alan öğrencilerin Sektörün Yeni Liderleri olarak yetişebilmesi için sektör temsilcileri ile deneyim kazanmaları sağlanır. Genç Gölge, gençlerin bilişim sektörünü içeriden tanımalarını sağlayan bir öğrenme deneyimidir. Öğrenciler, profesyonellerin günlük iş yaşamına eşlik ederek mesleklerin dinamiklerini gözlemler, kariyer seçeneklerini daha bilinçli değerlendirir. Bu sayede hem sektörle gençler arasında köprü kurulmuş olur hem de öğrencilerin ufku genişler, motivasyonları artar. Öğrenci deneyimlerini ekosistemle paylaşır.",
  },
  {
    ad: "Sahne Senin",
    gorseller: [
      { url: "/medya/sahne-senin-1.jpg", alt: "Bir öğrencinin sahnede kürsüden projesinin işlem basamaklarını anlatması" },
      { url: "/medya/sahne-senin-2.jpg", alt: "Dört kişilik bir öğrenci ekibinin sahnede araç projelerini perdedeki görüntü eşliğinde sunması" },
      { url: "/medya/sahne-senin-3.jpg", alt: "Salonu dolduran izleyicilerin önünde iki öğrencinin robotik takım çalışmasını anlatması" },
      { url: "/medya/sahne-senin-4.jpg", alt: "Bir öğrencinin sahnede dolaşarak yazılım temalı sunumunu yapması" },
      { url: "/medya/sahne-senin-5.jpg", alt: "GençTek Zirvesi sahnesinde bir öğrencinin geliştirdiği uygulamanın ekranlarını tanıtması" },
      { url: "/medya/sahne-senin-6.jpg", alt: "Bir öğrencinin mikrofonla donanım tasarımı sunumunu yapması" },
    ],
    aciklama:
      "Genç Bilişim Ekosistemi, “Akran Öğrenme Modeli”ne dayalı olarak öğrencilerin birbirine bilgi ve deneyim aktardığı bir yapı sunmaktadır. İl etkinliklerinde ve GençTek Zirvesinde yer verilen “Sahne Senin” paylaşımlarında öğrencilere akranlarıyla bilgi ve deneyimlerini paylaşma fırsatı sunulmaktadır. Çevrimiçi olarak da yapılabilen “Sahne Senin” paylaşımları sayesinde çok daha fazla öğrenci etkinlikten yararlanabilmektedir.",
  },
  {
    ad: "G2S Genç Sektör Buluşmaları",
    gorseller: [
      { url: "/medya/g2s-6.jpg", alt: "G2S buluşmasının açılışında kürsüden konuşan yetkiliyi masalarda dinleyen öğrenciler" },
      { url: "/medya/g2s-1.jpg", alt: "Masada bir sektör uzmanının karşısında oturan iki öğrenciyle 15 dakikalık eşleşme görüşmesi" },
      { url: "/medya/g2s-4.jpg", alt: "Bir uzmanın masadaki öğrencilerle sohbeti" },
      { url: "/medya/g2s-5.jpg", alt: "Bir sektör temsilcisinin iki öğrenciye kariyer yolunu anlatması" },
      { url: "/medya/g2s-3.jpg", alt: "Masa 7'de öğrencilerin uzmanla görüşme sorularını doldurması" },
      { url: "/medya/g2s-7.jpg", alt: "Salonda eşleşme turunu bekleyen GençTek tişörtlü öğrenciler" },
      { url: "/medya/g2s-8.jpg", alt: "Düzce GençTek tişörtü giymiş bir öğrencinin masasından salona bakışı" },
      { url: "/medya/g2s-2.jpg", alt: "G2S Çevrimiçi Seri 2 · Oyun Tasarımı buluşmasının konuşmacılarını duyuran afiş" },
    ],
    aciklama:
      "İş dünyasında B2B ve B2C gibi aktörler arası köprü kuran iletişim modellerinin, sektör ile geleceğimiz arasında bağ kuran GençTek ihtiyaçlarına uyarlanmış Genç Sektör temsilcilerinin buluşmasını hedefleyen yenilikçi bir formatıdır. Bilişim sektöründeki uzmanları “Sektörün Yeni Liderleri” olacak öğrenciler ile bir araya getirerek, gençlerin sektörü tanımasını, rol modellerden ilham almasını ve kariyer yolculuğuna erken adım atmasını sağlamak için yapılır. Yüz yüze ve çevrimiçi olarak düzenlenen G2S’ler genel veya oyun tasarımı, yazılım geliştirme gibi özel temalı yapılmaktadır. Her öğrencinin 15 dakikalık kısa eşleştirmeler ile 4 uzman ve daha önce tanışma fırsatı bulmadığı akranları ile eşleşmeye katılması hedeflenir.",
  },
  {
    ad: "Sınır Ötesi (Beyond The Borders)",
    gorseller: [
      { url: "/medya/sinir-otesi-1.jpg", alt: "GençTek Beyond The Borders çevrim içi etkinliğinin koordinatör, mentör ve öğrenci moderatörlerini duyuran afişi" },
      { url: "/medya/sinir-otesi-2.jpg", alt: "Farklı ülkelerden altmıştan fazla katılımcının bağlandığı çevrim içi Sınır Ötesi oturumu" },
      { url: "/medya/sinir-otesi-3.jpg", alt: "Çevrim içi oturumda GençTek'i tanıtan videonun İngilizce altyazıyla izlenmesi" },
      { url: "/medya/sinir-otesi-4.jpg", alt: "Yurt dışından gelen öğrencilerin GençTek sunumunu izlediği sınıf çalışması" },
      { url: "/medya/sinir-otesi-6.jpg", alt: "Uluslararası yapay zekâ ve robotik yarışması için yola çıkan öğrenci ekibinin havalimanındaki fotoğrafı" },
      { url: "/medya/sinir-otesi-5.jpg", alt: "Öğrencilerin ev sahibi ülkenin geleneksel kıyafetleriyle akranlarıyla birlikte çektirdiği fotoğraf" },
    ],
    aciklama:
      "GençTek Ekosisteminde yer alan öğretmen, öğrenci ve paydaşların, uluslararası kurum ve kuruluşlarla, paydaşlarla, öğrenci ve öğretmenler ile iletişim ve iş birliği yaptığı etkinliklerdir. Çevrim içi düzenlenen etkinliklerde öğrencilerimiz, farklı ülkelerden akranlarıyla dijital ortamda bir araya gelmekte, teknolojik gelişmeler üzerine görüş alışverişinde bulunup deneyimlerini uluslararası bir platformda paylaşma fırsatı yakalamaktadırlar.",
  },
  {
    ad: "Öğrenci Forumu",
    aciklama:
      "Bilgi, görüş, deneyim paylaşma, tartışma, iş birliği, kişisel gelişim ve sosyal etkileşim odaklı, öğrencilerin bir araya gelerek fikirlerini paylaştıkları, tartıştıkları ve çözüm önerileri geliştirdikleri bir katılım ortamıdır. GençTek Ekosisteminde düzenlenen öğrenci forumu, özellikle Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü’nün çalışmalarını tanıtmak ve bu çalışmalara öğrencilerin gözünden bakmak için büyük önem taşır. Öğrencilerin görüş, öneri ve beklentilerinin alınması; eğitim teknolojilerinin daha etkili, daha yenilikçi ve gençlerin gerçek ihtiyaçlarına uygun şekilde gelişmesine katkı sağlar. Öğrenci forumu ile özellikle bilişim alanında belli bir yol almış öğrencilerin fikir ve önerileri ile sunulan hizmetlerin geliştirilmesi, eğitim politikalarına yön verilmesi hedeflenmektedir. “YEĞİTEK İçin Gençlerden 5 Öneri” başlıklı ilk Öğrenci Forumu, 1. GençTek Zirvesi kapsamında gerçekleştirilmiştir. 2. GençTek Zirvesi’nde ise “EBA İçin Gençlerden 5 Öneri” başlıklı Öğrenci Forumu düzenlenmiştir.",
  },
  {
    ad: "Hack The Idea",
    aciklama:
      "GençTek öğrencilerinin ve öğretmenlerinin bilişim alanında karşıt görüşleri savunan takımların fikirlerini çarpıştırdıkları bir sohbet ve tartışma platformudur.",
  },
  {
    ad: "Akran Öğretimi",
    aciklama:
      "Genç Bilişim Ekosistemi akran öğretim modeline dayanmaktadır. Benzer sosyal gruplardan gelen kişilerin birbirlerine öğrenmede yardım etmesi ve öğreterek kendilerinin de öğrenmesini sağlayan, öğrencilerin akademik, sosyal ve davranışsal beceriler geliştirmek için birlikte çalıştığı öğrenme stratejisidir. Öğrencilerin birbirleriyle etkileşimleri arttırılırken öğrenen topluluklar hedeflenmektedir.",
  },
  {
    ad: "Dijital Yürüyüş STEM",
    aciklama:
      "Öğrencilerin verilen gerçek dünya problemlerine ilişkin ekip çalışması ile çözümler ürettiği, bu çözümleri jüri üyelerine sunup akranlarıyla paylaştığı bir STEM etkinliğidir.",
  },
  {
    ad: "Oyunun e Hâli",
    aciklama:
      "Öğrenmenin en doğal ve etkili yollarından biri olan “oyun” ve “oyunlaştırma” eğitimin temel unsurlarındandır. Oyunun e Hâli, GençTek Ekosistemi kapsamında öğrencilerin bilişim sektöründe ve gündelik hayatta ihtiyaç duyulan becerilerini geliştirirken, öğrenme deneyimlerini dijital oyunlar ile keyifli, kalıcı ve ilgi çekici hâle getirmeyi hedefler. Oyunun e Hâli çalışmaları ile öğrencilerin hayatlarında önemli bir yer kaplayan dijital oyunlardan gelişim fırsatı olarak yararlanırken, dijital oyun tasarımı, programlama, yapay zekâ ve espor gibi sektörler hakkında öğrencilerin bilgi ve deneyim kazanması sağlanır.",
  },
  {
    ad: "Tek Maraton",
    aciklama:
      "Eğitim Teknolojileri Fikir Maratonu olan Tek Maraton, GençTek öğrencilerinin ve öğretmenlerinin eğitim teknolojileri sektörüne ilişkin çözüm önerileri ve fikir geliştirdikleri bir ideathon türüdür.",
  },
  {
    ad: "Misafir Öğretmenlik/Öğrencilik",
    gorseller: [
      { url: "/medya/misafir-ogrenci-osmangazi-1.jpg", alt: "Eskişehir Osmangazi Üniversitesi Mühendislik Fakültesi'ndeki Üniversite Misafir Öğrenci Etkinliği afişi" },
      { url: "/medya/misafir-ogrenci-anadolu-1.jpg", alt: "Anadolu Üniversitesi'ndeki Üniversite Misafir Öğrenci Etkinliği afişi" },
      { url: "/medya/misafir-ogrenci-anadolu-2.jpg", alt: "Misafir öğrencilerin üniversitenin hareket yakalama stüdyosunda animasyon çekimini izlemesi" },
    ],
    aciklama:
      "Belirli bir alanda uzmanlık geliştirmiş olan öğrencilerin veya öğretmenlerin bu uzmanlığını ya da deneyimlerini aktarmak amacıyla başka bir ekibe ya da çalışma grubuna geçici olarak katılmasıdır. Okullar arası yapılacak gezi planları kapsamında öğrencilerin diğer akranlarıyla iletişimi ve iş birlikleri artırılır. Birbirlerinin okullarına misafir olan öğrencilerden hem akranlarına faydalı olması hem de iyi çalışmaların yaygınlaştırılmasına katkıda bulunması beklenir. Ayrıca, GençTek İl Koordinatörleri tarafından GençTek öğrencilerinin üniversitelerin ilgili bölümlerindeki derslere misafir öğrenci olarak katılması için girişimlerde bulunulur.",
  },
  {
    ad: "Hatalarından Ders Çıkar / Harika Bir Başarısızlık Tasarla",
    aciklama:
      "Öğrencilerin bilişim sektöründeki kriz yönetimine ilişkin becerilerini geliştirmek üzere planlanmış “Hatalarından Ders Çıkar” etkinliklerinde ekipler, bilişim firmalarının başına gelebilecek kriz durumlarına ilişkin teknik ve stratejik kararlar ile çözüm önerileri geliştirir.",
  },
  {
    ad: "GençTek Zirvesi",
    aciklama: "",
    gorseller: [
      { url: "/medya/genctek-zirvesi-1.jpg", alt: "GençTek Zirvesi'nde fuar alanında toplanan yüzlerce öğrenci, öğretmen ve paydaşın toplu fotoğrafı" },
    ],
  },
];

const calismaGrubuEtkinlikleri = [
  {
    ad: "EğitiJAM",
    gorseller: [
      { url: "/medya/egitijam-2.jpg", alt: "EğitiJAM 2024 K12 Oyun Geliştirme Maratonu programının salondaki açılış oturumu" },
      { url: "/medya/egitijam-1.jpg", alt: "Bir oyun geliştiricinin EğitiJAM programında kürsüden deneyimlerini anlatması" },
      { url: "/medya/egitijam-3.jpg", alt: "EğitiJAM 2024 ödül töreninde plaket ve belgelerini alan öğrenci ekipleri" },
      { url: "/medya/egitijam-4.jpg", alt: "EğitiJAM'de dereceye giren bir ekibin plaketini alması" },
      { url: "/medya/egitijam-5.jpg", alt: "EğitiJAM K12 Oyun Geliştirme Maratonu'nun 23-25 Ocak 2026 duyuru görseli" },
    ],
    aciklama:
      "“Eğitim Oyunla Başlar” — EğitiJAM K12 Oyun Geliştirme Maratonu, Türkiye genelinde öğrencilerin ve eğitimcilerin oyun geliştirme farkındalığını artırmak için düzenlenen 48 saatlik çevrimiçi bir Game Jam’dir. Game Jam’ler kısıtlı bir sürede, verilen temadan dijital oyun geliştirilmeye çalışılan bir hackathon etkinliğidir. “Eğitim Oyunla Başlar” sloganıyla düzenlenen EğitiJAM Oyun Geliştirme Maratonları ulusal olarak gerçekleştirilir.",
  },
  {
    ad: "Capture The Flag (Bayrağı Yakala)",
    aciklama:
      "Bayrağı Yakala (CTF), katılımcıların siber güvenlik problemlerini çözerek ilerlediği 24 saatlik çevrimiçi bir bayrak avı etkinliğidir. Verilen görevler tamamlanarak bayraklar yakalanır ve puan toplanır. Süre bittiğinde belirlenen puan ve üstünü alan öğrenciler paylaşılır.",
  },
  { ad: "Mobil Uygulama Geliştirme Yarışması", aciklama: "" },
  { ad: "Teknik Gezi", aciklama: "" },
  {
    ad: "Master Tek",
    aciklama:
      "Alanında uzman olan öğretmenlerin; takım çalışması, iş birliği ve centilmenlik örneği sergileyip öğrencilere rol model olmak için verilen temalarda yarıştığı bir GençTek etkinliğidir.",
  },
  { ad: "E-Ticaret Ideathonu", aciklama: "" },
];

// Fotoğraflar isteğe bağlı: çoğu programın görseli henüz yok, olanlarda
// açıklamanın altına şerit hâlinde geliyor. next/image yerine düz <img>:
// listedeki görseller sabit ve az sayıda, ölçeklenmiş hâlleri public/medya'da.
type Etkinlik = {
  ad: string;
  aciklama: string;
  gorseller?: { url: string; alt: string }[];
};

function EtkinlikListesi({ kayitlar }: { kayitlar: Etkinlik[] }) {
  return (
    <div className="value-list">
      {kayitlar.map((kayit, sira) => (
        <article key={kayit.ad}>
          <span>{String(sira + 1).padStart(2, "0")}</span>
          <h3>{kayit.ad}</h3>
          {kayit.aciklama ? <p>{kayit.aciklama}</p> : null}
          {kayit.gorseller?.length ? (
            <div className="etkinlik-fotograflari">
              {kayit.gorseller.map((gorsel) => (
                <img key={gorsel.url} src={gorselYolu(gorsel.url)} alt={gorsel.alt} loading="lazy" decoding="async" />
              ))}
            </div>
          ) : null}
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

    </main>
    <Footer />
  </>;
}
