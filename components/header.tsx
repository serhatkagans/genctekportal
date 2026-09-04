import Link from "next/link";
import { HakkindaBaglantisi } from "./hakkinda-baglantisi";
import { MarkaSimgesi } from "./marka-simgesi";
import { MenuKapatici } from "./menu-kapatici";
import { TemaSecici } from "./TemaSecici";
import { genctekGirisAdresi } from "@/lib/genctek-baglanti";
import { hakkindaKartlariniOku } from "@/lib/hakkinda";
import { zirveleriOku } from "@/lib/zirve";
import { menuyuOku, type MenuOgesi } from "@/lib/menu";
import { uygulamaYolu } from "@/lib/ortam";

/**
 * ÜST MENÜ (20 Ağustos 2026 · istek: "üst menü sırayla: hakkında, haberler,
 * etkinlikler, çalışma grupları, gençtek zirvesi olacak").
 *
 * Sıra istekte verildiği gibi: önce kurumu tanıtan (Hakkında), sonra akan
 * içerik (Haberler, Etkinlikler), en sonda yılın büyük buluşması (GençTek
 * Zirvesi).
 *
 * ETKİNLİKLER kendi sayfasına gider (`/etkinlikler`): platformdaki bütün il
 * ve ulusal etkinlikler orada listeleniyor (istek: "etkinlik sayfasında
 * platformdaki tüm etkinlikler görülebilecekti"). Ana sayfadaki bölüm o
 * listenin ilk altısı; ikisi de aynı kaynaktan besleniyor.
 *
 * ÇALIŞMA GRUPLARI VE TEMEL ETKİNLİKLER MENÜDE DEĞİL (28 ve 31 Ağustos 2026 ·
 * istekler: "üst menüden çalışma gruplarını kaldır", "menüden bunu kaldır ama
 * sayfası dursun Temel GençTek etkinlikleri").
 *
 * İKİSİ DE SİLİNMEDİ: `/hakkinda/temel-etkinlikler` ve `/temalar` yerinde
 * duruyor; Hakkında açılır menüsündeki ve ana sayfadaki kartlar oraya gitmeye
 * devam ediyor. Menüden kalkmak, sayfanın ulaşılmaz olması demek değil —
 * paylaşılmış bağlantılar da çalışmayı sürdürüyor.
 */
/*
 * BAŞLIKLAR ARTIK KODDA DEĞİL (4 Eylül 2026): "Haberler" ve "Etkinlikler"
 * burada elle yazılı bir diziydi; sıra ve adlarla birlikte panele taşındı
 * (Yönetim → Üst menü). Yukarıdaki gerekçeler geçerliliğini koruyor, yalnızca
 * listenin durduğu yer değişti.
 */

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
 * arıyor, o yüzden en üstte o duruyor. Sıra "Page" tablosundaki `order`
 * sütununda ve panelden ok tuşlarıyla değişiyor — 4 Eylül 2026'da zirveler de
 * veritabanına taşındı, menüde elle yazılı liste kalmadı.
 *
 * ETİKET "Zirve <yıl>": menüde tam ad ("2. GençTek Zirvesi") kutuyu gereksiz
 * genişletiyordu, yıl tek başına ayırt etmeye yetiyor.
 */

/*
 * HAKKINDA AÇILIR MENÜSÜ (31 Ağustos 2026 · istek: "bu kartlar hakkımda
 * menüsünün altına açılır olacak").
 *
 * Başlıklar ve adresler lib/hakkinda.ts'ten geliyor — kart listesiyle menü tek
 * kaynaktan besleniyor, yeni bir başlık eklendiğinde ikisi birden büyüsün diye.
 *
 * HEDEF KARTIN KENDİ SAYFASI (31 Ağustos 2026 · istek: "menüde tıklayınca
 * ilgili kartın sayfasına gitsin, ana sayfadaki kartlara değil"). Önce ana
 * sayfadaki çapaya gidiliyordu; menüden gelen kişi aradığı başlığı zaten
 * seçmişken bir de kart bölümünde ikinci kez tıklamak zorunda kalıyordu.
 * "Çalışma Grupları" portal içinde /temalar'a düşer — adres kart listesinde
 * yazılı olduğu için burada ayrıca bilinmesi gerekmiyor.
 */
/*
 * Menü başlığının kendisi hâlâ ANA SAYFADAKİ kart bölümüne iniyor: altı
 * başlığı bir arada görmek isteyen oraya gidiyor.
 *
 * Çapa next/link ile değil, `HakkindaBaglantisi` ile veriliyor (31 Ağustos ve
 * 1 Eylül 2026 · istekler: "menüdeki hakkında menüsüne tıklayınca aşağı
 * kaymıyor", "anasayfada Hakkımdaya basınca aşağı hakkımda kartlarına
 * gitsin"). Önce istemci tarafı gezinme, sonra düz <a> denendi; ikisi de
 * <summary>'nin açılıp kapanmasıyla çakışıyordu. Bileşen bölüm sayfadaysa
 * kaydırmayı kendisi yapıyor, değilse bağlantı olağan şekilde çalışıyor.
 * Adresin başına uygulama eki geliyor: portal bir alt dizinde de yayınlanıyor.
 */
const anaSayfaCapasi = (cengel: string) => `${uygulamaYolu("/")}#${cengel}`;

export async function Header() {
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

  /* İKİ LİSTE DE VERİTABANINDAN (4 Eylül 2026): bileşen bu yüzden async oldu.
     Menü her sayfada basıldığı için iki sorgu da her istekte çalışıyor —
     ikisi de indeksli tek satırlık SELECT. Bağlantı düşerse okuma son sağlam
     anlık görüntüye düşüyor, menü boş kalmıyor (bkz. lib/hakkinda.ts ve
     lib/zirve.ts'teki yedek notu). */
  const hakkindaBaglantilari = (await hakkindaKartlariniOku()).map(
    (kart) => [kart.baslik, kart.adres] as const,
  );
  const zirveler = (await zirveleriOku()).map(
    (zirve) => [`Zirve ${zirve.yil}`, zirve.yol] as const,
  );
  /* Başlıkların kendisi de panelden (4 Eylül 2026 · istek: "menülerin de ismi
     değişebilir olabilir mi"): sıra, ad, düz bağlantıların adresi ve giriş
     düğmesinin yazısı "Page" tablosunda. Kayıt yoksa bugünkü menü varsayılan
     olarak basılıyor (bkz. lib/menu.ts). */
  const menu = await menuyuOku();

  /*
   * Açılır listelerin içeriği türüne göre seçiliyor: menüde "Hakkında" öğesi
   * varsa altında Hakkında sayfaları, "GençTek Zirvesi" varsa zirve kayıtları
   * listeleniyor. Panelden yazılan yalnızca başlığın kendisi.
   */
  const altListe = (tur: MenuOgesi["tur"]) =>
    tur === "hakkinda" ? hakkindaBaglantilari : tur === "zirveler" ? zirveler : [];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="GençTek ana sayfa">
          <MarkaSimgesi /><span>GENÇ<span className="brand-accent">TEK</span></span>
        </Link>
        <nav className="main-nav" aria-label="Ana menü">
          {menu.ogeler.map((oge, sira) =>
            oge.tur === "baglanti" ? (
              <Link href={oge.adres} key={`${oge.adres}-${sira}`}>{oge.etiket}</Link>
            ) : (
              <details className="nav-acilir" key={`${oge.tur}-${sira}`}>
                {/* HAKKINDA BAŞLIĞI AYNI ZAMANDA BİR BAĞLANTI: tıklayan kişi ana
                    sayfadaki kart bölümüne (#hakkinda) iniyor, oku tıklayan alt
                    başlıkları açıyor. Zirve başlığının böyle bir çapası yok. */}
                <summary>
                  {oge.tur === "hakkinda"
                    ? <HakkindaBaglantisi href={anaSayfaCapasi("hakkinda")}>{oge.etiket}</HakkindaBaglantisi>
                    : oge.etiket}
                </summary>
                <div className="nav-acilir-govde">
                  {altListe(oge.tur).map(([etiket, adres]) => <Link href={adres} key={adres}>{etiket}</Link>)}
                </div>
              </details>
            ),
          )}
        </nav>
        <TemaSecici />
        <a className="button button-primary header-cta" href={katilimAdresi}>{menu.girisEtiketi}</a>
        <details className="mobile-menu">
          <summary aria-label="Menüyü aç">Menü</summary>
          <nav aria-label="Mobil menü">
            {menu.ogeler.map((oge, sira) =>
              oge.tur === "baglanti" ? (
                <Link href={oge.adres} key={`${oge.adres}-${sira}`}>{oge.etiket}</Link>
              ) : (
                <details className="mobil-alt-menu" key={`${oge.tur}-${sira}`}>
                  <summary>{oge.etiket}</summary>
                  <div className="mobil-alt-menu-govde">
                    {altListe(oge.tur).map(([etiket, adres]) => (
                      <Link className="mobil-alt-baglanti" href={adres} key={adres}>{etiket}</Link>
                    ))}
                  </div>
                </details>
              ),
            )}
            <a href={katilimAdresi}>{menu.girisEtiketi}</a>
          </nav>
        </details>
      </div>
      <MenuKapatici />
    </header>
  );
}
