// Haber gövdesi iki biçimde girilebilir:
//   "html" — içe aktarılan WordPress içerikleri; işaretleme aynen korunur.
//   "duz"  — panelden normal yazım; burada HTML'e çevrilir.
// Site her zaman html alanını basar, düz metnin kaynağı ayrıca saklanır ki
// haber yeniden açıldığında kullanıcı yazdığı metni görsün.

export type HaberBicimi = "html" | "duz";

const KACIS: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const COZUM: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

function kacir(metin: string) {
  return metin.replace(/[&<>"]/g, (k) => KACIS[k]);
}

function coz(metin: string) {
  return metin.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (k) => COZUM[k] ?? k);
}

// Yalnızca site içi ve bilinen şemalara izin verilir; sanitizeRichText ikinci
// savunma hattı olarak zaten çalışıyor, bu ilk süzgeç.
function baglantiGuvenliMi(adres: string) {
  return /^(https?:\/\/|mailto:|tel:|\/)/i.test(adres.trim());
}

function satirIci(metin: string) {
  let cikti = kacir(metin);
  cikti = cikti.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (tam, yazi: string, adres: string) =>
    baglantiGuvenliMi(adres) ? `<a href="${adres}">${yazi}</a>` : tam);
  cikti = cikti.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  cikti = cikti.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  return cikti;
}

const GORSEL_KALIBI = /^\[gorsel:([^|\]]+?)(?:\|([^\]]*))?\]$/;

export function gorselEtiketi(url: string, alt = "") {
  return alt ? `[gorsel:${url}|${alt}]` : `[gorsel:${url}]`;
}

function blokCevir(blok: string): string {
  const satirlar = blok.split("\n").map((s) => s.trim()).filter(Boolean);
  if (satirlar.length === 0) return "";

  const gorsel = satirlar.length === 1 ? satirlar[0].match(GORSEL_KALIBI) : null;
  if (gorsel) {
    const [, url, alt = ""] = gorsel;
    if (!baglantiGuvenliMi(url)) return `<p>${satirIci(satirlar[0])}</p>`;
    const altMetni = kacir(alt.trim());
    const yazi = altMetni ? `<figcaption>${altMetni}</figcaption>` : "";
    return `<figure><img src="${url.trim()}" alt="${altMetni}" loading="lazy" />${yazi}</figure>`;
  }

  if (satirlar.length === 1) {
    const baslik = satirlar[0].match(/^(#{2,3})\s+(.+)$/);
    if (baslik) {
      const seviye = baslik[1].length;
      return `<h${seviye}>${satirIci(baslik[2])}</h${seviye}>`;
    }
    if (/^-{3,}$/.test(satirlar[0])) return "<hr />";
  }

  if (satirlar.every((s) => /^[-*]\s+/.test(s))) {
    const ogeler = satirlar.map((s) => `<li>${satirIci(s.replace(/^[-*]\s+/, ""))}</li>`).join("");
    return `<ul>${ogeler}</ul>`;
  }

  if (satirlar.every((s) => /^\d+[.)]\s+/.test(s))) {
    const ogeler = satirlar.map((s) => `<li>${satirIci(s.replace(/^\d+[.)]\s+/, ""))}</li>`).join("");
    return `<ol>${ogeler}</ol>`;
  }

  if (satirlar.every((s) => s.startsWith(">"))) {
    const metin = satirlar.map((s) => satirIci(s.replace(/^>\s?/, ""))).join("<br />");
    return `<blockquote><p>${metin}</p></blockquote>`;
  }

  return `<p>${satirlar.map(satirIci).join("<br />")}</p>`;
}

export function duzMetindenHtml(metin: string): string {
  return metin
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map(blokCevir)
    .filter(Boolean)
    .join("\n");
}

// Var olan bir HTML haberini düz metin kutusuna aktarmak için kaba çevirici.
// Amaç birebir dönüşüm değil, elle düzenlemeye elverişli bir başlangıç metni.
export function htmldenDuzMetin(html: string): string {
  let metin = html.replace(/\r\n/g, "\n");

  metin = metin.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  metin = metin.replace(/<img\b[^>]*>/gi, (etiket) => {
    const url = etiket.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
    const alt = etiket.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    return url ? `\n\n${gorselEtiketi(url, coz(alt))}\n\n` : "";
  });
  metin = metin.replace(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_t, adres: string, yazi: string) => `[${yazi.replace(/<[^>]+>/g, "").trim()}](${adres})`);
  metin = metin.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");
  metin = metin.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");
  metin = metin.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  metin = metin.replace(/<h[3-6]\b[^>]*>([\s\S]*?)<\/h[3-6]>/gi, "\n\n### $1\n\n");
  metin = metin.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1");
  metin = metin.replace(/<br\s*\/?>/gi, "\n");
  metin = metin.replace(/<\/(p|div|figure|figcaption|blockquote|ul|ol|table|tr)>/gi, "\n\n");
  metin = metin.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");
  metin = metin.replace(/<[^>]+>/g, "");

  return coz(metin)
    .split("\n")
    .map((s) => s.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function govdeHtmlUret(bicim: HaberBicimi, icerik: string) {
  return bicim === "duz" ? duzMetindenHtml(icerik) : icerik;
}
