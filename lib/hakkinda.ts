/**
 * HAKKINDA SAYFASININ KARTLARI (20 Ağustos 2026 · istek: "hakkında sayfası
 * içinde, temel gençtek etkinlikleri, çalışma grupları, il koordinatörleri,
 * gençtek nedir, amaçlar, logoları rollupları şeklinde her biri kart sayfası
 * olacak, karta tıklayınca kendi sayfasına gidecek").
 *
 * Liste TEK YERDE duruyor çünkü iki yerde basılıyor: Hakkında ekranındaki kart
 * ızgarası ve alt sayfaların altındaki "diğer başlıklar" şeridi. İkisi ayrı
 * yazılsaydı, yeni bir başlık eklendiğinde biri geride kalırdı.
 *
 * "ÇALIŞMA GRUPLARI" MEVCUT TEMALAR EKRANINA gidiyor: o listeyi Hakkında
 * altına kopyalamak, aynı içeriği iki adreste yaşatmak olurdu — biri
 * güncellenir, öbürü eskir.
 *
 * "İL KOORDİNATÖRLERİ" ise 20 Ağustos 2026'da Hakkında'nın ALTINA TAŞINDI
 * (istek: "koordinatör sayfasını da hakkındanın içine al"). Eski `/il-
 * koordinatorleri` adresi kalıcı yönlendirmeyle yaşıyor (bkz. next.config.ts) —
 * paylaşılmış bağlantılar ve arama motoru kayıtları kırılmasın.
 */
export type HakkindaKarti = {
  slug: string;
  baslik: string;
  ozet: string;
  adres: string;
  /*
   * Kartın simgesi. Ad, components/icons.tsx'teki takımdan seçilir; bileşenin
   * tip birliğini buraya import etmek yerine karşılığı yazıldı — lib katmanı
   * bileşenlere bağlanmasın diye.
   */
  ikon: "badge" | "gauge" | "calendar" | "tag" | "users" | "image";
};

export const HAKKINDA_KARTLARI: HakkindaKarti[] = [
  {
    slug: "genctek-nedir",
    ikon: "badge",
    baslik: "GençTek nedir?",
    ozet: "Ekosistemin ne olduğu, kimleri kapsadığı ve nasıl işlediği.",
    adres: "/hakkinda/genctek-nedir",
  },
  {
    slug: "amaclar",
    ikon: "gauge",
    baslik: "Hedefler",
    ozet: "GençTek'in kendine koyduğu hedefler.",
    adres: "/hakkinda/amaclar",
  },
  {
    slug: "temel-etkinlikler",
    ikon: "calendar",
    baslik: "Temel GençTek etkinlikleri",
    ozet: "Her yıl tekrarlanan program ailesi ve çalışma grubu etkinlikleri.",
    adres: "/hakkinda/temel-etkinlikler",
  },
  {
    slug: "calisma-gruplari",
    ikon: "tag",
    baslik: "Çalışma grupları",
    ozet: "Öğrencilerin ilgi alanına göre buluştuğu teknoloji başlıkları.",
    adres: "/temalar",
  },
  {
    slug: "il-koordinatorleri",
    ikon: "users",
    baslik: "İl koordinatörleri",
    ozet: "81 ildeki koordinatörler ve iletişim bilgileri.",
    adres: "/hakkinda/il-koordinatorleri",
  },
  {
    slug: "logolar",
    ikon: "image",
    baslik: "Logolar ve roll-up'lar",
    ozet: "Marka öğeleri, kullanım kuralları ve indirilebilir dosyalar.",
    adres: "/hakkinda/logolar",
  },
];
