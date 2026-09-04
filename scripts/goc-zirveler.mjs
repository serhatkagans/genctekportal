// data-ornek/zirveler.json → "Page" tablosu (section = 'zirve').
//
// İki GençTek Zirvesi 4 Eylül 2026'ya kadar lib/zirve.ts içinde sabit yazılıydı:
// yeni bir zirve eklemek de bir cümleyi düzeltmek de kod değişikliği ve dağıtım
// demekti. Bu betik o içeriği tabloya taşıyor; sonrasında hepsi panelden
// düzenleniyor (Yönetim → Zirveler).
//
// ADRESLER KORUNUYOR: her kaydın tarihsel yolu ("/zirve",
// "/2-genctek-zirvesi-2026") "linkUrl" sütununda duruyor. Panelden açılan yeni
// zirveler /zirve/<slug> altına düşer.
//
// Bir kereliktir: bölümde kayıt varsa hiçbir şey yapmaz — ikinci çalıştırma
// panelden yapılmış düzenlemeleri dosyadaki ilk hâle döndürürdü. Dosya elde
// kalıyor; aynı zamanda veritabanı bağlantısı koptuğunda lib/zirve.ts'in
// düştüğü yedek.
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
const kaynak = resolve(kok, "data-ornek/zirveler.json");

if (!existsSync(kaynak)) {
  console.log("! data-ornek/zirveler.json yok, taşınacak bir şey de yok.");
  process.exit(0);
}

const zirveler = JSON.parse(readFileSync(kaynak, "utf8"));
if (!Array.isArray(zirveler) || zirveler.length === 0) {
  console.log("! data-ornek/zirveler.json boş.");
  process.exit(0);
}

const sql = postgres(baglantiYolu, { max: 1 });

try {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM "Page" WHERE section = 'zirve'`;
  if (n > 0) {
    console.log(`! "Page" tablosunda zaten ${n} zirve kaydı var; göç atlandı.`);
    console.log('  Bilerek yeniden taşıyorsan önce boşalt: DELETE FROM "Page" WHERE section = \'zirve\';');
    process.exit(1);
  }

  // Dosyadaki sıra yeniden eskiye; menüde ve panelde de o sırayla duruyor.
  await sql.begin((tx) =>
    zirveler.map((zirve, sira) => tx`
      INSERT INTO "Page" (
        id, section, slug, title, summary, eyebrow, "linkUrl", blocks, status,
        "order", "publishedAt", "updatedAt"
      ) VALUES (
        ${randomUUID()}, 'zirve', ${zirve.slug}, ${zirve.ad}, ${zirve.ozet ?? ""},
        ${zirve.tarihYer ?? ""}, ${zirve.yol ?? ""},
        ${sql.json({
          yil: zirve.yil ?? "",
          metin: zirve.metin ?? "",
          vurgular: zirve.vurgular ?? [],
          bolumler: zirve.bolumler ?? [],
          gorseller: zirve.gorseller ?? [],
          video: zirve.video ?? null,
        })},
        'PUBLISHED', ${sira}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `),
  );

  console.log(`${zirveler.length} zirve taşındı → "Page" (section = 'zirve')`);
  for (const zirve of zirveler) {
    const govde = `${(zirve.bolumler ?? []).length} bölüm, ${(zirve.gorseller ?? []).length} kare`;
    console.log(`  ${String(zirve.yol).padEnd(26)} ${zirve.ad} (${zirve.yil}) · ${govde}`);
  }
} finally {
  await sql.end();
}
