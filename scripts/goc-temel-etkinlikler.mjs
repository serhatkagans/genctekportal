// data-ornek/temel-etkinlikler.json → "Page" tablosu
// (section = 'temel-etkinlik' ve 'grup-etkinligi').
//
// On dokuz program 4 Eylül 2026'ya kadar lib/temel-etkinlik.ts içinde sabit
// yazılıydı; metnini düzeltmek ya da yenisini eklemek kod değişikliği ve
// dağıtım demekti. Betik listeyi tabloya taşıyor, sonrasında hepsi panelden
// düzenleniyor (Yönetim → Temel etkinlikler).
//
// "GençTek Zirvesi" kaydının açıklaması ve galerisi BİLEREK BOŞ taşınıyor:
// o içerik Zirveler ekranından geliyor ve okuma anında birleştiriliyor
// (bkz. lib/temel-etkinlik.ts · zirveKaydiniDoldur).
//
// Bir kereliktir: bölümlerde kayıt varsa hiçbir şey yapmaz.
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
const kaynak = resolve(kok, "data-ornek/temel-etkinlikler.json");

if (!existsSync(kaynak)) {
  console.log("! data-ornek/temel-etkinlikler.json yok, taşınacak bir şey de yok.");
  process.exit(0);
}

const kayitlar = JSON.parse(readFileSync(kaynak, "utf8"));
if (!Array.isArray(kayitlar) || kayitlar.length === 0) {
  console.log("! data-ornek/temel-etkinlikler.json boş.");
  process.exit(0);
}

const BOLUM = { temel: "temel-etkinlik", grup: "grup-etkinligi" };
const sql = postgres(baglantiYolu, { max: 1 });

try {
  const [{ n }] = await sql`
    SELECT count(*)::int AS n FROM "Page" WHERE section IN ('temel-etkinlik', 'grup-etkinligi')
  `;
  if (n > 0) {
    console.log(`! "Page" tablosunda zaten ${n} etkinlik kaydı var; göç atlandı.`);
    console.log("  Bilerek yeniden taşıyorsan önce boşalt:");
    console.log("  DELETE FROM \"Page\" WHERE section IN ('temel-etkinlik', 'grup-etkinligi');");
    process.exit(1);
  }

  // Dosyadaki sıra sitedeki kart sırası; her liste kendi içinde numaralanıyor.
  const sayaclar = { temel: 0, grup: 0 };
  await sql.begin((tx) =>
    kayitlar.map((kayit) => {
      const liste = kayit.liste === "grup" ? "grup" : "temel";
      const sira = sayaclar[liste]++;
      return tx`
        INSERT INTO "Page" (id, section, slug, title, blocks, status, "order", "publishedAt", "updatedAt")
        VALUES (
          ${randomUUID()}, ${BOLUM[liste]}, ${kayit.slug}, ${kayit.ad},
          ${sql.json({ aciklama: kayit.aciklama ?? "", gorseller: kayit.gorseller ?? [] })},
          'PUBLISHED', ${sira}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `;
    }),
  );

  console.log(`${kayitlar.length} etkinlik taşındı → "Page" (${sayaclar.temel} temel, ${sayaclar.grup} çalışma grubu)`);
} finally {
  await sql.end();
}
