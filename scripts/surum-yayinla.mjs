// Yeni bir sürüm keser: numarayı yükseltir, SURUMLER.md'deki "Yayımlanmamış"
// başlığını tarihiyle sürüme çevirir, tek bir commit atar ve etiketler.
//
//   node scripts/surum-yayinla.mjs yama      1.0.0 → 1.0.1
//   node scripts/surum-yayinla.mjs kucuk     1.0.0 → 1.1.0
//   node scripts/surum-yayinla.mjs buyuk     1.0.0 → 2.0.0
//   node scripts/surum-yayinla.mjs 1.4.2     doğrudan
//
// ETİKETİ İTMEZ. Yayımlama iki ayrı karardır: sürümü kesmek yerelde,
// yayına almak `git push --follow-tags` ile. Betik sonunda o komutu yazar.
//
// Betiğin varlık sebebi, üç şeyin AYNI ANDA doğru olmasını sağlamak:
// package.json'daki numara, SURUMLER.md'deki not ve git etiketi. Elle
// yapıldığında hep biri unutuluyor — en sık da not, ve etiketin ne
// getirdiğini kimse bilmiyor.

import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const kok = process.cwd();
const paketYolu = path.join(kok, "package.json");
const kilitYolu = path.join(kok, "package-lock.json");
const notYolu = path.join(kok, "SURUMLER.md");

const BASLIK = "## Yayımlanmamış";

function git(...argumanlar) {
  return execFileSync("git", argumanlar, { encoding: "utf8" }).trim();
}

function dur(mesaj) {
  console.error(`\n  ${mesaj}\n`);
  process.exit(1);
}

const istek = process.argv[2];
if (!istek) dur("Kullanım: node scripts/surum-yayinla.mjs yama|kucuk|buyuk|<sürüm>");

/*
 * KİRLİ AĞACIN ÜSTÜNE SÜRÜM KESİLMEZ: etiket bir commit'i işaret eder,
 * kaydedilmemiş değişiklik o commit'te yoktur. Sunucu etiketi çektiğinde
 * yerelde görülen siteyi bulamazdı.
 */
if (git("status", "--porcelain")) {
  dur("Çalışma ağacı kirli. Önce her şeyi commit et, sonra sürüm kes.");
}

const paket = JSON.parse(await readFile(paketYolu, "utf8"));
const [buyuk, kucuk, yama] = paket.version.split(".").map(Number);
if ([buyuk, kucuk, yama].some(Number.isNaN)) {
  dur(`package.json'daki sürüm okunamadı: ${paket.version}`);
}

const yeni =
  istek === "buyuk" ? `${buyuk + 1}.0.0`
  : istek === "kucuk" ? `${buyuk}.${kucuk + 1}.0`
  : istek === "yama" ? `${buyuk}.${kucuk}.${yama + 1}`
  : istek;

if (!/^\d+\.\d+\.\d+$/.test(yeni)) dur(`Geçersiz sürüm: ${yeni}`);
if (git("tag", "--list", `v${yeni}`)) dur(`v${yeni} etiketi zaten var.`);

/*
 * NOT ZORUNLU. "Yayımlanmamış" başlığının altı boşsa sürüm kesilmiyor:
 * neyin yayımlandığı yazılı değilse, aylar sonra iki etiket arasındaki farkı
 * git günlüğünden çıkarmak zorunda kalan yine biz oluyoruz.
 */
const not = await readFile(notYolu, "utf8");
const basi = not.indexOf(BASLIK);
if (basi < 0) dur(`SURUMLER.md içinde "${BASLIK}" başlığı yok.`);

const sonu = not.indexOf("\n## ", basi + BASLIK.length);
const govde = not
  .slice(basi + BASLIK.length, sonu < 0 ? undefined : sonu)
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/^\s*---\s*$/gm, "")
  .trim();
if (!govde) dur(`SURUMLER.md · "${BASLIK}" altı boş. Önce ne değiştiğini yaz.`);

const bugun = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric", month: "long", year: "numeric",
}).format(new Date());

await writeFile(
  notYolu,
  not.slice(0, basi) +
    `${BASLIK}\n\n<!-- Buraya yazılan maddeler bir sonraki sürümün notu olur. -->\n\n---\n\n` +
    `## v${yeni} — ${bugun}\n\n${govde}\n` +
    (sonu < 0 ? "" : not.slice(sonu)),
);

paket.version = yeni;
await writeFile(paketYolu, `${JSON.stringify(paket, null, 2)}\n`);

/*
 * Kilit dosyasındaki iki numara da package.json'ı yansıtır; güncellenmezse
 * sunucudaki `npm ci` kilit ile paketin uyuşmadığını söyleyip düşer.
 */
const kilit = JSON.parse(await readFile(kilitYolu, "utf8"));
kilit.version = yeni;
if (kilit.packages?.[""]) kilit.packages[""].version = yeni;
await writeFile(kilitYolu, `${JSON.stringify(kilit, null, 2)}\n`);

git("add", "package.json", "package-lock.json", "SURUMLER.md");
git("commit", "-m", `Sürüm v${yeni}`);
git("tag", "-a", `v${yeni}`, "-m", `v${yeni}\n\n${govde}`);

console.log(`\n  v${yeni} kesildi (${bugun}).`);
console.log(`  Yayına almak için:  git push --follow-tags\n`);
