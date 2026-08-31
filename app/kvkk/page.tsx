import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "KVKK Aydınlatma Metni · GençTek",
  description: "Kişisel Verilerin İşlenmesi Aydınlatma Metni.",
};

/*
 * AYDINLATMA METNİ YEĞİTEK'TEN GELDİ (31 Ağustos 2026 · istek: "kvkk sayfasına
 * bunu koy"). Sayfada önce "prototip bildirimi" duruyordu — site canlı olduğu
 * için o metin yanıltıcıydı, yerini kurumun kendi metni aldı.
 *
 * METNE DOKUNULMADI, yalnızca üç yazım hatası düzeltildi: "Ayınlatma" →
 * "Aydınlatma", "Milli Eğiti Bakanlığı" → "Millî Eğitim Bakanlığı" ve
 * kopyalamadan gelen çoklu boşluklar. Bölüm numaraları başlığın parçası
 * (metindeki "1., 2., …" sırası korunsun diye).
 *
 * ADRES VE İLETİŞİM BİLGİSİ SABİT: alt bilgideki iletişim yönetim panelinden
 * geliyor ama bu metindeki başvuru adresi hukuki metnin parçası — panelden
 * değişirse metnin kendisi de değişmeli, bu yüzden burada yazılı duruyor.
 */
const haklar = [
  "Kişisel verilerinizin işlenip işlenmediğini öğrenme.",
  "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme.",
  "Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme.",
  "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme.",
  "Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme.",
  "Kişisel verilerinizin silinmesini veya yok edilmesini isteme.",
  "Kişisel verilerin düzeltilmesi, silinmesi veya yok edilmesine ilişkin işlemlerin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme.",
  "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme.",
  "Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.",
];

const amaclar: [string, string][] = [
  ["Hizmet Sunumu", "Web sitemiz, dijital platformlarımız ve online öğrenme ortamlarımız üzerinden sunulan hizmetlerin sağlanması."],
  ["Eğitim ve Öğretim", "Dijital içerikler, eğitim materyalleri ve online derslerin sunulması ve yönetilmesi."],
  ["Kullanıcı Deneyimi", "Kullanıcı deneyiminin iyileştirilmesi, kişiselleştirilmiş hizmet sunumu ve kullanıcı tercihlerinin hatırlanması."],
  ["Yasal Yükümlülükler", "Yasal ve düzenleyici gerekliliklerin yerine getirilmesi."],
  ["İletişim", "Kullanıcılarımızla iletişim kurulması ve bildirimlerin iletilmesi."],
  ["Güvenlik", "Bilgi güvenliği süreçlerinin yürütülmesi ve kullanıcılarımızın verilerinin korunması."],
  ["Analiz ve Raporlama", "Hizmetlerimizin performansını analiz etmek ve raporlamak."],
];

const hukukiSebepler: [string, string][] = [
  ["Kanunlarda Açıkça Öngörülmesi", "Kişisel verilerinizin işlenmesinin kanunlarda açıkça öngörülmesi."],
  ["Sözleşmenin İfası", "Sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması."],
  ["Hukuki Yükümlülüğün Yerine Getirilmesi", "Veri sorumlusunun hukuki yükümlülüklerini yerine getirebilmesi için zorunlu olması."],
  ["Meşru Menfaat", "Veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması, temel hak ve özgürlüklerinize zarar vermemek kaydıyla."],
];

export default function KvkkSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <span className="eyebrow">Yasal bilgiler</span>
          <h1>Kişisel Verilerin İşlenmesi Aydınlatma Metni</h1>
          <p>Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında veri sorumlusu sıfatıyla Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü tarafından hazırlanmıştır.</p>
        </div>
      </section>

      <section className="section">
        <div className="article-body">
          <h2>1. Veri Sorumlusu</h2>
          <p>KVKK uyarınca, kişisel verileriniz Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü tarafından veri sorumlusu sıfatıyla işlenmektedir.</p>

          <h2>2. Kişisel Verilerin İşlenme Amaçları</h2>
          <p>Kişisel verileriniz, aşağıdaki amaçlarla işlenmektedir:</p>
          <ul>
            {amaclar.map(([baslik, metin]) => <li key={baslik}><strong>{baslik}:</strong> {metin}</li>)}
          </ul>

          <h2>3. Kişisel Verilerin Toplanma Yöntemleri ve Hukuki Sebepler</h2>
          <p>Kişisel verileriniz, web sitemiz, mobil uygulamalarımız, dijital platformlarımız ve diğer iletişim kanallarımız aracılığıyla elektronik ortamda toplanmaktadır. Kişisel verilerinizin toplanma ve işlenme hukuki sebepleri şunlardır:</p>
          <ul>
            {hukukiSebepler.map(([baslik, metin]) => <li key={baslik}><strong>{baslik}:</strong> {metin}</li>)}
          </ul>

          <h2>4. Kişisel Verilerin Aktarımı</h2>
          <p>İşlenen kişisel verileriniz, yukarıda belirtilen amaçlar doğrultusunda ve KVKK&apos;nın 8. ve 9. maddelerine uygun olarak, yalnızca yetkili kamu kurum ve kuruluşları ile hukuken yetkili özel hukuk tüzel kişileri ile paylaşılabilecektir. Ayrıca, platformun teknik altyapısını sağlayan üçüncü taraf hizmet sağlayıcılarla da gerekli güvenlik önlemleri alınarak paylaşım yapılabilmektedir.</p>

          <h2>5. Kişisel Verilerin Saklanma Süresi</h2>
          <p>Kişisel verileriniz, yukarıda belirtilen amaçlarla gerekli olan süre boyunca saklanacak olup, yasal saklama sürelerinin bitiminde veya işlenme amacının ortadan kalkması hâlinde imha edilecektir.</p>

          <h2>6. KVKK Kapsamındaki Haklarınız</h2>
          <p>KVKK&apos;nın 11. maddesi uyarınca, kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:</p>
          <ul>
            {haklar.map((hak) => <li key={hak}>{hak}</li>)}
          </ul>

          <h2>7. İletişim</h2>
          <p>Kişisel verilerinize ilişkin taleplerinizi Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ&apos;e göre aşağıdaki iletişim bilgileri üzerinden iletebilirsiniz:</p>
          <p>
            Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü<br />
            Emniyet Mahallesi, Milas Sokak, No: 8, 06560 Yenimahalle / ANKARA<br />
            Telefon: <a href="tel:+903122969400">0312 296 94 00</a><br />
            E-posta: <a href="mailto:yegitek@meb.gov.tr">yegitek@meb.gov.tr</a><br />
            İletişim formu: <a href="https://yegitek.meb.gov.tr/www/eposta_gonder.php" target="_blank" rel="noreferrer">yegitek.meb.gov.tr ↗</a>
          </p>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
