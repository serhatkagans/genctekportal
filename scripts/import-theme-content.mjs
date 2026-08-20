import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sanitizeHtml from "sanitize-html";

const site = "https://genctek.eba.gov.tr";
const root = process.cwd();

async function fetchWithRetry(url, options) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(45000) });
      if (response.ok || response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}: ${url}`);
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, attempt * 750));
  }
  throw lastError;
}

const sources = [
  ["oyun-tasarimi-egitijam", "egitijam2026"],
  ["g2s-genc-sektor-bulusmalari", "g2s-genc-sektor-bulusmalari-26-agustos-yazilim-gelistirme"],
  ["ritim-ai-yapay-zeka-araclari", "genctek-usak-yapay-zeka-araclari-ve-ritim-a-i"],
  ["dijital-sanatlar", "genctek-zonguldak-dijital-sanatlar-temali-tanisma-toplantisi"],
  ["bilisim-hukuku-guvenli-internet", "genctek-balikesir-bilisim-hukuku-ve-guvenli-internet-temali-tanisma-toplantisi-tamamlandi"],
  ["tek-maraton", "genctek-bursa-tek-maraton-egitim-teknolojileri-fikir-maratonu-tamamlandi"],
  ["robot-isletim-sistemi", "genctek-kahramanmaras-robotik-temali-tanisma-toplantisi"],
  ["espor", "g2s-genc-sektor-bulusmalari-4-ekim-espor-sektoru"],
  ["robot-futbol-ligi", "genctek-kayseri-robot-futbol-ligi-musabakalar-basladi"],
  ["iha", "genctek-gaziantep-havacilik-sistemleri-iha-temali-tanisma-toplantisi"],
  ["acik-kaynak", "genctek-tubitak-bilgem-bilim-ve-teknoloji-haftasi-programi"],
  ["e-ticaret-e-ihracat", "genctek-izmir-e-ticaret-ve-e-ihracat-ideathonu-icin-ikinci-kez-bir-araya-geldi"],
  ["yapay-zeka", "genctek-konya-yapay-zeka-temali-tanisma-toplantisi"],
  ["master-tek", "genctek-komisyonu-hazirlik-toplantisi"],
  ["dijital-yuruyus-stem", "genctek-amasya-dijital-yuruyus-stem"],
  ["dijital-bagimliliklara-sosyal-fiziksel-alternatif", "genctek-manisa-tanisma-toplantisi"],
];

const allowedTags = ["p","h2","h3","h4","strong","em","ul","ol","li","blockquote","a","br","figure","figcaption","img","div","span","table","thead","tbody","tr","th","td"];
const allowedAttributes = {
  a: ["href","target","rel","class"], img: ["src","alt","width","height","loading","class"],
  figure: ["class"], div: ["class"], span: ["class"], table: ["class"],
};

function extensionFrom(url, contentType) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  if ([".jpg",".jpeg",".png",".webp",".gif"].includes(ext)) return ext;
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("gif")) return ".gif";
  return ".jpg";
}

async function getPost(sourceSlug) {
  for (const type of ["posts", "pages"]) {
    const response = await fetchWithRetry(`${site}/wp-json/wp/v2/${type}?slug=${encodeURIComponent(sourceSlug)}&per_page=1`);
    if (!response.ok) throw new Error(`${type} API ${response.status}: ${sourceSlug}`);
    const items = await response.json();
    if (items[0]) return items[0];
  }
  throw new Error(`Yazı bulunamadı: ${sourceSlug}`);
}

async function localizeImages(html, themeSlug) {
  const embeddedImages = [...html.matchAll(/<(?:img)[^>]+(?:src|data-src)=["']([^"']+)["']/gi)].map((match) => match[1]);
  const linkedImages = [...html.matchAll(/href=["']([^"']+\.(?:jpe?g|png|webp|gif)(?:\?[^"']*)?)["']/gi)].map((match) => match[1]);
  const imageUrls = [...embeddedImages, ...linkedImages]
    .filter((url) => /^https?:\/\//.test(url));
  const unique = [...new Set(imageUrls)];
  const destination = path.join(root, "public", "temalar", "icerik", themeSlug);
  await mkdir(destination, { recursive: true });
  let localized = html;
  const images = [];
  const documents = [];

  for (let index = 0; index < unique.length; index += 1) {
    const url = unique[index];
    const response = await fetchWithRetry(url);
    if (!response.ok) continue;
    const ext = extensionFrom(url, response.headers.get("content-type"));
    const fileName = `${String(index + 1).padStart(2, "0")}${ext}`;
    await writeFile(path.join(destination, fileName), Buffer.from(await response.arrayBuffer()));
    const localUrl = `/temalar/icerik/${themeSlug}/${fileName}`;
    localized = localized.split(url).join(localUrl);
    images.push(localUrl);
  }

  const documentUrls = [...localized.matchAll(/href=["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi)]
    .map((match) => match[1])
    .filter((url) => /^https?:\/\//.test(url));
  for (let index = 0; index < [...new Set(documentUrls)].length; index += 1) {
    const url = [...new Set(documentUrls)][index];
    const response = await fetchWithRetry(url);
    if (!response.ok) continue;
    const fileName = `belge-${String(index + 1).padStart(2, "0")}.pdf`;
    await writeFile(path.join(destination, fileName), Buffer.from(await response.arrayBuffer()));
    const localUrl = `/temalar/icerik/${themeSlug}/${fileName}`;
    localized = localized.split(url).join(localUrl);
    documents.push(localUrl);
  }
  return { html: localized, images, documents };
}

const output = {};
for (const [themeSlug, sourceSlug] of sources) {
  const post = await getPost(sourceSlug);
  const localized = await localizeImages(post.content.rendered, themeSlug);
  output[themeSlug] = {
    title: sanitizeHtml(post.title.rendered, { allowedTags: [] }),
    publishedAt: post.date,
    sourceUrl: post.link,
    html: sanitizeHtml(localized.html, { allowedTags, allowedAttributes, allowedSchemes: ["http","https","mailto"], allowProtocolRelative: false }),
    images: localized.images,
    documents: localized.documents,
  };
  process.stdout.write(`✓ ${themeSlug}: ${localized.images.length} görsel\n`);
}

const pdfDirectory = path.join(root, "public", "temalar", "icerik", "dijital-yuruyus-stem");
await mkdir(pdfDirectory, { recursive: true });
const pdfResponse = await fetchWithRetry(`${site}/wp-content/uploads/2026/01/Dijital-Yuruyus-STEM-Bilgi-Notu-GencTek.pdf`);
if (pdfResponse.ok) await writeFile(path.join(pdfDirectory, "dijital-yuruyus-stem-bilgi-notu.pdf"), Buffer.from(await pdfResponse.arrayBuffer()));
output["dijital-yuruyus-stem"].documentUrl = "/temalar/icerik/dijital-yuruyus-stem/dijital-yuruyus-stem-bilgi-notu.pdf";

const generatedDirectory = path.join(root, "lib", "generated");
await mkdir(generatedDirectory, { recursive: true });
await writeFile(path.join(generatedDirectory, "theme-source-content.json"), JSON.stringify(output, null, 2), "utf8");
process.stdout.write(`\n${sources.length} tema yazısı içe aktarıldı.\n`);
