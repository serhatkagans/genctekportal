/**
 * TEK BİR HESABIN PAROLASINI DEĞİŞTİRİR.
 *
 * Neden var: "Parolamı unuttum" akışı çalışmıyor — sayfa duruyor ama arkasında
 * bir uç yok ve `SMTP_URL` boş olduğu için sıfırlama bağlantısı gönderilemiyor
 * (YAPILACAKLAR.md §3). Parolasını unutan yöneticinin tek çıkışı `npm run
 * db:seed` idi; o betik ise il, faaliyet ve katılımcı verisini de tohumluyor,
 * yani CANLIDA ÇALIŞTIRILAMAZ. Bu betik yalnızca tek satıra dokunuyor.
 *
 *     PAROLA="en az 12 karakter" node scripts/parola-degistir.mjs yonetici@genctek.local
 *
 * Parola argüman olarak DEĞİL ortam değişkeniyle veriliyor: argümanlar sunucuda
 * `ps` çıktısında ve kabuk geçmişinde görünür.
 *
 * Parola verilmezse rastgele üretilir ve ekrana bir kez yazılır — unutulan
 * parolayı geri getirmenin yolu yok, yenisini vermek zorundayız zaten.
 *
 * OTURUMLAR DA İPTAL EDİLİR. Oturum doğrulaması parolaya değil kaydın
 * `revokedAt` alanına bakıyor (lib/auth/oturum.ts); iptal edilmezse elinde eski
 * çerez olan biri, parola artık onun bilmediği bir değer olmasına rağmen
 * panelde gezmeye devam ederdi. Aynı gerekçe scripts/seed-veritabani.mjs,
 * scripts/test-hesaplari.mjs ve lib/yonetim/kullanici.ts · oturumlariKapat
 * içinde de yazılı.
 *
 * DENETİM KAYDINA SATIR BIRAKIR. Panel dışından yapılan bir parola değişikliği
 * denetim kaydında görünmezse, "bu hesaba ne oldu" sorusunun cevabı hiçbir
 * yerde durmaz. `actorId` boş: betiği çalıştıran kişi bir oturum taşımıyor.
 */

import { existsSync } from "node:fs";
import { randomUUID, randomBytes } from "node:crypto";
import argon2 from "argon2";
import postgres from "postgres";

// Diğer betiklerle aynı desen: .env varsa Node kendisi okur, ayrı bir paket yok.
if (existsSync(".env")) process.loadEnvFile(".env");

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

const eposta = (process.argv[2] ?? "").trim().toLowerCase();
if (!eposta || eposta.startsWith("-")) {
  console.error(
    'Kullanım: PAROLA="..." node scripts/parola-degistir.mjs <e-posta>\n' +
      "PAROLA verilmezse rastgele üretilir ve bir kez ekrana yazılır.",
  );
  process.exit(1);
}

/* Parola kuralı lib/security/password.ts ile aynı. Betik de aynı sınırı
   uyguluyor ki buradan, panelin kabul etmeyeceği bir parola konmasın. */
function parolayiDogrula(deger) {
  if (deger.length < 12) return "Parola en az 12 karakter olmalıdır.";
  if (deger.length > 128) return "Parola en fazla 128 karakter olabilir.";
  return null;
}

// Üretilen parola panelde de yazılabilsin diye karışması kolay karakterler yok.
function parolaUret() {
  const abece = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(randomBytes(20), (b) => abece[b % abece.length]).join("");
}

const verilen = process.env.PAROLA ?? "";
const parola = verilen || parolaUret();
if (verilen) {
  const hata = parolayiDogrula(parola);
  if (hata) {
    console.error(hata);
    process.exit(1);
  }
}

const sql = postgres(baglantiYolu, { max: 2, idle_timeout: 5 });

try {
  // Argon2 parametreleri lib/security/password.ts ile birebir aynı olmalı;
  // farklı olsaydı üretilen özet doğrulanabilir olurdu ama maliyeti tutmazdı.
  const parolaOzeti = await argon2.hash(parola, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 3,
    parallelism: 1,
  });

  /* Hesap yoksa YENİSİ AÇILMAZ. Bu betik bir kurtarma aracı; yazım hatası olan
     bir adrese sessizce hesap açmak, sonradan "neden iki yönetici var"
     sorusunu doğururdu. Yeni hesap panelden açılır. */
  const [kullanici] = await sql`
    UPDATE "User" SET
      "passwordHash" = ${parolaOzeti},
      "passwordChangedAt" = CURRENT_TIMESTAMP,
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE lower(email) = ${eposta}
    RETURNING id, email, name, status
  `;

  if (!kullanici) {
    console.error(`Böyle bir hesap yok: ${eposta}`);
    const hepsi = await sql`SELECT email FROM "User" ORDER BY email`;
    if (hepsi.length) console.error(`Kayıtlı adresler: ${hepsi.map((k) => k.email).join(", ")}`);
    process.exit(1);
  }

  const oturumlar = await sql`
    UPDATE "Session" SET "revokedAt" = CURRENT_TIMESTAMP
    WHERE "userId" = ${kullanici.id} AND "revokedAt" IS NULL
    RETURNING id
  `;

  await sql`
    INSERT INTO "AuditLog" (id, "actorId", action, "targetType", "targetId", metadata, "createdAt")
    VALUES (${randomUUID()}, NULL, 'PAROLA_DEGISTIRILDI', 'User', ${kullanici.id},
            ${sql.json({ kaynak: "scripts/parola-degistir.mjs", iptalEdilenOturum: oturumlar.length })},
            CURRENT_TIMESTAMP)
  `;

  console.log("");
  console.log(`Hesap             : ${kullanici.email}${kullanici.name ? ` (${kullanici.name})` : ""}`);
  console.log(`Durum             : ${kullanici.status}`);
  console.log(`İptal edilen oturum: ${oturumlar.length}`);
  if (!verilen) {
    console.log("");
    console.log(`Yeni parola       : ${parola}`);
    console.log("Bu parola bir daha gösterilmeyecek; giriş yaptıktan sonra değiştirin.");
  } else {
    console.log("");
    console.log("Parola güncellendi (verdiğiniz değerle).");
  }
  /* Pasif hesabın parolasını değiştirmek işe yaramaz: giriş yine reddedilir.
     Sessizce "tamam" demek, kişinin dakikalarca yanlış yerde aramasına yol
     açardı. */
  if (kullanici.status !== "ACTIVE") {
    console.log("");
    console.log(`UYARI: hesabın durumu ${kullanici.status}. Giriş yapabilmesi için panelden etkinleştirilmeli.`);
  }
  console.log("");
} finally {
  await sql.end();
}
