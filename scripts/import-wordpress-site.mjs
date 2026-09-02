import { createHash } from "node:crypto";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sanitizeHtml from "sanitize-html";

const site = "https://genctek.eba.gov.tr";
const api = `${site}/wp-json/wp/v2`;
const root = process.cwd();
const mediaDirectory = path.join(root, "public", "wordpress", "media");
const generatedDirectory = path.join(root, "lib", "generated");

const allowedTags = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u",
  "ul", "ol", "li", "blockquote", "a", "br", "hr", "figure", "figcaption", "img",
  "div", "span", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "pre", "code", "details", "summary", "sup", "sub", "iframe", "video", "source",
];
const allowedAttributes = {
  "*": ["class", "id", "title", "aria-label", "aria-hidden"],
  a: ["href", "target", "rel", "download"],
  img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"],
  iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"],
  video: ["src", "poster", "controls", "width", "height"],
  source: ["src", "srcset", "type", "media"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan", "scope"],
};

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
      if (response.ok || response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}: ${url}`);
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, attempt * 900));
  }
  throw lastError;
}

async function fetchCollection(type) {
  const items = [];
  for (let page = 1; ; page += 1) {
    const response = await fetchWithRetry(`${api}/${type}?status=publish&per_page=100&page=${page}&_embed=1`);
    if (response.status === 400 && page > 1) break;
    if (!response.ok) throw new Error(`${type} API ${response.status}`);
    const batch = await response.json();
    items.push(...batch);
    const totalPages = Number(response.headers.get("x-wp-totalpages") || 1);
    if (page >= totalPages) break;
  }
  return items;
}

function plainText(html = "") {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

// WordPress otomatik özetleri yarım cümlede […] ile keser. İçeri aktarırken
// gövdedeki aynı paragrafın sonuna kadar uzat; özel/elle yazılmış özeti koru.
function completeExcerpt(excerptHtml = "", contentHtml = "") {
  const excerpt = plainText(excerptHtml);
  const truncatedEnd = /\s*(?:\[…\]|\[\.\.\.\]|…)\s*$/u;
  if (!truncatedEnd.test(excerpt)) return excerpt;

  const truncated = excerpt.replace(truncatedEnd, "").trim();
  const paragraphs = Array.from(contentHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => plainText(match[1]))
    .filter(Boolean);
  const body = paragraphs.join(" ") || plainText(contentHtml);
  if (!truncated || !body.startsWith(truncated.slice(0, Math.min(40, truncated.length)))) return truncated;

  let completed = "";
  for (const paragraph of paragraphs) {
    completed = `${completed} ${paragraph}`.trim();
    if (completed.length >= truncated.length) return completed;
  }
  return truncated;
}

function extensionFor(url, contentType = "") {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  if (/^\.(?:jpe?g|png|webp|gif|svg|avif|pdf|mp4|webm|mp3|wav|docx?|xlsx?|pptx?|zip)$/.test(ext)) return ext;
  const types = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg", "application/pdf": ".pdf", "video/mp4": ".mp4" };
  return types[contentType.split(";")[0].toLowerCase()] || ".bin";
}

const assetCache = new Map();
const failedAssets = [];
const existingAssets = new Map();

async function localizeAsset(rawUrl) {
  const decoded = rawUrl.replaceAll("&amp;", "&");
  let url;
  try { url = new URL(decoded, site).href; } catch { return rawUrl; }
  if (!url.startsWith(`${site}/wp-content/uploads/`)) return rawUrl;
  if (assetCache.has(url)) return assetCache.get(url);
  const urlHash = createHash("sha1").update(url).digest("hex").slice(0, 16);
  if (existingAssets.has(urlHash)) {
    const local = `/wordpress/media/${existingAssets.get(urlHash)}`;
    assetCache.set(url, local);
    return local;
  }
  try {
    const response = await fetchWithRetry(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const extension = extensionFor(url, response.headers.get("content-type") || "");
    const hash = urlHash;
    const original = path.basename(new URL(url).pathname, path.extname(new URL(url).pathname))
      .normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "dosya";
    const fileName = `${original}-${hash}${extension}`;
    await writeFile(path.join(mediaDirectory, fileName), buffer);
    const local = `/wordpress/media/${fileName}`;
    assetCache.set(url, local);
    return local;
  } catch (error) {
    failedAssets.push({ url, error: String(error) });
    return rawUrl;
  }
}

function collectAssetUrls(html) {
  const urls = [];
  for (const match of html.matchAll(/(?:src|href|poster)=["']([^"']+)["']/gi)) urls.push(match[1]);
  for (const match of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) urls.push(candidate.trim().split(/\s+/)[0]);
  }
  return [...new Set(urls.filter(Boolean))];
}

async function localizeHtml(html) {
  let localized = html || "";
  const urls = collectAssetUrls(localized).filter((url) => url.includes("/wp-content/uploads/"));
  for (const url of urls) {
    const local = await localizeAsset(url);
    localized = localized.split(url).join(local);
    localized = localized.split(url.replaceAll("&", "&amp;")).join(local);
  }
  return sanitizeHtml(localized, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });
}

function originalPath(link) {
  try { return decodeURIComponent(new URL(link).pathname).replace(/^\/+|\/+$/g, ""); }
  catch { return ""; }
}

async function serialize(item, type) {
  const featuredSource = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
  const html = await localizeHtml(item.content?.rendered || "");
  const contentImage = html.match(/<img[^>]+src=["'](\/wordpress\/media\/[^"']+)["']/i)?.[1] || "";
  return {
    id: item.id,
    type,
    slug: item.slug,
    path: originalPath(item.link),
    title: plainText(item.title?.rendered),
    excerpt: completeExcerpt(item.excerpt?.rendered, html),
    date: item.date,
    modified: item.modified,
    link: item.link,
    parent: item.parent || 0,
    menuOrder: item.menu_order || 0,
    categories: item.categories || [],
    featuredImage: featuredSource ? await localizeAsset(featuredSource) : contentImage,
    html,
  };
}

await mkdir(mediaDirectory, { recursive: true });
await mkdir(generatedDirectory, { recursive: true });
for (const fileName of await readdir(mediaDirectory)) {
  const hash = fileName.match(/-([a-f0-9]{16})\.[^.]+$/)?.[1];
  if (hash) existingAssets.set(hash, fileName);
}

const [rawPosts, rawPages, rawCategories] = await Promise.all([
  fetchCollection("posts"), fetchCollection("pages"), fetchCollection("categories"),
]);

const posts = [];
for (let index = 0; index < rawPosts.length; index += 1) {
  posts.push(await serialize(rawPosts[index], "post"));
  process.stdout.write(`\rYazılar: ${index + 1}/${rawPosts.length} | Medya: ${assetCache.size}`);
}
process.stdout.write("\n");

const pages = [];
for (let index = 0; index < rawPages.length; index += 1) {
  pages.push(await serialize(rawPages[index], "page"));
  process.stdout.write(`\rSayfalar: ${index + 1}/${rawPages.length} | Medya: ${assetCache.size}`);
}
process.stdout.write("\n");

const categories = rawCategories.map((category) => ({
  id: category.id, slug: category.slug, name: plainText(category.name), description: plainText(category.description), count: category.count,
}));

await Promise.all([
  writeFile(path.join(generatedDirectory, "wordpress-posts.json"), JSON.stringify(posts, null, 2), "utf8"),
  writeFile(path.join(generatedDirectory, "wordpress-pages.json"), JSON.stringify(pages, null, 2), "utf8"),
  writeFile(path.join(generatedDirectory, "wordpress-categories.json"), JSON.stringify(categories, null, 2), "utf8"),
  writeFile(path.join(generatedDirectory, "wordpress-import-report.json"), JSON.stringify({ importedAt: new Date().toISOString(), posts: posts.length, pages: pages.length, categories: categories.length, assets: assetCache.size, failedAssets }, null, 2), "utf8"),
]);

process.stdout.write(`Tamamlandı: ${posts.length} yazı, ${pages.length} sayfa, ${categories.length} kategori, ${assetCache.size} yerel medya.\n`);
if (failedAssets.length) process.stdout.write(`İndirilemeyen medya: ${failedAssets.length}\n`);
