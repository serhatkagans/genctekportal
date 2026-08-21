// data/temalar.json → "Theme" tablosu. Bir kereliktir; tablo doluysa hiçbir şey
// yapmaz, çünkü ikinci çalıştırma panelden yapılan düzenlemeleri dosyadaki eski
// hâle döndürürdü. Göç sonrası dosya elde kalıyor, geri dönüş gerekirse diye.
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
const kaynak = resolve(kok, "data/temalar.json");

if (!existsSync(kaynak)) {
  console.log("! data/temalar.json yok, taşınacak bir şey de yok.");
  process.exit(0);
}

const temalar = JSON.parse(readFileSync(kaynak, "utf8"));
if (!Array.isArray(temalar) || temalar.length === 0) {
  console.log("! data/temalar.json boş.");
  process.exit(0);
}

const sql = postgres(baglantiYolu, { max: 1 });

try {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM "Theme"`;
  if (n > 0) {
    console.log(`! "Theme" tablosunda zaten ${n} kayıt var; göç atlandı.`);
    console.log('  Bilerek yeniden taşıyorsan önce tabloyu boşalt: DELETE FROM "Theme";');
    process.exit(1);
  }

  // Dosyadaki dizi sırası anlamlıydı (sitede o sırayla listeleniyordu); "order"
  // sütununa yazılıyor ki tabloya geçince de korunsun.
  await sql.begin((tx) =>
    temalar.map((tema, sira) => tx`
      INSERT INTO "Theme" (id, slug, name, summary, description, image, focus, outcomes, "order", "updatedAt")
      VALUES (
        ${randomUUID()}, ${tema.slug}, ${tema.name}, ${tema.shortDescription ?? ""},
        ${sql.json(tema.description ?? "")}, ${tema.image ?? ""},
        ${tema.focus ?? []}, ${tema.outcomes ?? []},
        ${sira}, CURRENT_TIMESTAMP
      )
    `),
  );

  console.log(`${temalar.length} tema taşındı → "Theme"`);
  console.log(`  ilk : ${temalar[0].name}`);
  console.log(`  son : ${temalar[temalar.length - 1].name}`);
} finally {
  await sql.end();
}
