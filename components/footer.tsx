import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { MarkaSimgesi } from "./marka-simgesi";
import { gorselYolu } from "@/lib/ortam";
import { ayarlariOkuSessiz } from "@/lib/yonetim/ayar";

/**
 * Alt bilgi.
 *
 * "KEŞFET" VE "KATILIM" SÜTUNLARI KALKTI (31 Ağustos 2026 · istek: "en alttan
 * bunlar kalksın"). Bağlantıların hepsi üst menüde zaten duruyor; alt bilgi
 * artık kimin olduğunu ve nasıl ulaşılacağını söylüyor, menüyü tekrar etmiyor.
 *
 * ÜÇ KURUM YAN YANA, EN ÜST SATIRDA (31 Ağustos 2026 · istek: "alt footer
 * olmamış, GENÇTEK bloğu gibi yan yana 3 tane olacak logolu — 1. yeğitek
 * 2. gençtek 3. etkim"). Önce yalnızca adlardan oluşan ayrı bir şerit vardı;
 * o kalktı, kurumlar artık GençTek bloğunun yanında ve logolarıyla duruyor.
 * Logolar beyaz, alt bilginin zemini koyu.
 *
 * LOGO DOSYASI YOKSA AD YAZILIR: dosyanın varlığı sunucuda kontrol ediliyor,
 * eksik bir dosya kırık görsel değil düz yazı olarak görünsün diye.
 *
 * ÜÇ SÜTUN HİZALI (31 Ağustos 2026 · istek: "yazılar ve resimler hizalı değil
 * aynı sırada değil gibi"). Her sütunda logo/marka ayrı bir kutuda
 * (.footer-brand-marka) duruyor: kutu sabit yükseklikte olduğu için üç logo
 * aynı çizgide oturuyor ve altlarındaki kurum satırları da aynı hizada
 * başlıyor.
 *
 * TELİF SATIRI KALKTI (31 Ağustos 2026 · istek: "© 2026 GençTek bunları
 * kaldır"). En alttaki tek bağlantı KVKK ve Gizlilik — o yüzden satır sağa
 * yaslanıyor.
 */
const KURUM_MARKALARI = [
  { ad: "MEB YEĞİTEK", logo: "/logo-yegitek.png" },
  { ad: "ETKİM", logo: "/logo-etkim.png" },
];

function logoVarMi(dosya: string) {
  return existsSync(path.join(process.cwd(), "public", dosya));
}

export async function Footer() {
  // İletişim bilgisi yönetim panelinden düzenleniyor (Genel ayarlar);
  // veritabanı kapalıyken varsayılana düşer, alt bilgi boş kalmaz.
  const ayarlar = await ayarlariOkuSessiz();
  const [yegitek, etkim] = KURUM_MARKALARI;

  return (
    <footer className="site-footer">
      <div className="container footer-brands">
        <div className="footer-brand">
          <div className="footer-brand-marka">
            {logoVarMi(yegitek.logo)
              ? <img src={gorselYolu(yegitek.logo)} alt={`${yegitek.ad} logosu`} />
              : <span className="footer-brand-ad">{yegitek.ad}</span>}
          </div>
          {/* Kurum satırları logoların hemen altında (31 Ağustos 2026 ·
              istekler: "bu yazı yeğitek görselinin altına gelecek",
              "etkim görselinin altında da bu yazı gelsin"). YEĞİTEK satırı
              iletişim bölümünden buraya taşındı, iki yerde durmasın diye. */}
          <p>{ayarlar["iletisim.kurum"]}<br />Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü (YEĞİTEK)</p>
        </div>
        <div className="footer-brand">
          <div className="footer-brand-marka">
            <div className="brand brand-inverse"><MarkaSimgesi /><span>GENÇ<span className="brand-accent">TEK</span></span></div>
          </div>
          <p>Genç Bilişim Ekosistemi ve Akran Öğrenme Modeli.</p>
          {/* İletişim GençTek sütununun altında ve tek satır (31 Ağustos 2026 ·
              istekler: "bunu da gençtekin altına koyalım", "mail adresini
              iletişimin yanına koy iletişim: şeklinde"). En altta yalnızca
              KVKK bağlantısı kalıyor. */}
          <p className="footer-iletisim"><span>İletişim:</span> <a href={`mailto:${ayarlar["iletisim.eposta"]}`}>{ayarlar["iletisim.eposta"]}</a></p>
        </div>
        <div className="footer-brand">
          <div className="footer-brand-marka">
            {logoVarMi(etkim.logo)
              ? <img src={gorselYolu(etkim.logo)} alt={`${etkim.ad} logosu`} />
              : <span className="footer-brand-ad">{etkim.ad}</span>}
          </div>
          <p>Eğitim Teknolojileri Kuluçka ve İnovasyon Merkezi (ETKİM)</p>
        </div>
      </div>
      <div className="container footer-bottom"><Link href="/kvkk">KVKK ve Gizlilik</Link></div>
    </footer>
  );
}
