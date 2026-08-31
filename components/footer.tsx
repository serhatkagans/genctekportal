import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { MarkaSimgesi } from "./marka-simgesi";
import { ayarlariOkuSessiz } from "@/lib/yonetim/ayar";

/**
 * Alt bilgi.
 *
 * "KEŞFET" VE "KATILIM" SÜTUNLARI KALKTI (31 Ağustos 2026 · istek: "en alttan
 * bunlar kalksın"). Bağlantıların hepsi üst menüde zaten duruyor; alt bilgi
 * artık kimin olduğunu ve nasıl ulaşılacağını söylüyor, menüyü tekrar etmiyor.
 * Kurum satırının altına YEĞİTEK eklendi — GençTek'i yürüten genel müdürlük.
 *
 * EN ALTTA ÜÇ KURUM ŞERİDİ (31 Ağustos 2026 · istek: "soluna meb yeğitek ve
 * logosu, 2. GençTek, 3. en sağa ETKİM ve logosu"). Logo dosyaları henüz
 * yüklenmediyse şerit yalnızca adları gösterir; kırık görsel çıkmasın diye
 * dosyanın varlığı sunucuda kontrol ediliyor.
 */
const KURUM_MARKALARI = [
  { ad: "MEB YEĞİTEK", logo: "/logo-yegitek.png" },
  { ad: "GençTek", logo: "/logo-genctek.png" },
  { ad: "ETKİM", logo: "/logo-etkim.png" },
];

function logoVarMi(dosya: string) {
  return existsSync(path.join(process.cwd(), "public", dosya));
}
export async function Footer() {
  // İletişim bilgisi yönetim panelinden düzenleniyor (Genel ayarlar);
  // veritabanı kapalıyken varsayılana düşer, alt bilgi boş kalmaz.
  const ayarlar = await ayarlariOkuSessiz();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-inverse"><MarkaSimgesi /><span>GENÇ<span className="brand-accent">TEK</span></span></div>
          <p>Genç Bilişim Ekosistemi ve Akran Öğrenme Modeli.</p>
        </div>
        <div><h2>İletişim</h2><a href={`mailto:${ayarlar["iletisim.eposta"]}`}>{ayarlar["iletisim.eposta"]}</a><span>{ayarlar["iletisim.kurum"]}</span><span>Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü (YEĞİTEK)</span></div>
      </div>
      <div className="container footer-marks">
        {KURUM_MARKALARI.map((marka) => (
          <div className="footer-mark" key={marka.ad}>
            {logoVarMi(marka.logo) && <img src={marka.logo} alt={`${marka.ad} logosu`} />}
            <span>{marka.ad}</span>
          </div>
        ))}
      </div>
      <div className="container footer-bottom"><span>© 2026 GençTek</span><Link href="/kvkk">KVKK ve Gizlilik</Link></div>
    </footer>
  );
}
