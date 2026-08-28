import Link from "next/link";
import { MarkaSimgesi } from "./marka-simgesi";
import { TemaSecici } from "./TemaSecici";
import { genctekGirisAdresi } from "@/lib/genctek-baglanti";

/**
 * ÜST MENÜ (20 Ağustos 2026 · istek: "üst menü sırayla: hakkında, haberler,
 * etkinlikler, çalışma grupları, gençtek zirvesi olacak").
 *
 * Sıra istekte verildiği gibi: önce kurumu tanıtan (Hakkında), sonra akan
 * içerik (Haberler, Etkinlikler), sonra her yıl tekrarlanan programlar (Temel
 * GençTek etkinlikleri), en sonda yılın büyük buluşması (GençTek Zirvesi).
 *
 * ETKİNLİKLER kendi sayfasına gider (`/etkinlikler`): platformdaki bütün il
 * ve ulusal etkinlikler orada listeleniyor (istek: "etkinlik sayfasında
 * platformdaki tüm etkinlikler görülebilecekti"). Ana sayfadaki bölüm o
 * listenin ilk altısı; ikisi de aynı kaynaktan besleniyor.
 *
 * ÇALIŞMA GRUPLARI MENÜDEN KALKTI, TEMEL ETKİNLİKLER GELDİ (28 Ağustos 2026 ·
 * istekler: "üst menüden çalışma gruplarını kaldır", "temel gençtek
 * etkinlikleri ana menüye gelsin").
 *
 * İKİ ETKİNLİK BAŞLIĞI YAN YANA DURUYOR ve ayrımları şudur: "Etkinlikler"
 * platformda AÇILMIŞ, tarihi ve başvurusu olan tekil etkinliklerdir;
 * "Temel GençTek etkinlikleri" ise her yıl tekrarlanan PROGRAMLARIN kendisidir
 * (EğitiJAM, Master Tek, Oyunun e Hâli…). Biri takvim, diğeri çerçeve — bu
 * yüzden tek başlıkta birleştirilmedi.
 *
 * SAYFANIN ADRESİ DEĞİŞMEDİ (`/hakkinda/temel-etkinlikler`): sayfa Hakkında
 * altında duruyor ve oradaki kartlardan da açılıyor. Menüye çıkarken adresi
 * köke taşımak, paylaşılmış bağlantıları kırardı.
 *
 * ÇALIŞMA GRUPLARI (/temalar) SİLİNMEDİ: alt bilgideki "Temalar" ve Hakkında
 * ekranındaki kart oraya gitmeye devam ediyor — menüden kalkması, sayfanın
 * ulaşılmaz olması demek değil. İl koordinatörleri de aynı durumda.
 */
const baglantilar = [
  ["Hakkında", "/hakkinda"],
  ["Haberler", "/haberler"],
  ["Etkinlikler", "/etkinlikler"],
  ["Temel GençTek etkinlikleri", "/hakkinda/temel-etkinlikler"],
] as const;

/**
 * İKİ ZİRVE TEK BAŞLIK ALTINDA (20 Ağustos 2026 · istek: "zirveler birleşsin
 * aşağı doğru açılır menü olsun zirve 2025 zirve 2026 şeklinde").
 *
 * Yan yana duran iki zirve bağlantısı, her yeni zirvede menüyü bir kutu daha
 * uzatacaktı. Açılır menü JAVASCRIPT KULLANMAZ — `<details>` ile açılıyor,
 * tıpkı mobil menü gibi; betiğe bağlanan bir menü, betik yüklenene kadar
 * tıklanamaz olurdu.
 *
 * SIRA YENİDEN ESKİYE: menüyü açan kişi neredeyse her zaman güncel zirveyi
 * arıyor, o yüzden en üstte o duruyor. Yeni zirve eklenirken başa yazılmalı.
 */
const zirveler = [
  ["Zirve 2026", "/2-genctek-zirvesi-2026"],
  ["Zirve 2025", "/zirve"],
] as const;

export function Header() {
  /*
   * DÜĞMENİN ADI "GİRİŞ" VE HEDEFİ PLATFORM (20 Ağustos 2026 · istekler:
   * "portal olandaki katılım formu platforma gidecek (giriş) şeklinde, yani
   * portaldaki diğer platforma link gibi olacak" ve "sayfanın üstündeki
   * katılım formu da adı giriş olsun").
   *
   * Düğme portal içine değil BAŞKA BİR UYGULAMAYA gittiği için `<a>`;
   * `next/link` istemci tarafı gezinme için, dış adreste karşılığı yok.
   *
   * Katılım kimliği doğrulanmış bir işlem: kayıt da başvuru da GençTek
   * panelinde yürüyor. Portalda ikinci bir form doldurtmak, aynı bilgiyi iki
   * yerde toplayıp elle eşleştirmek demekti.
   */
  const katilimAdresi = genctekGirisAdresi();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="GençTek ana sayfa">
          <MarkaSimgesi /><span>GENÇ<span className="brand-accent">TEK</span></span>
        </Link>
        <nav className="main-nav" aria-label="Ana menü">
          {baglantilar.map(([etiket, adres]) => <Link href={adres} key={adres}>{etiket}</Link>)}
          <details className="nav-acilir">
            <summary>GençTek Zirvesi</summary>
            <div className="nav-acilir-govde">
              {zirveler.map(([etiket, adres]) => <Link href={adres} key={adres}>{etiket}</Link>)}
            </div>
          </details>
        </nav>
        <TemaSecici />
        <a className="button button-primary header-cta" href={katilimAdresi}>Giriş</a>
        <details className="mobile-menu">
          <summary aria-label="Menüyü aç">Menü</summary>
          <nav aria-label="Mobil menü">
            {baglantilar.map(([etiket, adres]) => <Link href={adres} key={adres}>{etiket}</Link>)}
            {/* Mobilde açılır menü İÇİNDE açılır menü olmaz: iki zirve doğrudan
                listeleniyor, başlıkları zaten hangi yıl olduğunu söylüyor. */}
            {zirveler.map(([etiket, adres]) => <Link href={adres} key={adres}>{etiket}</Link>)}
            <a href={katilimAdresi}>Giriş</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
