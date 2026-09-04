import type { Metadata } from "next";
import { cookies } from "next/headers";
import { TemaSaglayici } from "@/components/tema-baglami";
import { TEMA_CEREZI, temaCoz } from "@/lib/tema-tercihi";
import { siteAdresi } from "@/lib/ortam";
import { ayarlariOkuSessiz } from "@/lib/yonetim/ayar";
import { Archivo, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// latin-ext, Türkçe ş/ğ/İ/ı/ç/ö/ü için zorunlu; eksikse tarayıcı kelime ortasında yedek fonta düşer.
const display = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display-face",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-body-face",
  display: "swap",
});

/**
 * METADATA ARTIK AYARLARDAN ÜRETİLİYOR (20 Ağustos 2026 · istek: "ayarlar
 * sayfasını yapmamışsın").
 *
 * Önce burada sabitti; yönetim panelindeki ayar formu doluydu ama Kaydet
 * hiçbir şeyi değiştirmiyordu. Şimdi başlık ve açıklama `GlobalSetting`
 * tablosundan geliyor (bkz. lib/yonetim/ayar.ts) ve panelden değiştirilebiliyor.
 *
 * Sabit kalan tek şey `metadataBase`: yayın adresi bir içerik ayarı değil,
 * dağıtım kararıdır — panelden değiştirilebilseydi yanlış bir değer bütün
 * paylaşım bağlantılarını kırardı.
 *
 * VERİTABANI KAPALIYKEN sayfa başlıksız kalmaz: `ayarlariOkuSessiz`
 * varsayılanlara düşer.
 */
export async function generateMetadata(): Promise<Metadata> {
  const ayarlar = await ayarlariOkuSessiz();
  const baslik = ayarlar["site.baslik"];
  return {
    title: { default: `${baslik} | Sektörün Yeni Liderleri`, template: `%s | ${baslik}` },
    description: ayarlar["site.aciklama"],
    metadataBase: new URL(siteAdresi()),
  };
}

/**
 * TEMA ÇEREZDEN OKUNUYOR (4 Eylül 2026).
 *
 * Önceden burada satır içi bir `<script>` vardı: tercih `localStorage`da
 * olduğu için sunucu göremiyor, betik React'ten önce çalışıp `data-theme`i
 * yazıyordu. React 19 bu etiket için "Encountered a script tag while rendering
 * React component" uyarısı veriyordu; `next/script` + `beforeInteractive` ise
 * betiği Next'in kuyruğuna (`__next_s`) alıyor ve tema ancak hydration'dan
 * sonra uygulanıyor — kırmızı temayı seçen kullanıcı her açılışta bir an beyaz
 * ekran görürdü (üretim çıktısında da ölçüldü).
 *
 * Tercih çereze taşınınca üçü birden çözüldü: betik gerekmiyor, sunucu doğru
 * temayı basıyor, düğme de ilk hâliyle doğru yazıyla çıkıyor
 * (bkz. components/tema-baglami.tsx).
 *
 * ÇEREZ OKUMAK SAYFALARI DİNAMİKLEŞTİRİR: portalın kamu sayfaları zaten
 * force-dynamic; geriye kalan birkaç kimlik ekranı da istek anında üretilse
 * maliyeti yok (bkz. portal yük profili · ~0,75 istek/sn).
 */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tema = temaCoz((await cookies()).get(TEMA_CEREZI)?.value);

  return (
    <html
      lang="tr"
      className={`${display.variable} ${body.variable}`}
      data-theme={tema === "kirmizi" ? "kirmizi" : undefined}
    >
      <body>
        <TemaSaglayici baslangic={tema}>{children}</TemaSaglayici>
      </body>
    </html>
  );
}
