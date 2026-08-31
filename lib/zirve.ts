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

export type Zirve = {
  /** Sayfanın adresi (site kökünden). */
  yol: string;
  ad: string;
  yil: string;
  /** Kart ve başlık altı için tek satırlık tanıtım. */
  ozet: string;
  metin: string;
  gorseller: ZirveGorseli[];
};

export const ZIRVE_2026: Zirve = {
  yol: "/2-genctek-zirvesi-2026",
  ad: "2. GençTek Zirvesi",
  yil: "2026",
  ozet: "63 ilden 1200 katılımcı, Ankara Hacı Bayram Veli Kongre ve Kültür Merkezi.",
  metin:
    "Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü koordinasyonunda yürütülen GençTek (Akran Öğrenme Modeli ve Genç Bilişim Ekosistemi) kapsamında Hacı Bayram Veli Kongre ve Kültür Merkezinde, 63 ilden 1200 katılımcının katılımıyla 2. GençTek Zirvesi düzenlenmiş ve zirve Millî Eğitim Bakanı Sayın Yusuf Tekin’in katılımlarıyla gerçekleştirilmiştir. Zirvede bilişim teknolojileri alanında yürütülen çalışmalar ve iyi uygulama örnekleri paylaşılmış, yeni dönem stratejilerine yönelik değerlendirmelerde bulunulmuş; bilişim teknolojileri alanında çalışmalar yürüten öğrenci ve danışman öğretmenlerin desteklenmesine, iş birliği ve iletişimlerinin güçlendirilmesine ve sektörel farkındalıklarının artırılmasına yönelik çalışmalar gerçekleştirilmiştir.\n\nAyrıca öğrencilerin disiplinler arası üretim süreçlerine aktif katılımları desteklenmiş, geliştirdikleri projelere ilişkin uygulamalar gerçekleştirilerek teknoloji temelli üretim süreçlerini deneyimlemeleri sağlanmıştır. Zirve kapsamında yürütülen etkinliklerle öğrencilerin dijital becerileri, yenilikçi düşünme ve problem çözme becerilerinin geliştirilmesine katkı sağlanmış ve “Sektörün Yeni Liderleri” vizyonu doğrultusunda bilişim teknolojileri alanındaki çalışmaların yaygınlaştırılmasına yönelik değerlendirmelerde bulunulmuştur.",
  gorseller: [
    { url: "/medya/genctek-zirvesi-2026-1.jpg", alt: "Zirvenin açılışında kürsüden konuşan yetkiliyi dolu salonda dinleyen katılımcılar" },
    { url: "/medya/genctek-zirvesi-2026-2.jpg", alt: "Sahnede belgelerini alan öğrenci ekibinin ödül töreni fotoğrafı" },
    { url: "/medya/genctek-zirvesi-2026-3.jpg", alt: "Genç Bilişim Ekosistemi paydaş panosunun önünde ekran başında sohbet eden öğrenciler" },
    { url: "/medya/genctek-zirvesi-2026-4.jpg", alt: "Millî Eğitim Bakanı ve beraberindeki heyetin öğrencilerin proje standını ziyaret etmesi" },
    { url: "/medya/genctek-zirvesi-2026-5.jpg", alt: "Millî Eğitim Bakanı Yusuf Tekin'in bir öğrenciyle proje masasında sohbet etmesi" },
    { url: "/medya/genctek-zirvesi-2026-6.jpg", alt: "2. GençTek Zirvesi panosu önünde kırmızı GençTek tişörtlü iki öğrencinin projelerini anlatması" },
    { url: "/medya/genctek-zirvesi-2026-7.jpg", alt: "Zirve sahnesinde dev ekran önünde kürsüden yapılan konuşma" },
    { url: "/medya/genctek-zirvesi-2026-8.jpg", alt: "Zirveye katılan yüzlerce öğrenci ve öğretmenin salondaki toplu fotoğrafı" },
    { url: "/medya/genctek-zirvesi-2026-9.jpg", alt: "Yuvarlak masada yürütülen çalıştay oturumu ve sunum ekranı" },
  ],
};

export const ZIRVE_2025: Zirve = {
  yol: "/zirve",
  ad: "1. GençTek Zirvesi",
  yil: "2025",
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
