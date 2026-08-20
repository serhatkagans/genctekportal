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

export function sanitizeRichText(input: string) {
  return sanitizeHtml(input, {
    allowedTags: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "a", "br", "hr", "figure", "figcaption", "img", "div", "span", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "pre", "code", "details", "summary", "sup", "sub", "iframe", "video", "source"],
    allowedAttributes: { "*": ["class", "id", "title", "aria-label", "aria-hidden"], a: ["href", "target", "rel", "download"], img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"], iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"], video: ["src", "poster", "controls", "width", "height"], source: ["src", "srcset", "type", "media"], td: ["colspan", "rowspan"], th: ["colspan", "rowspan", "scope"] },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      img: medyaDonusumu,
      source: medyaDonusumu,
      video: medyaDonusumu,
      // Bağlantılarda yalnızca site içi yollar düzeltilir; dış adresler ve
      // mailto/tel gorselYolu tarafından olduğu gibi bırakılır.
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer", ...(attribs.href ? { href: gorselYolu(attribs.href) } : {}) },
      }),
    },
  });
}
