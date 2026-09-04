// data-ornek/yardimlasma.json → "Page" tablosu (section = 'yardimlasma').
//
// Dört yardımlaşma grubu 4 Eylül 2026'ya kadar lib/yardimlasma.ts içinde sabit
// yazılıydı; tanıtım metinleri "sonra gelecek" diye boş bırakılmıştı ve metin
// geldiğinde kod değişikliği gerekiyordu. Bu betik listeyi tabloya taşıyor,
// sonrasında hepsi panelden düzenleniyor (Yönetim → Yardımlaşma grupları).
//
// Bir kereliktir: bölümde kayıt varsa hiçbir şey yapmaz — ikinci çalıştırma
// panelden yazılmış metinleri boş hâllerine döndürürdü.
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

if (existsSync(".env")) process.loadEnvFile(".env");

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kaynak = resolve(kok, "data-ornek/yardimlasma.json");

if (!existsSync(kaynak)) {
  console.log("! data-ornek/yardimlasma.json yok, taşınacak bir şey de yok.");
  process.exit(0);
}

const gruplar = JSON.parse(readFileSync(kaynak, "utf8"));
if (!Array.isArray(gruplar) || gruplar.length === 0) {
  console.log("! data-ornek/yardimlasma.json boş.");
  process.exit(0);
}

const sql = postgres(baglantiYolu, { max: 1 });

try {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM "Page" WHERE section = 'yardimlasma'`;
  if (n > 0) {
    console.log(`! "Page" tablosunda zaten ${n} yardımlaşma kaydı var; göç atlandı.`);
    console.log('  Bilerek yeniden taşıyorsan önce boşalt: DELETE FROM "Page" WHERE section = \'yardimlasma\';');
    process.exit(1);
  }

  // Dosyadaki sıra sitedeki kart sırası; "order" sütununa yazılıyor.
  await sql.begin((tx) =>
    gruplar.map((grup, sira) => tx`
      INSERT INTO "Page" (id, section, slug, title, blocks, status, "order", "publishedAt", "updatedAt")
      VALUES (
        ${randomUUID()}, 'yardimlasma', ${grup.slug}, ${grup.ad},
        ${sql.json({ gorsel: grup.gorsel ?? "", metin: grup.metin ?? "" })},
        'PUBLISHED', ${sira}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `),
  );

  console.log(`${gruplar.length} yardımlaşma grubu taşındı → "Page" (section = 'yardimlasma')`);
  for (const grup of gruplar) console.log(`  ${grup.slug.padEnd(22)} ${grup.ad}`);
} finally {
  await sql.end();
}
