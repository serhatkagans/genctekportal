import sanitizeHtml from "sanitize-html";
import { gorselYolu } from "../ortam";

// İçerik gövdeleri site kökünden yazılmış adresler taşıyor
// (WordPress aktarımında src="/wordpress/media/..."). Uygulama bir alt dizinde
// yayınlandığında bunlar alan adının kökünde aranır ve kırılır. Adresleri
// depolanan metinde değiştirmek yerine render anında düzeltiyoruz: içerik
// taşınabilir kalıyor, aynı veri farklı bir önekle de yayınlanabiliyor.
function yolDuzelt(deger?: string) {
  return typeof deger === "string" ? gorselYolu(deger) : deger;
}

// srcset virgülle ayrılmış "adres tanımlayıcı" çiftleri taşır; yalnızca adres
// kısmı değişmeli, "2x" / "640w" tanımlayıcıları olduğu gibi kalmalı.
function srcsetDuzelt(deger?: string) {
  if (typeof deger !== "string") return deger;
  return deger
    .split(",")
    .map((parca) => {
      const kirpik = parca.trim();
      if (!kirpik) return "";
      const [adres, ...tanimlayici] = kirpik.split(/\s+/);
      return [gorselYolu(adres), ...tanimlayici].join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

function medyaDonusumu(tagName: string, attribs: sanitizeHtml.Attributes) {
  const yeni = { ...attribs };
  if (yeni.src) yeni.src = yolDuzelt(yeni.src) as string;
  if (yeni.poster) yeni.poster = yolDuzelt(yeni.poster) as string;
  if (yeni.srcset) yeni.srcset = srcsetDuzelt(yeni.srcset) as string;
  return { tagName, attribs: yeni };
}

/*
 * ESKİ SİTEYE GİDEN BAĞLANTILAR (27 Ağustos 2026).
 *
 * İçe aktarılan gövdeler genctek.eba.gov.tr'ye mutlak adreslerle bağlanıyordu:
 * 223 bağlantının 220'sinin karşılığı bu sitede zaten var (aynı yol adları
 * kullanıldı), yalnızca WordPress'in yazar ve kategori sayfalarının yok.
 * Kaynak site kapanacağı için:
 *   · karşılığı olan adres site içine çevriliyor,
 *   · olmayan (author/, category/, tag/, wp-*) bağlantı çıkarılıyor —
 *     etiket <span>'e dönüyor, metin kalıyor, tıklanacak bir şey kalmıyor.
 */
const ESKI_SITE = /^https?:\/\/(?:www\.)?genctek\.eba\.gov\.tr(\/.*)?$/i;
const KARSILIGI_YOK = /^\/(?:author|category|tag|wp-)/i;

type EskiBaglanti = { yol: string } | { kaldir: true } | null;

function eskiSiteBaglantisi(href: string): EskiBaglanti {
  const eslesme = ESKI_SITE.exec(href.trim());
  if (!eslesme) return null;
  const yol = eslesme[1] ?? "/";
  if (KARSILIGI_YOK.test(yol)) return { kaldir: true };
  return { yol };
}

/*
 * GALERİ GÖRSELLERİNİN ÇÖZÜNÜRLÜĞÜ.
 *
 * Aktarılan gövdelerde görseller <a href="tam-boy.jpg"> içinde ve WordPress'in
 * 300x200'lük kopyasıyla geliyor: srcset varsa sizes="...300px" tarayıcıya hep
 * en küçük kopyayı seçtiriyor, srcset yoksa src zaten küçük kopya. Gövde
 * görsellerini sütun genişliğinde bastığımız için ikisi de bulanık kalıyordu.
 * Yalnızca bağlantı içine konmuş (yani galeri) görsellerde düzeltiyoruz;
 * bağlantısız küçük görseller — ör. koordinatör vesikalıkları — dokunulmadan
 * kalsın, aksi halde 96px'lik avatar için 1024px'lik dosya inerdi.
 */
const GOVDE_GENISLIK = "(max-width: 940px) 100vw, 940px";
const KUCUK_ESIK = 600;
const GORSEL_UZANTI = /\.(?:jpe?g|png|webp|gif)$/i;

export function galeriGorselleriBuyut(html: string) {
  return html.replace(
    /<a\b[^>]*href="([^"]+)"[^>]*>(\s*)<img\b([^>]*)>/gi,
    (tam, href: string, bosluk: string, imgOzellik: string) => {
      if (!GORSEL_UZANTI.test(href)) return tam;
      const srcsetVar = /\bsrcset=/i.test(imgOzellik);
      const genislik = Number(/\bwidth="(\d+)"/i.exec(imgOzellik)?.[1] ?? 0);
      if (!srcsetVar && genislik > KUCUK_ESIK) return tam;
      let yeni = imgOzellik.replace(/\s(?:width|height)="\d+"/gi, "");
      yeni = srcsetVar
        ? yeni.replace(/\ssizes="[^"]*"/i, "") + ` sizes="${GOVDE_GENISLIK}"`
        : yeni.replace(/\ssrc="[^"]*"/i, ` src="${href}"`);
      return tam.replace(`<img${imgOzellik}>`, `<img${yeni}>`);
    },
  );
}

/*
 * ÖNE ÇIKAN GÖRSELİN GÖVDEDE TEKRARI.
 *
 * Bazı haberlerde kapak görseli gövdenin ilk figure'ü olarak da duruyor;
 * sayfanın başında aynı fotoğraf iki kez görünüyordu. Kapakla aynı dosyayı
 * gösteren figure/görsel gövdeden çıkarılıyor, altyazısı varsa onunla birlikte.
 */
export function oneCikanTekrariniAt(html: string, oneCikan?: string) {
  if (!oneCikan) return html;
  const kacis = oneCikan.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const gorsel = `<img[^>]*src="${kacis}"[^>]*>`;
  const figurlu = new RegExp(`<figure[^>]*>\\s*${gorsel}(?:\\s*<figcaption[^>]*>[\\s\\S]*?</figcaption>)?\\s*</figure>`, "i");
  const yalin = new RegExp(`(?:<p>\\s*)?${gorsel}(?:\\s*</p>)?`, "i");
  return figurlu.test(html) ? html.replace(figurlu, "") : html.replace(yalin, "");
}

/*
 * GÖRSEL ALTYAZILARI (1 Eylül 2026 · istek: "haberlerdeki görsellerin
 * altındaki açıklamalar silinecek").
 *
 * Panelden yazılan haberlerde `[gorsel:url|alt]` etiketinin alt metni hem
 * `alt` özniteliğine hem de <figcaption>'a yazılıyordu; sonuç, her fotoğrafın
 * altında fotoğrafı tarif eden bir satırdı. Alt metin ekran okuyucu için
 * duruyor, ekranda görünen açıklama kalkıyor. Eski kayıtların gövdesi
 * kaydedildiği anda html'e çevrildiği için burada, basım sırasında sökülüyor.
 */
export function altyazilariAt(html: string) {
  return html.replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/gi, "");
}

export type IcerikGorseli = { url: string; alt: string };

/** Haber gövdesindeki fotoğrafları metinden ayırıp tek bir galeri listesine taşır. */
export function gorselleriGaleriyeAyir(html: string): { html: string; gorseller: IcerikGorseli[] } {
  const gorseller: IcerikGorseli[] = [];
  const gorulen = new Set<string>();

  const ozellik = (etiket: string, ad: string) =>
    new RegExp(`\\b${ad}="([^"]*)"`, "i").exec(etiket)?.[1] ?? "";
  const ekle = (url: string, alt: string) => {
    const temizUrl = url.trim();
    if (!temizUrl || gorulen.has(temizUrl)) return;
    gorulen.add(temizUrl);
    gorseller.push({ url: temizUrl, alt: alt.trim() });
  };

  const baglantiliEtiketler = new Set<string>();
  html.replace(/<a\b[^>]*href="([^"]+)"[^>]*>\s*(<img\b[^>]*>)/gi, (tam, href: string, img: string) => {
    baglantiliEtiketler.add(img);
    ekle(GORSEL_UZANTI.test(href.split(/[?#]/)[0]) ? href : ozellik(img, "src"), ozellik(img, "alt"));
    return tam;
  });

  html.replace(/<img\b[^>]*>/gi, (img) => {
    if (!baglantiliEtiketler.has(img)) ekle(ozellik(img, "src"), ozellik(img, "alt"));
    return img;
  });

  let metin = html.replace(/<img\b[^>]*>/gi, "");
  const bosKap = /<(figure|a|p|div)\b[^>]*>\s*(?:<br\s*\/?>(?:\s*)?)?<\/\1>/gi;
  let onceki = "";
  while (metin !== onceki) {
    onceki = metin;
    metin = metin.replace(bosKap, "");
  }

  /*
   * Boşluk kısma BURADA da çalışmalı: fotoğraflar sökülünce geriye kalan
   * <br> dizileri ancak bu adımdan sonra yan yana geliyor. Gövde
   * sanitizeRichText'ten geçerken aralarında hâlâ <img> vardı, o yüzden orada
   * "ard arda satır sonu" gibi görünmüyorlardı.
   */
  return { html: bosSatirlariKis(metin), gorseller };
}

/*
 * GÖVDEDEN GÖRSELLERİ ÇIKARMAK (1 Eylül 2026 · istek: "çalışma gruplarında
 * sayfa içi fotoları sil ama kartlarda kalsın").
 *
 * Çalışma grubu sayfalarında arşivden gelen fotoğraf dizileri kaldırıldı;
 * görsel yalnızca listedeki kartlarda duruyor. Metin olduğu gibi kalıyor.
 * Görseli saran figure/bağlantı da gidiyor, yoksa geriye boş kutular kalırdı.
 */
export function gorselleriAt(html: string) {
  // Görseller çıkınca yan yana kalan satır sonları da kısılıyor; gerekçe
  // bosSatirlariKis içinde, gorselleriGaleriyeAyir ile aynı.
  return bosSatirlariKis(
    html
      .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
      .replace(/<a[^>]*>\s*<img[^>]*>\s*<\/a>/gi, "")
      .replace(/<img[^>]*>/gi, "")
      .replace(/<p>\s*<\/p>/gi, ""),
  );
}

/*
 * GÖVDE SONUNDAKİ BOŞLUK YIĞINI (1 Eylül 2026 · istek: "yazılarla butonlar
 * arasında çok boşluk var", "burada da boşluk fazla").
 *
 * Arşivden gelen gövdeler WordPress editöründe enter'a basıla basıla bırakılmış
 * <br> dizileriyle bitiyor — ör. amasya haberinde son hashtag'den sonra 24,
 * bilecik'te 10 tane arka arkaya. Ekranda bu, metinle "Önceki/Sonraki Haber"
 * bağlantıları arasında yüzlerce piksellik boş alan demek. Metnin kendi
 * paragraf aralığı zaten CSS'ten geliyor; yazarın niyeti "biraz boşluk"tu,
 * "yarım ekran" değil.
 *
 * Kayıtların gövdesini düzeltmek yerine basım sırasında kısıyoruz: kaynak
 * olduğu gibi kalsın, aynı içerik başka bir yerde de temiz baskı versin.
 * Bilinçli tek satır atlama (tek/çift <br>) korunuyor, üçüncüden sonrası ve
 * blok sonundaki takıntı boşlukları gidiyor.
 */
const BOSLUK = String.raw`(?:\s|&nbsp;|\u00a0)`;
const SATIR_SONU = String.raw`<br\s*/?>`;
const BLOKLAR = String.raw`p|div|li|td|blockquote|h[1-6]`;

const BLOK_ACILIS = String.raw`\b[^>]*>`;

export function bosSatirlariKis(html: string) {
  let metin = html
    // Üç ve daha fazla ard arda satır sonu → tek boş satır.
    .replace(new RegExp(`(?:${SATIR_SONU}${BOSLUK}*){3,}`, "gi"), "<br /><br />")
    // Blok kapanmadan hemen önceki satır sonları ve boşluklar.
    .replace(new RegExp(`(?:${SATIR_SONU}|${BOSLUK})+(</(?:${BLOKLAR})>)`, "gi"), "$1")
    // Blok açıldıktan hemen sonraki satır sonları.
    .replace(new RegExp(`(<(?:${BLOKLAR})${BLOK_ACILIS})(?:${SATIR_SONU}${BOSLUK}*)+`, "gi"), "$1");

  // Geriye kalan boş paragraf/kutular; iç içe olabildikleri için sabitlenene dek.
  const bosBlok = new RegExp(`<(p|div)${BLOK_ACILIS}(?:${BOSLUK}|${SATIR_SONU})*</${String.raw`\1`}>`, "gi");
  let onceki = "";
  while (metin !== onceki) {
    onceki = metin;
    metin = metin.replace(bosBlok, "");
  }

  // Gövdenin en sonunda kalan satır sonları (kapsayıcısı olmayan hâli).
  return metin.replace(new RegExp(`(?:${SATIR_SONU}|${BOSLUK})+$`, "i"), "");
}

export function sanitizeRichText(input: string) {
  return bosSatirlariKis(sanitizeHtml(galeriGorselleriBuyut(input), {
    allowedTags: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "a", "br", "hr", "figure", "figcaption", "img", "div", "span", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "pre", "code", "details", "summary", "sup", "sub", "iframe", "video", "source"],
    allowedAttributes: { "*": ["class", "id", "title", "aria-label", "aria-hidden"], a: ["href", "target", "rel", "download"], img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"], iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"], video: ["src", "poster", "controls", "width", "height"], source: ["src", "srcset", "type", "media"], td: ["colspan", "rowspan"], th: ["colspan", "rowspan", "scope"] },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    /* ŞEMA-GÖRELİ ADRESLER DE ELENİYOR (5 Eylül 2026 · güvenlik incelemesi).
       sanitize-html'in varsayılanı bunları GEÇİRMEK: `allowedSchemes` bir şema
       taşımayan `//kotu.example` adresine hiç bakmıyor, dolayısıyla haber
       gövdesine yazılan böyle bir bağlantı temizleyiciden sağ çıkıyordu ve
       okuyucuyu site içi bir yol gibi görünürken dışarı götürüyordu. Aynı açık
       panelin adres alanlarında da vardı (bkz. lib/guvenli-adres.ts).
       Mevcut içerikte tek bir örneği yok; dış adres `https://` ile yazılıyor. */
    allowProtocolRelative: false,
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      img: medyaDonusumu,
      source: medyaDonusumu,
      video: medyaDonusumu,
      // Bağlantılarda yalnızca site içi yollar düzeltilir; dış adresler ve
      // mailto/tel gorselYolu tarafından olduğu gibi bırakılır.
      a: (tagName, attribs) => {
        const eski = attribs.href ? eskiSiteBaglantisi(attribs.href) : null;
        if (eski && "kaldir" in eski) {
          const { href: _href, target: _target, download: _download, ...kalan } = attribs;
          return { tagName: "span", attribs: kalan };
        }
        const href = eski ? gorselYolu(eski.yol) : attribs.href ? gorselYolu(attribs.href) : undefined;
        return {
          tagName,
          attribs: { ...attribs, rel: "noopener noreferrer", ...(href ? { href } : {}), ...(eski ? { target: "_self" } : {}) },
        };
      },
    },
  }));
}
