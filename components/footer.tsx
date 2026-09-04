import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { MarkaSimgesi } from "./marka-simgesi";
import { gorselYolu } from "@/lib/ortam";
import { ayarlariOkuSessiz } from "@/lib/yonetim/ayar";
import { altbilgiyiOku, type AltbilgiMarkasi } from "@/lib/altbilgi";

/**
 * Alt bilgi.
 *
 * "KEŞFET" VE "KATILIM" SÜTUNLARI KALKTI (31 Ağustos 2026 · istek: "en alttan
 * bunlar kalksın"). Bağlantıların hepsi üst menüde zaten duruyor; alt bilgi
 * artık kimin olduğunu ve nasıl ulaşılacağını söylüyor, menüyü tekrar etmiyor.
 *
 * ÜÇ KURUM YAN YANA, EN ÜST SATIRDA (31 Ağustos 2026 · istek: "alt footer
 * olmamış, GENÇTEK bloğu gibi yan yana 3 tane olacak logolu — 1. yeğitek
 * 2. gençtek 3. etkim").
 *
 * TELİF SATIRI KALKTI (31 Ağustos 2026 · istek: "© 2026 GençTek bunları
 * kaldır").
 *
 * YALNIZCA LOGOLAR, LOGOLAR DA BAĞLANTI (1 Eylül 2026 · istek: "alttaki
 * footerda yazılar kalksın, resimlere link ver, kvkknın yanına mail adresini
 * koy"). Logoların altındaki kurum satırları ve ayrı iletişim satırı kalktı;
 * kurum adları logolarda zaten yazılı.
 *
 * İÇERİK ARTIK PANELDEN (4 Eylül 2026 · istek: "footer için de ayar yap"):
 * markalar ve alt satır bağlantıları kodda sabit bir diziydi, "Page" tablosuna
 * taşındı (bkz. lib/altbilgi.ts). Sıralama da panelden değişiyor — GençTek'in
 * ortada olması bir tasarım kararı, kodun dayattığı bir kural değil.
 *
 * LOGO DOSYASI YOKSA AD YAZILIR: dosyanın varlığı sunucuda kontrol ediliyor,
 * eksik bir dosya kırık görsel değil düz yazı olarak görünsün diye. Panelden
 * yanlış bir yol yazıldığında alt bilgi her sayfada kırık kalırdı.
 *
 * ÜÇ SÜTUN HİZALI (31 Ağustos 2026 · istek: "yazılar ve resimler hizalı değil
 * aynı sırada değil gibi"). Her sütunda logo/marka ayrı bir kutuda
 * (.footer-brand-marka) duruyor: kutu sabit yükseklikte olduğu için logolar
 * aynı çizgide oturuyor.
 */

function logoVarMi(dosya: string) {
  // Yalnızca site içi yollar dosya sisteminde aranıyor; dış adresli bir logo
  // (başka kurumun sunucusu) doğrudan basılır.
  if (!dosya.startsWith("/")) return true;
  return existsSync(path.join(process.cwd(), "public", dosya));
}

function MarkaIcerigi({ marka }: { marka: AltbilgiMarkasi }) {
  if (marka.tur === "genctek") {
    return (
      <span className="brand brand-inverse">
        <MarkaSimgesi /><span>GENÇ<span className="brand-accent">TEK</span></span>
      </span>
    );
  }
  return marka.logo && logoVarMi(marka.logo)
    ? <img src={gorselYolu(marka.logo)} alt={`${marka.ad} logosu`} />
    : <span className="footer-brand-ad">{marka.ad}</span>;
}

export async function Footer() {
  // İletişim bilgisi Genel ayarlardan (GlobalSetting), markalar ve bağlantılar
  // Alt bilgi ekranından geliyor; ikisi de veritabanı kapalıyken varsayılana
  // düşer, alt bilgi boş kalmaz.
  const ayarlar = await ayarlariOkuSessiz();
  const altbilgi = await altbilgiyiOku();
  const eposta = ayarlar["iletisim.eposta"];

  return (
    <footer className="site-footer">
      <div className="container footer-brands">
        {altbilgi.markalar.map((marka, sira) => (
          <div className="footer-brand" key={`${marka.tur}-${marka.ad}-${sira}`}>
            {/* Site içi hedefler next/link ile (istemci tarafı gezinme), dış
                kurum adresleri düz <a> ile ve yeni sekmede. */}
            {marka.adres.startsWith("/") ? (
              <Link className="footer-brand-marka" href={marka.adres}>
                <MarkaIcerigi marka={marka} />
              </Link>
            ) : marka.adres ? (
              <a className="footer-brand-marka" href={marka.adres} target="_blank" rel="noreferrer">
                <MarkaIcerigi marka={marka} />
              </a>
            ) : (
              <span className="footer-brand-marka"><MarkaIcerigi marka={marka} /></span>
            )}
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        {altbilgi.baglantilar.map((baglanti) =>
          baglanti.adres.startsWith("/")
            ? <Link href={baglanti.adres} key={baglanti.adres}>{baglanti.etiket}</Link>
            : <a href={baglanti.adres} key={baglanti.adres} target="_blank" rel="noreferrer">{baglanti.etiket}</a>,
        )}
        {eposta ? <a href={`mailto:${eposta}`}>{eposta}</a> : null}
      </div>
    </footer>
  );
}
