import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "GençTek Nedir? · GençTek",
  description:
    "GençTek; öğrencileri, danışman öğretmenleri ve bilişim sektörünü buluşturan ülke çapında bir üretim ekosistemidir.",
};

const MADDELER = [
  "Bilişim alanında çalışma gerçekleştirmek isteyen, bu alanda çalışmalar yürüten ya da mevcut çalışmalarının etkisini ve niteliğini arttırmak isteyen öğrencileri ve öğretmenleri desteklemek,",
  "Genel Müdürlüğün yenilik ve eğitim teknolojileri alanındaki bilgi birikimi ve uygulama deneyimini, bilişim alanında çalışan öğrenci ve öğretmenlere aktaracak model, etkinlik, içerik ve paylaşım mekanizmaları geliştirmek ve uygulamak,",
  "Bilişim ekosisteminde akran öğretimini, iş birliğini ve bilgi paylaşımını güçlendirerek öğrenci ve öğretmenlerin ekosistemden ve paydaşlardan destek almasını sağlamak,",
  "Sektörün ihtiyaç duyduğu nitelikli insan kaynağının yetiştirilmesine katkı sağlamak amacıyla; öğrencilere kariyer farkındalığı kazandırmak, sektör tanıtım faaliyetleri düzenlemek ve sektör temsilcileri ile öğrenciler arasında bilgi, deneyim ve fırsat paylaşımını desteklemek,",
  "Yeni çalışma, proje ve etkinliklerin geliştirilmesine, genç bilişim ekiplerinin kurulmasına, mevcut ekiplerin güçlendirilmesine, ekip çalışmalarının ekosistem aracılığıyla yaygınlaştırılmasına ve sürdürülebilirliğine katkıda bulunmak,",
  "Bakanlık tarafından geliştirilen uygulama, platform, içerik ve projeleri genç bilişim ekosistemi öğrencilerine tanıtmak; bu çalışmalara ilişkin öğrencilerin görüş ve önerilerini değerlendirmek,",
  "Bilişim alanında beceri kazanmış öğrencileri; eğitim öğretim süreçlerinde kullanılabilecek oyun, dijital içerik, uygulama ve benzeri ürünler geliştirmeye teşvik etmek,",
  "Okullar, ilçeler, iller ve farklı sınıf seviyeleri arasında karma ekipler oluşturarak; dikey inovasyonu, disiplinler arası çalışmaları ve iletişimi desteklemek,",
  "Genç bilişim ekosistemindeki öğrencilere yönelik ulusal ve uluslararası çalışmaları takip etmek, ilgili kurum ve kuruluşlarla iş birliği fırsatlarını değerlendirmek,",
  "Genç bilişim ekosisteminde ulusal ve uluslararası düzeyde düzenlenen bilişim etkinliklerini, eğitim hedefleri, öğrenme çıktıları, yaygınlaştırılabilirlik ve etik ilkeler çerçevesinde değerlendirerek eğitim öğretim süreçlerini destekleyici modeller sunmak,",
  "Genç bilişim ekosisteminde yer alan öğrencilerle eğitim süreçleri ve sonrasında iletişimi sürdürerek; ekosistem içindeki öğrenciler arasında akran öğrenmesi, mezun öğrenciler aracılığıyla rehberlik ve mentörlük ile sosyal sorumluluk temelli destek mekanizmalarının devamlılığını sağlamak,",
  "Genç bilişim ekosisteminin geliştirilmesi ve genişletilmesine yönelik olarak Genel Müdürlüğün ihtiyaçları doğrultusunda ulusal ve uluslararası paydaşlarla ortak çalışma modelleri oluşturmak, iş birlikleri geliştirmek, pilot uygulamalar ve projeler yürütmek; bu kapsamdaki yaygınlaştırma ve topluluk oluşturma faaliyetlerini planlamak ve gerçekleştirmek,",
];

export default function GenctekNedirSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/#hakkinda">← Hakkında</Link>
          <span className="eyebrow">YEĞİTEK</span>
          <h1>GençTek</h1>
          <p>Akran Öğrenme Modeli ve Genç Bilişim Ekosistemi / Sektörün Yeni Liderleri</p>
        </div>
      </section>

      <section className="section">
        <div className="container prose-grid">
          <div>
            {/*
              METİN YEĞİTEK'İN KENDİ TANIMI (31 Ağustos 2026 · istek: "Kısaca
              yerine Genç Bilişim Ekosistemi Koordinatörlüğü"). Portalın kendi
              yazdığı özet metin yerine kurumun resmî tanımı basılıyor.
              Başlıktan "Koordinatörlüğü" 1 Eylül 2026'da çıkarıldı: bölüm
              koordinatörlüğü değil, ekosistemin kendisini anlatıyor.
            */}
            <h2>Genç Bilişim Ekosistemi</h2>
            <p>GençTek, Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü koordinasyonunda, bilişim alanında çalışma gerçekleştirmek isteyen, çalışmalar yürüten ya da mevcut çalışmalarının etkisini arttırmak isteyen öğrencilerin ve danışman öğretmenlerin desteklendiği, birbirleriyle ve paydaşlarla iletişim ve iş birliğinin sağlandığı genç bilişim ekosistemidir.</p>
            <p>YEĞİTEK Genç Bilişim Koordinatörlüğü tarafından yürütülen ekosistem çalışmaları; İl Millî Eğitim Müdürlüklerinde görevlendirilen İl GençTek Koordinatörü Öğretmenler ve gönüllü komisyon üyeleri aracılığıyla yerel düzeyde yaygınlaştırılmakta, öğrencilerin ve öğretmenlerin ekosisteme aktif katılımı desteklenmektedir.</p>
            <p>GençTek; akran öğrenmesini, ekip çalışmasını, üretimi, paylaşımı ve sektörle etkileşimi destekleyen bir ekosistem yaklaşımıyla faaliyetlerini sürdürmektedir.</p>
          </div>
          {/*
            KOORDİNATÖRLÜĞÜN GÖREVLERİ (31 Ağustos 2026 · istek: "SAĞDAKİ
            MADDELER"). Üç sloganlık kutu yerine YEĞİTEK'in kendi on iki
            maddesi; numaralar metnin parçası olduğu için elle değil, dizinin
            sırasından üretiliyor.
          */}
          <div className="value-list">
            {MADDELER.map((madde, sira) => (
              <article key={madde}>
                <span>{String(sira + 1).padStart(2, "0")}</span>
                <p>{madde}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </>;
}
