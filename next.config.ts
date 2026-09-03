import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, ""),
  /* ALT DİZİN KÖKÜ ARA KATMANA UĞRAMIYOR (3 Eylül 2026).
     Next, basePath'in çıplak hâlinde — "/genctekportal", sonda eğik çizgi yok —
     iç yolu BOŞ bırakıyor; ara katman günlüğüyle doğrulandı: alt sayfalarda
     pathname "/haberler" gelirken kök için proxy hiç çağrılmıyor. Hiçbir
     matcher boş yola uyamadığı için ("/", "/:path*" ve next.config başlıkları
     denendi, üçü de tutmadı) sitenin en çok görülen sayfası CSP, HSTS ve
     çerçeveleme koruması olmadan servis ediliyordu.

     Çözüm iki parçalı ve İKİSİ BİRLİKTE olmalı:
       1. Apache çıplak yolu eğik çizgili hâline 301 ile yönlendirir ve çıplak
          ProxyPass satırı kaldırılır (dururken adresi kapıyor).
       2. Burada skipTrailingSlashRedirect: yoksa Next "/genctekportal/" adresini
          308 ile geri atar ve Apache ile sonsuz döngü oluşur.
     Eğik çizgi eklenince iç yol "/" oluyor ve ara katman çalışıyor.

     SIRA: bu ayar CANLIYA ÖNCE gitmeli, Apache kuralı sonra. Tersi döngü demek.
     Apache tarafının ayrıntısı ve DirectAdmin yenileme adımı DAGITIM.md-de. */
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  compress: true,
  // Yerel Prisma Postgres aynı anda dokuzuncu bağlantıda yarı kilitleniyor.
  // Statik üretim işçilerini sınırlamak, build sırasında veritabanını çökertmez.
  experimental: { cpus: 1 },
  /*
   * İl koordinatörleri sayfası Hakkında'nın altına taşındı (20 Ağustos 2026).
   * Eski adres KALICI OLARAK yönlendiriliyor: sayfa dışarıda paylaşılmış ve
   * arama motorlarına kaydedilmiş olabilir, yönlendirme olmasaydı o bağlantılar
   * 404 verirdi.
   */
  async redirects() {
    return [
      {
        source: "/il-koordinatorleri",
        destination: "/hakkinda/il-koordinatorleri",
        permanent: true,
      },
      /*
       * Hakkında LİSTE sayfası kalktı (31 Ağustos 2026): altı kart artık ana
       * sayfada, haberlerin altında duruyor. Alt sayfalar (/hakkinda/amaclar,
       * /hakkinda/logolar …) yerinde; yönlendirilen yalnızca aradaki liste.
       */
      {
        source: "/hakkinda",
        destination: "/#hakkinda",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      ],
    }];
  },
};

export default nextConfig;
