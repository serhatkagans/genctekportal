// data/koordinatorler.json → "Coordinator" tablosu. Bir kereliktir; tablo doluysa
// hiçbir şey yapmaz, çünkü ikinci çalıştırma panelden yapılan düzenlemeleri
// dosyadaki eski hâle döndürürdü. Göç sonrası dosya elde kalıyor.
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
const kaynak = resolve(kok, "data/koordinatorler.json");

if (!existsSync(kaynak)) {
  console.log("! data/koordinatorler.json yok, taşınacak bir şey de yok.");
  process.exit(0);
}

const koordinatorler = JSON.parse(readFileSync(kaynak, "utf8"));
if (!Array.isArray(koordinatorler) || koordinatorler.length === 0) {
  console.log("! data/koordinatorler.json boş.");
  process.exit(0);
}

// lib/koordinator.ts'teki ROL_ETIKETI'nin tersi. Boş rol NULL kalıyor.
const ROL_KODU = {
  "İl Koordinatörü": "PROVINCE_COORDINATOR",
  "İl Yöneticisi": "PROVINCE_MANAGER",
  "Yeğitek İl Yöneticisi": "YEGITEK_PROVINCE_MANAGER",
  "Komisyon Üyesi": "COMMISSION_MEMBER",
};

/* Dosyadaki il adları "Province" tablosuyla birebir tutmuyor: TOKAT ve İSTANBUL
   büyük harfle, Hakkari şapkasız yazılmış. Bunlar normalleştirmeyle çözülüyor.
   ARTIN İSE GERÇEK BİR YAZIM HATASI (doğrusu Artvin) ve normalleştirmeyle
   bulunamaz; tabloya geçerken düzeltiliyor, sitede de düzelmiş olacak. */
const YAZIM_DUZELTMESI = { artin: "artvin" };

function normalize(deger) {
  return deger
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[âÂ]/g, "a")
    .replace(/[îÎ]/g, "i")
    .replace(/[ûÛ]/g, "u");
}

const sql = postgres(baglantiYolu, { max: 1 });

try {
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM "Coordinator"`;
  if (n > 0) {
    console.log(`! "Coordinator" tablosunda zaten ${n} kayıt var; göç atlandı.`);
    console.log('  Bilerek yeniden taşıyorsan önce tabloyu boşalt: DELETE FROM "Coordinator";');
    process.exit(1);
  }

  const iller = await sql`SELECT code, name FROM "Province"`;
  const ilKodu = new Map(iller.map((il) => [normalize(il.name), il.code]));

  // Önce hepsi çözülebiliyor mu diye bak: yarısı yazılmış bir göç bırakma.
  const cozulmeyen = [];
  const duzeltilen = new Set();
  for (const k of koordinatorler) {
    let anahtar = normalize(k.il ?? "");
    if (YAZIM_DUZELTMESI[anahtar]) {
      duzeltilen.add(`${k.il} → ${YAZIM_DUZELTMESI[anahtar]}`);
      anahtar = YAZIM_DUZELTMESI[anahtar];
    }
    if (!ilKodu.has(anahtar)) cozulmeyen.push(`${k.ad} (il: "${k.il}")`);
    k._kod = ilKodu.get(anahtar);
  }

  if (cozulmeyen.length) {
    console.error(`! ${cozulmeyen.length} kaydın ili "Province" tablosunda bulunamadı; hiçbiri taşınmadı:`);
    for (const satir of cozulmeyen) console.error(`    ${satir}`);
    process.exit(1);
  }

  const rolsuz = koordinatorler.filter((k) => !ROL_KODU[(k.rol ?? "").trim()]).length;

  await sql.begin((tx) =>
    koordinatorler.map((k, sira) => tx`
      INSERT INTO "Coordinator" (id, name, "provinceCode", role, photo, "order", "createdAt", "updatedAt")
      VALUES (
        ${k.id || randomUUID()}, ${k.ad}, ${k._kod},
        ${ROL_KODU[(k.rol ?? "").trim()] ?? null}::"CoordinatorRole",
        ${k.gorsel ?? ""}, ${typeof k.sira === "number" ? k.sira : sira},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `),
  );

  console.log(`${koordinatorler.length} koordinatör "Coordinator" tablosuna taşındı.`);
  if (duzeltilen.size) console.log(`  yazım düzeltmesi: ${[...duzeltilen].join(", ")}`);
  if (rolsuz) console.log(`  ${rolsuz} kaydın rolü dosyada boştu, tabloda NULL yazıldı.`);
} finally {
  await sql.end();
}
