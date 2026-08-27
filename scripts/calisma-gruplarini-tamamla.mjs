// Çalışma grubu (tema) listesini YEĞİTEK'in verdiği 14 başlıkla tamamlar.
// Hiçbir kaydı silmez, hiçbir kaydı güncellemez: yalnızca eksik olanı ekler.
// Tekrar tekrar çalıştırılabilir — ikinci çalıştırmada eklenecek bir şey bulamaz.
//
// Eşleştirme ada göre: veritabanındaki adın sluglaştırılmış hâli ile beklenen
// adınki tutuyorsa o grup "zaten var" sayılır. Slug sütunu değil ad esas alınıyor,
// çünkü mevcut kayıtların slug'ları farklı türetilmiş olabilir ("iha" gibi).
// Bu yüzden çalıştırmadan önce ÖNİZLEME çıktısına bakın: yakın ama birebir
// olmayan adlar (örn. "Dijital Sanatlar" ile "Dijital Sanatlar ve İçerik
// Geliştirme") ayrı kayıt olarak eklenir. İstemiyorsanız --atla ile geçin.
//
// Kullanım:
//   node scripts/calisma-gruplarini-tamamla.mjs              → yalnızca önizleme
//   node scripts/calisma-gruplarini-tamamla.mjs --uygula     → ekler
//   ... --atla="Espor,Açık Kaynak"                           → bu adları hiç ekleme
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import postgres from "postgres";

if (existsSync(".env")) process.loadEnvFile(".env");

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

const CALISMA_GRUPLARI = [
  "Oyun Tasarımı",
  "Siber Güvenlik",
  "Robotik",
  "Yapay Zeka",
  "Havacılık Sistemleri",
  "Dijital Sanatlar ve İçerik Geliştirme",
  "Bilişim Hukuku ve Güvenli İnternet",
  "E-Ticaret ve E-İhracat",
  "Web Programlama",
  "Mobil Programlama",
  "Bilgisayar Olimpiyatları",
  "Açık Kaynak",
  "Espor",
  "Eğitim Teknolojileri",
];

// lib/tema.ts içindeki sluglastir ile aynı; iki yerde durması hoş değil ama
// betik lib'i (TypeScript) doğrudan import edemiyor.
function sluglastir(deger) {
  const harita = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u" };
  return deger
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (h) => harita[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const uygula = process.argv.includes("--uygula");
const atlaArgumani = process.argv.find((a) => a.startsWith("--atla="));
const atlanacak = new Set(
  (atlaArgumani ? atlaArgumani.slice("--atla=".length) : "")
    .split(",")
    .map((a) => sluglastir(a.trim()))
    .filter(Boolean),
);

const sql = postgres(baglantiYolu, { max: 1 });

try {
  const mevcut = await sql`SELECT slug, name FROM "Theme" ORDER BY "order", "createdAt"`;
  const mevcutAnahtarlar = new Set(mevcut.flatMap((t) => [t.slug, sluglastir(t.name)]));

  console.log(`Veritabanında ${mevcut.length} çalışma grubu var:`);
  for (const t of mevcut) console.log(`  · ${t.name}  (${t.slug})`);
  console.log("");

  const eklenecek = [];
  for (const ad of CALISMA_GRUPLARI) {
    const anahtar = sluglastir(ad);
    if (atlanacak.has(anahtar)) {
      console.log(`  ~ ${ad} — --atla ile geçildi`);
    } else if (mevcutAnahtarlar.has(anahtar)) {
      console.log(`  = ${ad} — zaten var`);
    } else {
      console.log(`  + ${ad} — EKLENECEK`);
      eklenecek.push({ ad, slug: anahtar });
    }
  }

  if (eklenecek.length === 0) {
    console.log("\nEklenecek çalışma grubu yok.");
  } else if (!uygula) {
    console.log(`\nÖnizleme. ${eklenecek.length} grup eklenecek; yazmak için --uygula ekleyin.`);
  } else {
    // Yeni kayıtlar listenin sonuna, mevcut sıralamayı bozmadan ekleniyor.
    // Açıklama, görsel, odak ve çıktılar boş: panelden doldurulacak.
    const [{ son }] = await sql`SELECT COALESCE(MAX("order"), -1) AS son FROM "Theme"`;
    await sql.begin((tx) =>
      eklenecek.map((grup, sira) => tx`
        INSERT INTO "Theme" (id, slug, name, summary, description, image, focus, outcomes, "order", "updatedAt")
        VALUES (
          ${randomUUID()}, ${grup.slug}, ${grup.ad}, '',
          ${sql.json("")}, '', ${[]}, ${[]},
          ${Number(son) + 1 + sira}, CURRENT_TIMESTAMP
        )
      `),
    );
    console.log(`\n${eklenecek.length} çalışma grubu eklendi. Açıklama ve görselleri panelden doldurun.`);
  }
} finally {
  await sql.end();
}
