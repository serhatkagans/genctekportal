// data/haberler.json → "Article" tablosu. Bir kereliktir; tablo doluysa hiçbir
// şey yapmaz, çünkü ikinci çalıştırma panelden yapılan düzenlemeleri dosyadaki
// eski hâle döndürürdü. Göç sonrası dosya elde kalıyor, geri dönüş gerekirse diye.
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import sanitizeHtml from "sanitize-html";

if (existsSync(".env")) process.loadEnvFile(".env");

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kaynak = resolve(kok, "data/haberler.json");

if (!existsSync(kaynak)) {
  console.log("! data/haberler.json yok, taşınacak bir şey de yok.");
  process.exit(0);
}

const haberler = JSON.parse(readFileSync(kaynak, "utf8"));
if (!Array.isArray(haberler) || haberler.length === 0) {
  console.log("! data/haberler.json boş.");
  process.exit(0);
}

/* lib/haber.ts:haberOzetiniTamamla'nın kopyası. Orası TypeScript, bu betik düz
   JS ve projede allowJs kapalı; tek bir fonksiyon için derleme ayarını
   değiştirmek yerine kopyalandı. Aslı orada ve testleri de orada
   (tests/haber-ozeti.test.ts) — burası bir kez çalışıp tarihe karışacak.

   NEDEN GÖÇTE TAMAMLANIYOR: dosya sürümünde bu iş her okumada yapılıyordu ve
   haber listesini istek başına ~41 ms CPU'ya mal ediyordu. Tamamlanmış özet
   tabloya yazılınca maliyet tamamen kalkıyor. */
const KESIK_OZET_SONU = /\s*(?:\[…\]|\[\.\.\.\]|…)\s*$/u;

function duzMetin(html) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

function ozetiTamamla(excerpt, html) {
  const ozet = (excerpt ?? "").trim();
  if (!KESIK_OZET_SONU.test(ozet)) return ozet;

  const kesik = ozet.replace(KESIK_OZET_SONU, "").trim();
  const paragraflar = Array.from((html ?? "").matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((eslesme) => duzMetin(eslesme[1]))
    .filter(Boolean);
  const govde = paragraflar.join(" ") || duzMetin(html ?? "");
  const onEk = kesik.slice(0, Math.min(40, kesik.length));
  if (!kesik || !govde.startsWith(onEk)) return kesik;

  let tamamlanan = "";
  for (const paragraf of paragraflar) {
    tamamlanan = `${tamamlanan} ${paragraf}`.trim();
    if (tamamlanan.length >= kesik.length) return tamamlanan;
  }
  return kesik;
}

const sql = postgres(baglantiYolu, { max: 1 });

try {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM "Article"`;
  if (n > 0) {
    console.log(`! "Article" tablosunda zaten ${n} kayıt var; göç atlandı.`);
    console.log('  Bilerek yeniden taşıyorsan önce tabloyu boşalt: DELETE FROM "Article";');
    process.exit(1);
  }

  let tamamlanan = 0;
  await sql.begin((tx) =>
    haberler.map((haber) => {
      const ozet = ozetiTamamla(haber.excerpt, haber.html);
      if (ozet !== (haber.excerpt ?? "").trim()) tamamlanan += 1;
      return tx`
        INSERT INTO "Article" (
          id, "refNo", title, slug, summary, body, format, source, "coverImage",
          categories, status, "publishedAt", "createdAt", "updatedAt"
        )
        VALUES (
          ${randomUUID()}, ${haber.id}, ${haber.title}, ${haber.slug}, ${ozet},
          ${sql.json(haber.html ?? "")}, ${haber.bicim ?? "html"}, ${haber.kaynak ?? ""},
          ${haber.featuredImage ?? ""}, ${haber.categories ?? []}, 'PUBLISHED',
          ${haber.date ? new Date(haber.date) : null},
          ${haber.date ? new Date(haber.date) : new Date()},
          ${haber.modified ? new Date(haber.modified) : new Date()}
        )
      `;
    }),
  );

  /* Kimlikler dosyadan olduğu gibi yazıldı; IDENTITY sırası hâlâ 1'de duruyor ve
     panelden eklenen ilk haber çakışırdı. Sıra en büyük kimliğin bir üstüne alınır. */
  const [{ enBuyuk }] = await sql`SELECT MAX("refNo")::int AS "enBuyuk" FROM "Article"`;
  await sql`SELECT setval(pg_get_serial_sequence('"Article"', 'refNo'), ${enBuyuk})`;

  console.log(`${haberler.length} haber "Article" tablosuna taşındı.`);
  console.log(`  ${tamamlanan} kaydın kesik özeti tamamlanarak yazıldı.`);
  console.log(`  refNo sırası ${enBuyuk} değerine alındı; sonraki haber ${enBuyuk + 1} olacak.`);
} finally {
  await sql.end();
}
