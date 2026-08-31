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
 */
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
      <div className="container footer-bottom"><span>© 2026 GençTek</span><Link href="/kvkk">KVKK ve Gizlilik</Link></div>
    </footer>
  );
}
