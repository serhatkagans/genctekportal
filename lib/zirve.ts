/**
 * GENÇTEK ZİRVELERİ — TEK KAYNAK.
 *
 * Metinler YEĞİTEK'ten geldi (31 Ağustos 2026). Aynı içerik üç yerde
 * görünüyordu ve üçü de ayrı yazılıydı:
 *   /zirve                                  → 1. Zirve (2025)
 *   /2-genctek-zirvesi-2026                 → 2. Zirve (2026)
 *   /hakkinda/temel-etkinlikler/genctek-zirvesi → ikisi bir arada
 * Artık üçü de bu dosyadan besleniyor.
 *
 * ÖNCESİNDE İKİ ZİRVE SAYFASI WORDPRESS AKTARIMINDAN OKUNUYORDU
 * (`lib/generated/wordpress-pages.json`). O dosya kaynak sitenin arşivi;
 * elle düzeltilirse bir sonraki içe aktarımda geri gider. Sayfalar bu yüzden
 * kendi içeriğine geçti — arşiv kaydı `/arsiv/sayfalar` altında duruyor.
 *
 * 2025 ZİRVESİNİN FOTOĞRAFLARI YOK: istek üzerine eski tek kare kaldırıldı,
 * yenileri sonra gelecek. `gorseller` boş kalınca sayfa yalnızca metni basar.
 */
export type ZirveGorseli = { url: string; alt: string };

/**
 * Zirve videosu. Dosyalar `public/video` altında ve DEPODA DEĞİL — 200 MB'lık
 * bir mp4 her klonlamaya eklenirdi (bkz. .gitignore'daki medya kararı).
 * Sunucuda `/opt/genctekportal/public/video` içinde duruyor.
 */
export type ZirveVideosu = { url: string; kapak?: string; baslik: string };

export type Zirve = {
  /** Sayfanın adresi (site kökünden). */
  yol: string;
  ad: string;
  yil: string;
  /** Sayfa başlığının üstündeki satır: tarih ve şehir. */
  tarihYer: string;
  /** Kart ve başlık altı için tek satırlık tanıtım. */
  ozet: string;
  metin: string;
  gorseller: ZirveGorseli[];
  video?: ZirveVideosu;
};

export const ZIRVE_2026: Zirve = {
  yol: "/2-genctek-zirvesi-2026",
  ad: "2. GençTek Zirvesi",
  yil: "2026",
  tarihYer: "13-14 Nisan 2026 / Ankara",
  ozet: "63 ilden 1200 katılımcı, Ankara Hacı Bayram Veli Kongre ve Kültür Merkezi.",
  metin:
    "Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü koordinasyonunda yürütülen GençTek (Akran Öğrenme Modeli ve Genç Bilişim Ekosistemi) kapsamında Hacı Bayram Veli Kongre ve Kültür Merkezinde, 63 ilden 1200 katılımcının katılımıyla 2. GençTek Zirvesi düzenlenmiş ve zirve Millî Eğitim Bakanı Sayın Yusuf Tekin’in katılımlarıyla gerçekleştirilmiştir. Zirvede bilişim teknolojileri alanında yürütülen çalışmalar ve iyi uygulama örnekleri paylaşılmış, yeni dönem stratejilerine yönelik değerlendirmelerde bulunulmuş; bilişim teknolojileri alanında çalışmalar yürüten öğrenci ve danışman öğretmenlerin desteklenmesine, iş birliği ve iletişimlerinin güçlendirilmesine ve sektörel farkındalıklarının artırılmasına yönelik çalışmalar gerçekleştirilmiştir.\n\nAyrıca öğrencilerin disiplinler arası üretim süreçlerine aktif katılımları desteklenmiş, geliştirdikleri projelere ilişkin uygulamalar gerçekleştirilerek teknoloji temelli üretim süreçlerini deneyimlemeleri sağlanmıştır. Zirve kapsamında yürütülen etkinliklerle öğrencilerin dijital becerileri, yenilikçi düşünme ve problem çözme becerilerinin geliştirilmesine katkı sağlanmış ve “Sektörün Yeni Liderleri” vizyonu doğrultusunda bilişim teknolojileri alanındaki çalışmaların yaygınlaştırılmasına yönelik değerlendirmelerde bulunulmuştur.",
  gorseller: [
    { url: "/medya/genctek-zirvesi-2026-1.jpg", alt: "Zirvenin açılışında “Akran Öğrenme Modeli ve Genç Bilişim Ekosistemi – 2. GençTek Zirvesi” yazılı dev ekranın önünde kürsüden yapılan konuşma" },
    { url: "/medya/genctek-zirvesi-2026-2.jpg", alt: "Millî Eğitim Bakanı Yusuf Tekin'in zirve kürsüsünden basın mikrofonları önünde konuşması" },
    { url: "/medya/genctek-zirvesi-2026-3.jpg", alt: "Millî Eğitim Bakanı ve beraberindeki heyetin öğrencilerin proje standını ziyaret edip ürünleri incelemesi" },
    { url: "/medya/genctek-zirvesi-2026-4.jpg", alt: "Sahneden salona bakış: kürsüdeki konuşmayı dolu koltuklarda dinleyen yüzlerce öğrenci ve öğretmen" },
    { url: "/medya/genctek-zirvesi-2026-5.jpg", alt: "Fuaye alanında masalarda dizüstü bilgisayar ve tabletlerle çalışan öğrenciler ve arkadaki zirve panosu" },
  ],
  video: {
    url: "/video/genctek-zirvesi-2026.mp4",
    kapak: "/medya/genctek-zirvesi-2026-1.jpg",
    baslik: "2. GençTek Zirvesi tanıtım videosu",
  },
};

export const ZIRVE_2025: Zirve = {
  yol: "/zirve",
  ad: "1. GençTek Zirvesi",
  yil: "2025",
  tarihYer: "8-9 Mayıs 2025 / Ankara",
  ozet: "8-9 Mayıs 2025, Ankara Hacı Bayram Veli Üniversitesi Itrî Kongre ve Kültür Merkezi.",
  metin:
    "Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü koordinasyonunda yürütülen GençTek (Akran Öğrenme Modeli ve Genç Bilişim Ekosistemi) kapsamında, 8-9 Mayıs 2025 tarihlerinde Ankara Hacı Bayram Veli Üniversitesi Itrî Kongre ve Kültür Merkezi’nde 1. GençTek Zirvesi gerçekleştirilmiştir.\n\nZirvede farklı illerden öğrenci, öğretmen ve sektör temsilcileri bir araya getirilerek bilişim teknolojileri alanındaki iyi uygulama örnekleri paylaşılmış, öğrencilerin dijital becerileri, yenilikçi düşünme, problem çözme ve proje geliştirme becerilerinin desteklenmesine yönelik etkinlikler düzenlenmiştir. “Sahne Senin”, “Öğrenci Forumu”, “G2S GençTek Sektör Buluşmaları”, “MasterTek Şampiyonlar Ligi”, “EğitiJAM”, dijital oyun ve sergi alanları gibi etkinliklerle öğrencilerin akran öğrenmesi, sektör farkındalığı ve teknoloji temelli üretim süreçlerine aktif katılımları desteklenmiştir.",
  gorseller: [],
};

/** Yeniden eskiye: zirve listesi bir yerde toplanınca sıralama da tek yerde kalıyor. */
export const ZIRVELER: Zirve[] = [ZIRVE_2026, ZIRVE_2025];

/** Temel etkinlik sayfasında iki zirve tek metin hâlinde basılıyor. */
export function zirveOzetMetni() {
  return ZIRVELER.map((zirve) => `${zirve.ad} (${zirve.yil})\n\n${zirve.metin}`).join("\n\n");
}
