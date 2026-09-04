// data-ornek/hakkinda.json → "Page" tablosu (section = 'hakkinda').
//
// Hakkında kartları ve üç sayfanın gövdesi 4 Eylül 2026'ya kadar kodun içinde
// yazılıydı: kartlar lib/hakkinda.ts'te bir dizi, sayfalar da app/hakkinda
// altında birer JSX dosyasıydı. Bu betik o içeriği tabloya taşıyor; sonrasında
// hepsi panelden düzenleniyor (Yönetim → Hakkında sayfaları).
//
// Bir kereliktir: bölümde kayıt varsa hiçbir şey yapmaz, çünkü ikinci
// çalıştırma panelden yapılmış düzenlemeleri dosyadaki ilk hâle döndürürdü.
// Dosya elde kalıyor — hem geri dönüş için hem de veritabanı bağlantısı
// koptuğunda lib/hakkinda.ts'in düştüğü yedek olarak.
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
const kaynak = resolve(kok, "data-ornek/hakkinda.json");

if (!existsSync(kaynak)) {
  console.log("! data-ornek/hakkinda.json yok, taşınacak bir şey de yok.");
  process.exit(0);
}

const sayfalar = JSON.parse(readFileSync(kaynak, "utf8"));
if (!Array.isArray(sayfalar) || sayfalar.length === 0) {
  console.log("! data-ornek/hakkinda.json boş.");
  process.exit(0);
}

const sql = postgres(baglantiYolu, { max: 1 });

try {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM "Page" WHERE section = 'hakkinda'`;
  if (n > 0) {
    console.log(`! "Page" tablosunda zaten ${n} Hakkında kaydı var; göç atlandı.`);
    console.log('  Bilerek yeniden taşıyorsan önce boşalt: DELETE FROM "Page" WHERE section = \'hakkinda\';');
    process.exit(1);
  }

  // Dosyadaki dizi sırası anlamlı: ana sayfadaki kartların soldan sağa sırası
  // ve kart numaraları (01, 02, …) buradan geliyor.
  await sql.begin((tx) =>
    sayfalar.map((sayfa, sira) => tx`
      INSERT INTO "Page" (
        id, section, slug, title, "pageTitle", summary, "iconName", "linkUrl",
        eyebrow, lede, layout, "seoTitle", "seoDescription", blocks, status,
        "order", "publishedAt", "updatedAt"
      ) VALUES (
        ${randomUUID()}, 'hakkinda', ${sayfa.slug}, ${sayfa.baslik}, ${sayfa.sayfaBasligi ?? ""},
        ${sayfa.ozet ?? ""}, ${sayfa.ikon ?? "badge"}, ${sayfa.adres ?? ""},
        ${sayfa.ustEtiket ?? ""}, ${sayfa.spot ?? ""}, ${sayfa.duzen ?? "tek"},
        ${sayfa.seoBaslik || null}, ${sayfa.seoAciklama || null},
        ${sql.json(sayfa.bloklar ?? [])}, 'PUBLISHED',
        ${sira}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `),
  );

  console.log(`${sayfalar.length} Hakkında başlığı taşındı → "Page" (section = 'hakkinda')`);
  for (const sayfa of sayfalar) {
    const nerede = sayfa.adres ? `bağlantı → ${sayfa.adres}` : `${(sayfa.bloklar ?? []).length} blok`;
    console.log(`  ${sayfa.slug.padEnd(22)} ${nerede}`);
  }
} finally {
  await sql.end();
}
