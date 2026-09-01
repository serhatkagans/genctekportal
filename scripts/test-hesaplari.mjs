/**
 * GÜVENLİK TESTİ HESAPLARI — açma ve kapatma.
 *
 * Sızma testini yürütecek ekibe her rolden birer hesap gerekiyor (bkz. sandbox
 * altındaki bilgilendirme notu, bölüm 2). Panelde kendi kendine kayıt yok ve
 * SMTP tanımlı olmadığı için davet akışı da yok; hesaplar buradan açılıyor.
 *
 * PAROLALAR BU DOSYADA YAZMAZ. Betik onları ortam değişkeninden okur:
 *
 *     TEST_HESAP_PAROLALARI="admin=...,icerik=...,editor=...,yayin=...,form=...,denetim=..."
 *     node scripts/test-hesaplari.mjs
 *
 * Depoya parola girmemesinin sebebi, notun kendisinde de yazılı olan kural:
 * belge yalnız test ekibiyle paylaşılır, depo ise paylaşılmaz. İkisi ayrı
 * kanaldır ve parolanın yaşadığı yer belgedir, kod değildir.
 *
 * TEST BİTİNCE:
 *
 *     node scripts/test-hesaplari.mjs --kapat
 *
 * Hesaplar SİLİNMEZ, pasife alınır ve açık oturumları iptal edilir. Silmek,
 * denetim kayıtlarındaki "kim yaptı" bağlantısını koparırdı — testte yapılan
 * işlemlerin izi, testten sonra da okunabilir kalmalı.
 */

import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import postgres from "postgres";

// Diğer betiklerle aynı desen: .env varsa Node kendisi okur, ayrı bir paket yok.
if (existsSync(".env")) process.loadEnvFile(".env");

const HESAPLAR = [
  { anahtar: "admin", eposta: "guvenlik-admin@genctek.local", ad: "Güvenlik Testi · Sistem Yöneticisi", rol: "SYSTEM_ADMIN" },
  { anahtar: "icerik", eposta: "guvenlik-icerik@genctek.local", ad: "Güvenlik Testi · İçerik Yöneticisi", rol: "CONTENT_MANAGER" },
  { anahtar: "editor", eposta: "guvenlik-editor@genctek.local", ad: "Güvenlik Testi · Editör", rol: "EDITOR" },
  { anahtar: "yayin", eposta: "guvenlik-yayin@genctek.local", ad: "Güvenlik Testi · Yayımcı", rol: "PUBLISHER" },
  { anahtar: "form", eposta: "guvenlik-form@genctek.local", ad: "Güvenlik Testi · Form İnceleyici", rol: "FORM_REVIEWER" },
  { anahtar: "denetim", eposta: "guvenlik-denetim@genctek.local", ad: "Güvenlik Testi · Denetçi", rol: "AUDITOR" },
];

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

const sql = postgres(baglantiYolu, { max: 4, idle_timeout: 5 });

function parolalariOku() {
  const ham = process.env.TEST_HESAP_PAROLALARI ?? "";
  if (!ham.trim()) {
    console.error(
      "TEST_HESAP_PAROLALARI tanımlı değil.\n" +
        'Örnek: TEST_HESAP_PAROLALARI="admin=...,icerik=...,editor=...,yayin=...,form=...,denetim=..."',
    );
    process.exit(1);
  }
  const harita = new Map();
  for (const parca of ham.split(",")) {
    const [anahtar, ...deger] = parca.split("=");
    harita.set(anahtar.trim(), deger.join("=").trim());
  }
  const eksik = HESAPLAR.filter((h) => !harita.get(h.anahtar));
  if (eksik.length) {
    console.error(`Şu hesapların parolası verilmemiş: ${eksik.map((h) => h.anahtar).join(", ")}`);
    process.exit(1);
  }
  // Parola kuralı lib/security/password.ts ile aynı; betik de aynı sınırı uygular
  // ki panelden değiştirilemeyecek bir parola burada yazılmasın.
  const kisa = HESAPLAR.filter((h) => harita.get(h.anahtar).length < 12);
  if (kisa.length) {
    console.error(`En az 12 karakter olmalı: ${kisa.map((h) => h.anahtar).join(", ")}`);
    process.exit(1);
  }
  return harita;
}

async function ac() {
  const parolalar = parolalariOku();

  for (const hesap of HESAPLAR) {
    const ozet = await argon2.hash(parolalar.get(hesap.anahtar), {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 3,
      parallelism: 1,
    });

    const [kullanici] = await sql`
      INSERT INTO "User" (id, email, name, "passwordHash", status, "provinceCode",
                          "passwordChangedAt", "updatedAt")
      VALUES (${randomUUID()}, ${hesap.eposta}, ${hesap.ad}, ${ozet}, 'ACTIVE', NULL,
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE
        SET "passwordHash" = EXCLUDED."passwordHash",
            name = EXCLUDED.name,
            status = 'ACTIVE',
            "failedLoginCount" = 0,
            "lockedUntil" = NULL,
            "updatedAt" = CURRENT_TIMESTAMP
      RETURNING id
    `;

    /*
     * ROL TEK: hesabın adı hangi rolü test ettiğini söylüyor; ikinci bir rol
     * eklemek, "bu ekranı hangi yetkiyle gördüm" sorusunu belirsizleştirirdi.
     * Önceki çalıştırmadan kalan başka roller temizleniyor.
     */
    await sql`DELETE FROM "UserRole" WHERE "userId" = ${kullanici.id} AND role <> ${hesap.rol}::"RoleCode"`;
    await sql`
      INSERT INTO "UserRole" (id, "userId", role)
      VALUES (${randomUUID()}, ${kullanici.id}, ${hesap.rol}::"RoleCode")
      ON CONFLICT ("userId", role) DO NOTHING
    `;

    console.log(`açıldı  ${hesap.eposta.padEnd(32)} ${hesap.rol}`);
  }

  console.log(`\n${HESAPLAR.length} hesap hazır. Test bitince: node scripts/test-hesaplari.mjs --kapat`);
}

async function kapat() {
  const epostalar = HESAPLAR.map((h) => h.eposta);

  const kullanicilar = await sql`
    SELECT id, email FROM "User" WHERE email IN ${sql(epostalar)}
  `;
  if (!kullanicilar.length) {
    console.log("Kapatılacak test hesabı bulunamadı.");
    return;
  }

  const kimlikler = kullanicilar.map((k) => k.id);
  // Önce oturumlar: hesap pasife alınsa da elindeki çerezle gezen bir oturum
  // kalmasın.
  const oturum = await sql`
    UPDATE "Session" SET "revokedAt" = CURRENT_TIMESTAMP
    WHERE "userId" IN ${sql(kimlikler)} AND "revokedAt" IS NULL
  `;
  await sql`
    UPDATE "User" SET status = 'DISABLED', "updatedAt" = CURRENT_TIMESTAMP
    WHERE id IN ${sql(kimlikler)}
  `;

  for (const k of kullanicilar) console.log(`kapatıldı  ${k.email}`);
  console.log(`\n${kullanicilar.length} hesap pasife alındı, ${oturum.count} oturum iptal edildi.`);
}

const kapatmaMi = process.argv.includes("--kapat");
try {
  await (kapatmaMi ? kapat() : ac());
} finally {
  await sql.end();
}
