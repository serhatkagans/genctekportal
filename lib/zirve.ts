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

export type ZirveVurgusu = { deger: string; etiket: string };

/** Zirve programının başlıklı bölümleri (oturumlar, alanlar, etkinlikler). */
export type ZirveBolumu = { baslik: string; metin: string };

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
  /** Başlığın altındaki sayı şeridi; boş bırakılırsa şerit basılmaz. */
  vurgular?: ZirveVurgusu[];
  /** Program bölümleri: metnin ardından başlıklı bloklar hâlinde basılır. */
  bolumler?: ZirveBolumu[];
  gorseller: ZirveGorseli[];
  video?: ZirveVideosu;
};

export const ZIRVE_2026: Zirve = {
  yol: "/2-genctek-zirvesi-2026",
  ad: "2. GençTek Zirvesi",
  yil: "2026",
  tarihYer: "13-14 Nisan 2026 / Ankara",
  ozet: "Ankara",
  metin:
    "Millî Eğitim Bakanlığı Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü koordinasyonunda yürütülen GençTek Akran Öğrenme Modeli ve Genç Bilişim Ekosistemi çalışmaları kapsamında 13-14 Nisan 2026 tarihlerinde Hacı Bayram Veli Kongre ve Kültür Merkezinde 2. GençTek Zirvesi düzenlenmiş ve zirve Millî Eğitim Bakanı Sayın Yusuf Tekin’in katılımlarıyla gerçekleştirilmiştir.\n\nGenç Bilişim Ekosisteminin tüm paydaşlarını bir araya getirmeyi amaçlayan bu Zirve’de 63 ilden 1200 katılımcı Ankara’da misafir edilmiştir.\n\nZirvede bilişim teknolojileri alanında yürütülen çalışmalar ve iyi uygulama örnekleri paylaşılmış, yeni dönem stratejilerine yönelik değerlendirmelerde bulunulmuş; bilişim teknolojileri alanında çalışmalar yürüten öğrenci ve danışman öğretmenlerin desteklenmesine, iş birliği ve iletişimlerinin güçlendirilmesine ve sektörel farkındalıklarının artırılmasına yönelik çalışmalar gerçekleştirilmiştir. “Sektörün Yeni Liderleri” vizyonu doğrultusunda bilişim teknolojileri alanındaki çalışmaların yaygınlaştırılmasına yönelik değerlendirmelerde bulunulmuştur.",
  vurgular: [
    { deger: "63", etiket: "il" },
    { deger: "1200", etiket: "katılımcı" },
    { deger: "32", etiket: "sektör uzmanı" },
  ],
  /*
   * ZİRVE PROGRAMI (YEĞİTEK metni, 1 Eylül 2026): oturumlar ve alanlar tek bir
   * uzun paragraf yerine başlıklı bölümler hâlinde duruyor; sayfada da öyle
   * basılıyor, /hakkinda/temel-etkinlikler özetine girmiyor.
   */
  bolumler: [
    {
      baslik: "Bilgisayar Olimpiyatları Oturumu",
      metin:
        "GençTek öğrencilerinin TÜBİTAK ulusal ve uluslararası bilgisayar olimpiyatlarıyla ilgili analitik düşünme, algoritma kurma ve karmaşık problemleri en verimli şekilde çözme yeteneğinin geliştirilmesini hedefleyen bu oturum, Prof. Dr. Muhammed Fatih Demirci (TÜBİTAK Bilgisayar Dalı Komite Başkanı) ve Doç. Dr. Burkay Genç (Hacettepe Üniversitesi Bilgisayar Mühendisliği Anabilim Dalı) destekleriyle gerçekleştirilmiştir. Geleceğin yazılımcıları ve bilgisayar bilimcilerine “olimpiyatçı bakış açısını” kazanma, bilgisayar olimpiyatlarının yapısını ve kapsamını yakından tanıma, farklı zorluk düzeylerindeki örnek sorular üzerinden çözüm yaklaşımlarını görme fırsatı sağlanmıştır.",
    },
    {
      baslik: "Hack The Idea Oturumu (Rol Temelli Münazara/Müzakere)",
      metin:
        "Hack The Idea, öğrencilerin teknoloji, eğitim ve toplum ilişkisini çok yönlü analiz edebilme becerilerini geliştirmek, teknoloji temelli bir sorunu farklı paydaş bakış açılarıyla tartışmak ve ortak çözüm üretmek amacıyla tasarlanmış bir rol temelli münazara etkinliğidir. Öğrenci ekipleri okul yöneticisi, öğretmen, veli, öğrenci rolleri perspektifinden “Yapay Zekânın Eğitimde Kullanımı” konusunda karşıt görüşü savunacak öğretmenlere karşı argüman geliştirmeye çalışmışlardır.",
    },
    {
      baslik: "Çalışma Grubu Toplantıları",
      metin:
        "Yapay Zekâ, Web/Mobil, Robotik, Siber Güvenlik, Havacılık Sistemleri, Açık Kaynak (Pardus Hata Yakalama) gibi çalışma grubu toplantıları yapılmıştır.",
    },
    {
      baslik: "GençTek Ruhu Görevleri",
      metin:
        "GençTek Zirvesinde bir araya gelen öğrenci ekiplerinin iş birliği ve iletişimlerini artırmak için GençTek Ruhu Görevleri belirlenmiştir. Farklı illerden oluşturulan 10 kişilik öğrenci gruplarına KAPTAN öğrenciler atanmıştır. KAPTAN’lar ekiplerinin önce kendi aralarında sonra diğer ekiplerle iletişimini güçlendirecek görevlerin gerçekleştirilmesinde gönüllü destek sağlamış, belirlenmiş görevleri ekiplerinin tamamlamasına yardımcı olmuşlardır.",
    },
    {
      baslik: "Bilişim Hukuku ve Güvenli İnternet Oturumu",
      metin:
        "Bilişim Hukuku avukatlarının, Siber Güvenlik Kümelenmesi ve Emniyet Genel Müdürlüğü uzmanlarının katılımıyla soru cevap oturumu yapılmıştır. Öğretmen ve öğrencilerin soruları uzmanlar tarafından cevaplanmıştır.",
    },
    {
      baslik: "Öğrenci ve Öğretmen Forumu Oturumları",
      metin:
        "Yenilenen EBA platformuna ilişkin Sistem Geliştirme ve Yönetimi Daire Başkanlığı uzmanları tarafından pilot çalışmalara ilişkin sunum yapılmış, ardından “EBA İçin Öğrencilerden/Öğretmenlerden 5 Öneri” konulu forumlar yapılmıştır.",
    },
    {
      baslik: "Sahne Senin Öğrenci Sunumları",
      metin:
        "İl ekiplerindeki öğrencilere 8 dakikalık sunumlarla deneyim paylaşımı imkânı tanınmıştır. Bir Hacker Nasıl Yetişir, Genç Liderlik ve Topluluk İnşa Etmenin Gücü, Bilişimde Çok Yönlülük, Asimetrik Savunmanın Geleceği, Kendine İnan, Öğrenmenin Gerçek Hikâyesi, Sosyal Medya Miti ve Gerçekler gibi başlıklarda 22 “Sahne Senin” paylaşımı öğrenciler tarafından katılımcılarla paylaşılmıştır.",
    },
    {
      baslik: "Tek Maraton / Eğitim Teknolojileri Fikir Maratonu",
      metin:
        "GençTek öğrencilerinin ve öğretmenlerinin eğitim teknolojileri sektörüne ilişkin çözüm önerileri ve fikir geliştirdikleri bir ideathon türü olan Tek Maraton; Aydın, Bursa, Denizli, Eskişehir, Gaziantep, Kahramanmaraş, Manisa, Mardin ve Yozgat illerinden 9 takımın katılımıyla gerçekleştirilmiştir. “Genç Bilişim Ekosistemi tarafından da kullanılabilecek bir platform fikri” geliştirmeleri istenen Tek Maraton’da takımlarca geliştirilen fikirler Girişimcilik Koordinatörlüğü jüri üyeleri tarafından değerlendirilmiştir. Genç Bilişim Ekosistemi öğretmen ve öğrencilerine Bakanlığımızın sağladığı girişim fırsatları ile sunulan destekler Ar-Ge ve Ekosistem Daire Başkanlığı tarafından katılımcılarla paylaşılmıştır.",
    },
    {
      baslik: "Yapay Zekâ Destekli Oyunlaştırılmış Eğitim Platformu",
      metin:
        "Parking Time platformu alanında 8 kişilik ekipler hâlinde öğrencilere, ders kazanımlarına ilişkin geri bildirim veren oyunlaştırılmış eğitim platformu deneyimi sağlanmıştır.",
    },
    {
      baslik: "Oyunun e Hâli",
      metin:
        "Öğrencilerin bilişim sektöründe ve gündelik hayatta ihtiyaç duyulan becerilerini geliştirirken öğrenme deneyimlerini dijital oyunlar ve espor ile keyifli, kalıcı ve ilgi çekici hâle getirmeyi hedefleyen Oyunun e Hâli alanında; Farmcraft, Phystal gibi oyunlarla beceri geliştiren uygulamaları deneyimleme fırsatı sunulmuştur.",
    },
    {
      baslik: "Drone Alanı",
      metin:
        "Drone alanında katılımcılara Drone Futbolu ve eğitim amaçlı dronelarla sürüş deneyimi sunulmuştur.",
    },
    {
      baslik: "Sergi Alanı",
      metin:
        "55 ilden öğrenciler stant alanında proje ve çalışmalarını sergilemiştir.",
    },
    {
      baslik: "G2S Sektör Öğrenci Buluşmaları Alanı",
      metin:
        "YEĞİTEK, Oyun Tasarımı, Siber Güvenlik, Havacılık Sistemleri, TÜBİTAK, Robotik, Eğitim Teknolojileri, Yapay Zekâ ve Yazılım Geliştirme (Web/Mobil) başlıklarında 4 oturumda 32 sektör uzmanı ile öğrenciler B2B görüşme fırsatı bulmuştur.",
    },
    {
      baslik: "Siber Güvenlik Alanı",
      metin:
        "Siber Güvenlik Kümelenmesi uzmanları tarafından koordine edilen Siber Güvenlik alanında Zirve özelinde Bayrağı Yakala (CTF) düzenlenmiş, Siber Güvenlik alanında çalışan öğrenciler uzmanlarla bir araya gelmiştir.",
    },
    {
      baslik: "Dijital Sanatlar ve İllüstrasyon Alanı",
      metin:
        "Farklı çizim tekniklerini, dijital araçları ve yazılımları deneyimleyip birbirlerinden ilham alma ve çalışmalarını paylaşma fırsatı bulan öğrencilerimiz; çizginin anlatım gücünü keşfetmiş, bir fikri görsele dönüştürme sürecini uygulamalı çalışmalarla deneyimlemiş ve kendi görsel hikâyelerini oluşturmuştur.",
    },
    {
      baslik: "Oyun Tasarımı / EğitiJAM Alanı",
      metin:
        "EğitiJAM finaline kalan 15 takım oyunlarını katılımcılarla paylaşmış ve EğitiJAM 2026 ödül töreni Zirve kapsamında gerçekleştirilmiştir. Ayrıca EğitiJAM alanında jüri ve mentörler tarafından oyun geliştiren öğrencilere geri bildirim alma fırsatı verilmiştir.",
    },
  ],
  gorseller: [
    { url: "/medya/genctek-zirvesi-2026-1.jpg", alt: "Zirvenin açılışında “Akran Öğrenme Modeli ve Genç Bilişim Ekosistemi – 2. GençTek Zirvesi” yazılı dev ekranın önünde kürsüden yapılan konuşma" },
    { url: "/medya/genctek-zirvesi-2026-2.jpg", alt: "Millî Eğitim Bakanı Yusuf Tekin'in zirve kürsüsünden basın mikrofonları önünde konuşması" },
    { url: "/medya/genctek-zirvesi-2026-3.jpg", alt: "Millî Eğitim Bakanı ve beraberindeki heyetin öğrencilerin proje standını ziyaret edip ürünleri incelemesi" },
    { url: "/medya/genctek-zirvesi-2026-4.jpg", alt: "Sahneden salona bakış: kürsüdeki konuşmayı dolu koltuklarda dinleyen yüzlerce öğrenci ve öğretmen" },
    { url: "/medya/genctek-zirvesi-2026-5.jpg", alt: "Fuaye alanında masalarda dizüstü bilgisayar ve tabletlerle çalışan öğrenciler ve arkadaki zirve panosu" },
    /* 1 Eylül 2026'da eklenen kare (istek: "mevcut görsellere ek"): asıl
       dosyalar 5-15 MB'lık fotoğraf makinesi çıktısıydı, web için 1600px
       genişliğinde webp'e indirildi. */
    { url: "/medya/genctek-zirvesi-2026-6.webp", alt: "GençTek tişörtlü öğrenci ekibinin, robotik çalışmalarını sergiledikleri stant masasının başında verdiği fotoğraf" },
    { url: "/medya/genctek-zirvesi-2026-7.webp", alt: "Aynı il ekibinin danışman öğretmeniyle birlikte proje standının önünde topluca poz vermesi" },
    { url: "/medya/genctek-zirvesi-2026-8.webp", alt: "Zirve oturumlarından biri: koltukları dolduran katılımcılar ve sahnedeki sunum ekranı" },
    { url: "/medya/genctek-zirvesi-2026-9.webp", alt: "Kürsüdeki konuşmacının arkasında zirvenin adını ve paydaş kurumların logolarını taşıyan dev ekran" },
    { url: "/medya/genctek-zirvesi-2026-10.webp", alt: "Sahnede belgelerini alan öğrenci takımının protokolle birlikte hatıra fotoğrafı" },
    { url: "/medya/genctek-zirvesi-2026-11.webp", alt: "Paydaş kurumların logolarının yer aldığı fotoğraf duvarının önünde öğrenciler, öğretmenler ve yöneticiler" },
    { url: "/medya/genctek-zirvesi-2026-12.webp", alt: "“Sahne Senin” bölümünde mikrofonla deneyimini anlatan öğrenci" },
    { url: "/medya/genctek-zirvesi-2026-13.webp", alt: "Sahnede “Kör tornavidayla dünya üçüncülüğü mümkün mü?” başlıklı sunumun yapılması" },
    { url: "/medya/genctek-zirvesi-2026-14.webp", alt: "Stantta dizüstü bilgisayarındaki projesini ziyaretçilere anlatan öğrenci" },
    { url: "/medya/genctek-zirvesi-2026-15.webp", alt: "Sergi alanında bir öğrencinin geliştirdiği uygulamayı dizüstü bilgisayar başında yöneticiye göstermesi" },
    { url: "/medya/genctek-zirvesi-2026-16.webp", alt: "Stant başında ziyaretçilere çalışmalarını anlatan GençTek öğrencileri" },
    { url: "/medya/genctek-zirvesi-2026-17.webp", alt: "Kürsüden birlikte sunum yapan iki öğrenci" },
    { url: "/medya/genctek-zirvesi-2026-18.webp", alt: "Drone alanında kullanılan, koruma kafesli iki drone futbolu topu" },
    { url: "/medya/genctek-zirvesi-2026-19.webp", alt: "Sergi ve stant alanının üstten görünümü: standlar arasında dolaşan kalabalık" },
    { url: "/medya/genctek-zirvesi-2026-20.webp", alt: "Zirvenin toplu hatıra fotoğrafı: sergi alanını dolduran yüzlerce katılımcının el sallaması" },
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
