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
 * kaldır").
 *
 * YALNIZCA LOGOLAR, LOGOLAR DA BAĞLANTI (1 Eylül 2026 · istek: "alttaki
 * footerda yazılar kalksın, resimlere link ver, kvkknın yanına mail adresini
 * koy"). Logoların altındaki kurum satırları ve ayrı iletişim satırı kalktı;
 * kurum adları logolarda zaten yazılı. E-posta en alta, KVKK bağlantısının
 * yanına taşındı — alt bilgide kalan tek iki bilgi bunlar.
 */
const KURUM_MARKALARI = [
  { ad: "MEB YEĞİTEK", logo: "/logo-yegitek.png", adres: "https://yegitek.meb.gov.tr" },
  { ad: "ETKİM", logo: "/logo-etkim.png", adres: "https://etkim.meb.gov.tr" },
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
          <a className="footer-brand-marka" href={yegitek.adres} target="_blank" rel="noreferrer">
            {logoVarMi(yegitek.logo)
              ? <img src={gorselYolu(yegitek.logo)} alt={`${yegitek.ad} logosu`} />
              : <span className="footer-brand-ad">{yegitek.ad}</span>}
          </a>
        </div>
        <div className="footer-brand">
          <Link className="footer-brand-marka" href="/">
            <span className="brand brand-inverse"><MarkaSimgesi /><span>GENÇ<span className="brand-accent">TEK</span></span></span>
          </Link>
        </div>
        <div className="footer-brand">
          <a className="footer-brand-marka" href={etkim.adres} target="_blank" rel="noreferrer">
            {logoVarMi(etkim.logo)
              ? <img src={gorselYolu(etkim.logo)} alt={`${etkim.ad} logosu`} />
              : <span className="footer-brand-ad">{etkim.ad}</span>}
          </a>
        </div>
      </div>
      <div className="container footer-bottom"><Link href="/kvkk">KVKK ve Gizlilik</Link><a href={`mailto:${ayarlar["iletisim.eposta"]}`}>{ayarlar["iletisim.eposta"]}</a></div>
    </footer>
  );
}
