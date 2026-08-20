// Veritabanı gerçekten sorgu alıyor mu, onu söyler. Başlatma betiği bunu
// kullanır; çıkış kodu 0 ise hazır, 1 ise değil.
//
//   node scripts/veritabani-hazir.mjs
//
// "Port dinleniyor mu" diye bakmak YETMİYOR (21 Ağustos 2026): prisma dev
// sunucusu yarı ölü kalabiliyor — 51218'i dinlemeye devam ediyor ama gelen her
// bağlantıyı sıfırlıyor. O durumda /yonetim, lib/db.ts'teki oturum sorgusunda
// "read ECONNRESET" ile 500 dönüyordu. Bu yüzden burada gerçek bir sorgu var.

import { existsSync } from "node:fs";
import postgres from "postgres";

if (existsSync(".env")) process.loadEnvFile(".env");

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil.");
  process.exit(1);
}

// max:1 — havuz açmanın anlamı yok. connect_timeout, sunucu hiç yanıt vermezse
// betiğin takılı kalmaması için.
const sql = postgres(baglantiYolu, { max: 1, connect_timeout: 8, idle_timeout: 1, onnotice: () => {} });

try {
  await sql`SELECT 1`;
  process.exit(0);
} catch (hata) {
  console.error(hata?.message ?? hata);
  process.exit(1);
} finally {
  await sql.end({ timeout: 1 }).catch(() => {});
}
