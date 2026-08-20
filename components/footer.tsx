import Link from "next/link";
import { MarkaSimgesi } from "./marka-simgesi";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-inverse"><MarkaSimgesi /><span>GENÇ<span className="brand-accent">TEK</span></span></div>
          <p>Genç Bilişim Ekosistemi ve Akran Öğrenme Modeli.</p>
        </div>
        <div><h2>Keşfet</h2><Link href="/zirve">1. GençTek Zirvesi 2025</Link><Link href="/2-genctek-zirvesi-2026">2. GençTek Zirvesi 2026</Link><Link href="/temalar">Temalar</Link><Link href="/haberler">Haberler</Link><Link href="/hakkinda">Hakkında</Link></div>
        <div><h2>Katılım</h2><Link href="/katilim">Başvuru Formu</Link><Link href="/hakkinda/il-koordinatorleri">İl Koordinatörleri</Link></div>
        <div><h2>İletişim</h2><a href="mailto:genctek@eba.gov.tr">genctek@eba.gov.tr</a><span>Millî Eğitim Bakanlığı</span></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 GençTek</span><Link href="/kvkk">KVKK ve Gizlilik</Link></div>
    </footer>
  );
}
