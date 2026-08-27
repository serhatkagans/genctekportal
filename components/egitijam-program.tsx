import Link from "next/link";
import { TEMA_ARSIV_CAPASI } from "@/lib/tema-kaynak";

const hedefler = [
  "K12 düzeyinde oyun geliştirme farkındalığını artırmak",
  "Eğitim amaçlı oyun fikirlerinin geliştirilmesini desteklemek",
  "Öğrenci ve öğretmenlerin birlikte üretmesini güçlendirmek",
  "Gençleri oyun geliştirme, tasarım ve sanat alanlarında üretime teşvik etmek",
  "Eğitimcilerin oyun ekosistemine ilişkin bilgi ve deneyimini geliştirmek",
  "Gelecekte kurulabilecek genç oyun stüdyoları için ilk adımı oluşturmak",
];

const takvim = [
  ["23 Kasım 2025 – 22 Ocak 2026", "Başvuruların alınması"],
  ["23 Ocak 2026 · 19.00", "Temanın açıklanması ve maratonun başlaması"],
  ["25 Ocak 2026 · 20.00", "48 saatlik geliştirme sürecinin bitişi"],
  ["25 Ocak 2026 · 22.00", "Oyunun itch.io sayfasına yüklenmesi"],
  ["26 Ocak 2026", "Oyun sayfası ve tanıtım videosu düzenlemeleri"],
  ["8 Şubat 2026", "Ön değerlendirmenin tamamlanması"],
  ["15 Şubat 2026", "Jüri değerlendirmesi"],
  ["22 Şubat 2026", "Sergilenmeye değer oyunların ilanı"],
];

const kriterler = [
  ["Tema ile uyum", "20"], ["Oynanış", "20"], ["Naratif", "20"],
  ["Görsel tasarım", "20"], ["İşitsel tasarım", "20"], ["EğitiJAM Ruhu", "+5"],
];

const kurallar = [
  "Her takım yalnızca bir projeyle katılır; proje maraton süresinde geliştirilir.",
  "Herhangi bir oyun motoru kullanılabilir; son sürüm Windows bilgisayarda çalışmalıdır.",
  "Hazır görsel, müzik, ses efekti ve yapay zekâ desteği kullanılabilir; kullanılan kaynaklar oyun sayfasında açıkça belirtilir.",
  "Oyun sayfasında danışman öğretmen ile tüm ekip üyelerinin adları, rolleri, tanıtım metni ve oynanış videosu bulunur.",
  "İçerik reklam barındırmaz; kişisel verileri, bireysel hak ve özgürlükleri korur.",
  "İnsan haklarını, toplumsal eşitliği ve kapsayıcı temsili destekleyen bir anlatım kullanılır.",
  "Ayrımcı, aşağılayıcı, zararlı veya öğrenciler için uygun olmayan içeriklere yer verilmez.",
  "Çalıştırılamayan, riskli dosya içeren veya kurallara aykırı projeler değerlendirme dışı kalabilir.",
];

export function EgitijamProgram() {
  return <section className="egitijam-program" aria-labelledby="egitijam-program-baslik">
    <div className="container">
      <header className="egitijam-program-head">
        <div><span className="eyebrow">2026 program arşivi</span><h2 id="egitijam-program-baslik">EğitiJAM K12 Oyun Geliştirme Maratonu</h2></div>
        <p>“Eğitim Oyunla Başlar” yaklaşımıyla düzenlenen ulusal ve çevrim içi Game Jam; verilen tema üzerinden 48 saat içinde oynanabilir bir oyun geliştirmeye odaklanır.</p>
      </header>

      <div className="egitijam-facts" aria-label="Program özeti">
        <article><strong>48</strong><span>saat geliştirme</span></article>
        <article><strong>5</strong><span>kişiye kadar takım</span></article>
        <article><strong>1</strong><span>danışman öğretmen</span></article>
        <article><strong>K12</strong><span>öğrenci ekipleri</span></article>
      </div>

      <div className="egitijam-two-column">
        <section><span className="theme-list-label">Amaç</span><h3>Maraton neyi hedefliyor?</h3><ul className="egitijam-check-list">{hedefler.map((hedef)=><li key={hedef}>{hedef}</li>)}</ul></section>
        <section><span className="theme-list-label">İşleyiş</span><h3>48 saat nasıl ilerliyor?</h3><p>Tema cuma akşamı açıklanır. Takımlar danışman öğretmenleriyle birlikte oyun fikrini tasarlar, geliştirir ve test eder. Süre sonunda oyun itch.io sayfasına yüklenir; tanıtım videosu ve sayfa düzenlemeleri için ayrıca zaman verilir.</p><p>Projeler önce ön değerlendirmeden, ardından alan uzmanlarından oluşan jüri değerlendirmesinden geçer.</p><Link className="text-link" href="https://itch.io/jam/egitijam2026" target="_blank" rel="noreferrer">2026 oyun sayfasını incele ↗</Link></section>
      </div>

      <section className="egitijam-timeline"><span className="theme-list-label">Takvim</span><h3>2026 program akışı</h3><ol>{takvim.map(([tarih,baslik],index)=><li key={tarih}><span className="egitijam-timeline-no">{String(index+1).padStart(2,"0")}</span><time>{tarih}</time><strong>{baslik}</strong></li>)}</ol></section>

      <div className="egitijam-two-column egitijam-bottom-grid">
        <section><span className="theme-list-label">Değerlendirme</span><h3>100 puan + EğitiJAM Ruhu</h3><div className="egitijam-scores">{kriterler.map(([ad,puan])=><div key={ad}><span>{ad}</span><strong>{puan}</strong></div>)}</div></section>
        <section><span className="theme-list-label">Katılım çerçevesi</span><h3>Temel kurallar</h3><details className="egitijam-rules"><summary>Kuralların özetini göster</summary><ul>{kurallar.map((kural)=><li key={kural}>{kural}</li>)}</ul></details><p className="egitijam-source-note">Bu bölüm bilgilendirme amaçlı bir özettir. Tam ve bağlayıcı metin için aşağıdaki arşivde duran resmî duyuruyu inceleyin.</p><Link className="button button-secondary" href={`#${TEMA_ARSIV_CAPASI}`}>Resmî EğitiJAM duyurusunun tamamı ↓</Link></section>
      </div>

      <aside className="egitijam-faq"><strong>Kimler katılabiliyordu?</strong><p>Türkiye’deki resmî ve özel okullarda öğrenim gören öğrenciler, danışman öğretmenli takımlarla katılabiliyordu. Yazılım veya oyun motoru sınırlaması bulunmuyordu; takımların birbirine destek olması EğitiJAM kültürünün bir parçasıydı.</p></aside>
    </div>
  </section>;
}
