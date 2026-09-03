import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, ""),
  trailingSlash: true,
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
