export type PublishStatus = "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
  category: "Etkinlik" | "Duyuru";
  publishedAt: string;
  location: string;
  status: PublishStatus;
  featured?: boolean;
};

const ekEtkinlikler = [
  ["bursa-yegitek-calistayi", "Bursa YEĞİTEK Çalıştayı", "Bursa’daki ekipler teknoloji eğitimi ve akran öğrenmesi için ortak çalışma planı oluşturdu.", "4 Haziran 2026", "Bursa"],
  ["bilecik-sahne-senin", "GençTek Bilecik Sahne Senin", "Gençler projelerini, üretim yolculuklarını ve sahne deneyimlerini katılımcılarla paylaştı.", "12 Mayıs 2026", "Bilecik"],
  ["karaman-dijital-yuruyus-stem", "Karaman Sahne Senin: Dijital Yürüyüş STEM", "Tarihî mekânlarla teknoloji üretimini buluşturan saha programı tamamlandı.", "21 Mayıs 2026", "Karaman"],
  ["yozgat-tek-maraton", "Yozgat Tek Maraton: Eğitim Teknolojileri Fikir Maratonu", "Öğrenci ekipleri eğitim sorunlarına yönelik teknoloji fikirlerini prototiplere dönüştürdü.", "8 Nisan 2026", "Yozgat"],
  ["tekirdag-sahne-senin", "GençTek Tekirdağ Sahne Senin", "Öğrenciler teknolojiyle ürettikleri çalışmaları ve öğrenme deneyimlerini sahneye taşıdı.", "14 Mayıs 2026", "Tekirdağ"],
  ["amasya-sehzadelerin-izinde", "Şehzadelerin İzinde Amasya", "Amasya’nın kültürel mirası dijital üretim ve STEM etkinlikleriyle yeniden keşfedildi.", "14 Mayıs 2026", "Amasya"],
  ["egitijam-2026-finalistleri", "EğitiJAM 2026 K12 Finalistleri", "Oyun geliştirme maratonunda finale kalan öğrenci ekipleri ve projeleri açıklandı.", "27 Şubat 2026", "Türkiye"],
  ["mersin-sahne-senin", "GençTek Mersin Sahne Senin", "Mersinli gençler projelerini sergiledi ve akranlarıyla üretim deneyimlerini paylaştı.", "26 Mart 2026", "Mersin"],
  ["tubitak-bilgem-teknoloji-haftasi", "TÜBİTAK BİLGEM Bilim ve Teknoloji Haftası", "GençTek öğrencileri araştırma merkezleri ve teknoloji uzmanlarıyla bir araya geldi.", "12 Mart 2026", "Kocaeli"],
  ["oyunun-e-hali-ankara", "Oyunun e Hâli Ankara Programı", "Oyun geliştirme, tasarım ve sektör buluşmalarını içeren program Ankara’da gerçekleştirildi.", "19 Aralık 2025", "Ankara"],
  ["siber-guvenlik-yarismasi", "Liseler Arası Siber Güvenlik Yarışması", "Öğrenci takımları çevrim içi görevlerde güvenli sistem kurma ve problem çözme becerilerini sınadı.", "9 Aralık 2025", "Çevrim içi"],
  ["universite-hello-world", "GençTek Üniversite Hello World Buluşması", "Üniversite öğrencileri GençTek ekosistemi ve yeni dönem çalışma alanları için tanıştı.", "1 Aralık 2025", "Çevrim içi"],
  ["izmir-danisman-ogretmen", "İzmir Danışman Öğretmen Toplantısı", "Danışman öğretmenler il programları, ekip çalışması ve akran öğrenmesi gündemiyle buluştu.", "6 Kasım 2025", "İzmir"],
  ["genc-golge-odtu-atom", "Genç Gölge Programı ODTÜ ATOM ile Başladı", "Öğrenciler oyun ve animasyon sektöründeki üretim süreçlerini uzmanlardan gözlemledi.", "17 Ekim 2025", "Ankara"],
  ["g2s-espor", "G2S Genç Sektör Buluşmaları: Espor", "Espor profesyonelleri kariyer yollarını ve sektör deneyimlerini gençlerle paylaştı.", "16 Eylül 2025", "Çevrim içi"],
] as const;

export const articles: Article[] = [
  {
    slug: "ankara-duzce-g2s-teknik-gezi",
    title: "GençTek Ankara–Düzce G2S ve Teknik Gezi Programı",
    summary: "Öğrenciler sektör temsilcileriyle buluştu, siber güvenlik ekosistemini yerinde inceledi.",
    body: [
      "GençTek Ankara ve GençTek Düzce ekipleri, G2S Genç Sektör Buluşmaları kapsamında teknoloji profesyonelleriyle bir araya geldi.",
      "Program; öğrencilerin kariyer seçeneklerini tanımasını, güncel teknoloji çalışmalarını yerinde görmesini ve uzmanlarla doğrudan iletişim kurmasını sağladı.",
    ],
    category: "Etkinlik",
    publishedAt: "19 Haziran 2026",
    location: "Ankara",
    status: "PUBLISHED",
    featured: true,
  },
  {
    slug: "manisa-genclik-bulusmasi",
    title: "GençTek Manisa Gençlik Buluşması",
    summary: "Öğrenciler dijital üretim, akran öğrenmesi ve sosyal etki odağında buluştu.",
    body: ["Manisa Gençlik Buluşması, öğrenci ve danışman öğretmenlerin katılımıyla Salihli’de gerçekleştirildi."],
    category: "Etkinlik",
    publishedAt: "18 Haziran 2026",
    location: "Manisa",
    status: "PUBLISHED",
  },
  {
    slug: "eskisehir-akran-bulusmasi",
    title: "2 Gün, 21 Okul: Eskişehir Akran Buluşması",
    summary: "130 öğrenci ve 20 öğretmen iki günlük üretim programında deneyimlerini paylaştı.",
    body: ["Eskişehir’de düzenlenen program farklı okul türlerinden ekipleri ortak üretim ortamında bir araya getirdi."],
    category: "Duyuru",
    publishedAt: "16 Haziran 2026",
    location: "Eskişehir",
    status: "PUBLISHED",
  },
  ...ekEtkinlikler.map(([slug, title, summary, publishedAt, location]): Article => ({
    slug,
    title,
    summary,
    body: [summary],
    category: "Etkinlik",
    publishedAt,
    location,
    status: "PUBLISHED",
  })),
];

// Tema tipi ve verisi lib/tema.ts + data/temalar.json içine taşındı; panelden
// düzenlenebilmesi için kodda sabit dizi olarak tutulmuyor.


export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
