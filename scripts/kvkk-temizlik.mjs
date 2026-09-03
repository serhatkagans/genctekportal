// Saklama süresi dolan başvuruları siler (KVKK, YAPILACAKLAR.md §4).
//
//   node scripts/kvkk-temizlik.mjs           -> yalnızca rapor, hiçbir şey silmez
//   node scripts/kvkk-temizlik.mjs --uygula  -> siler
//
// Varsayılan kuru çalıştırma: bu betik geri alınamaz veri siliyor, zamanlanmış
// göreve bağlanmadan önce çıktısının gözle görülmesi gerek. systemd timer
// --uygula ile çağırır (DAGITIM.md).
//
// Silinen: başvuru kaydı, notları, ek kayıtları (cascade), eklerin Media
// satırları ve diskteki dosyaları. Denetim günlüğüne referans numarası kalır —
// referans tek başına kişisel veri değil, silmenin yapıldığının kanıtı.

import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import postgres from "postgres";

if (existsSync(".env")) process.loadEnvFile(".env");

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

const uygula = process.argv.includes("--uygula");
const EK_KLASORU = path.join(process.cwd(), "veri", "basvuru-ekleri");
const sql = postgres(baglantiYolu, { max: 2 });

// Depo anahtarı veritabanından geliyor; lib/forms/basvuru.ts'teki ekDosyaYolu
// ile aynı sınır burada da geçerli — klasör dışına çıkan bir anahtar silinmez.
function ekDosyaYolu(depoAnahtari) {
  const hedef = path.resolve(EK_KLASORU, depoAnahtari);
  if (!hedef.startsWith(path.resolve(EK_KLASORU) + path.sep)) return null;
  return hedef;
}

async function calistir() {
  const suresiDolanlar = await sql`
    SELECT id, reference, "retentionUntil"
    FROM "Submission"
    WHERE "retentionUntil" <= CURRENT_TIMESTAMP
    ORDER BY "retentionUntil"
  `;

  if (suresiDolanlar.length === 0) {
    console.log("Saklama süresi dolan başvuru yok.");
    return;
  }

  console.log(`${suresiDolanlar.length} başvurunun saklama süresi dolmuş.`);
  let silinen = 0;
  let silinenDosya = 0;

  for (const basvuru of suresiDolanlar) {
    const ekler = await sql`
      SELECT a.id AS "ekId", m.id AS "medyaId", m."storageKey"
      FROM "SubmissionAttachment" a
      JOIN "Media" m ON m.id = a."mediaId"
      WHERE a."submissionId" = ${basvuru.id}
    `;
    const tarih = basvuru.retentionUntil.toISOString().slice(0, 10);
    console.log(`  ${basvuru.reference} (bitiş ${tarih}, ${ekler.length} ek)`);
    if (!uygula) continue;

    // Sıra önemli: Media -> SubmissionAttachment yönündeki kısıt Restrict, yani
    // medya satırı ancak ek kaydı gittikten sonra silinebiliyor. Başvurunun
    // silinmesi ekleri ve notları cascade ile götürür.
    await sql`DELETE FROM "Submission" WHERE id = ${basvuru.id}`;
    for (const ek of ekler) {
      await sql`DELETE FROM "Media" WHERE id = ${ek.medyaId}`;
    }

    // Dosyalar veritabanından sonra: yazma başarısız olursa kayıt duruyor ve
    // sonraki çalıştırma aynı işi tekrar dener. Ters sırada dosya gidip kayıt
    // kalsaydı ekran bozuk bir eke bağlanırdı.
    const klasor = ekDosyaYolu(basvuru.id);
    if (klasor) {
      await rm(klasor, { recursive: true, force: true });
      silinenDosya += ekler.length;
    }

    await sql`
      INSERT INTO "AuditLog" (id, "actorId", action, "targetType", "targetId", metadata, "createdAt")
      VALUES (${randomUUID()}, NULL, 'KVKK_SAKLAMA_SILME', 'Submission', ${basvuru.id},
              ${sql.json({ referans: basvuru.reference, saklamaBitisi: tarih, ekSayisi: ekler.length })},
              CURRENT_TIMESTAMP)
    `;
    silinen += 1;
  }

  if (uygula) {
    console.log(`Silindi: ${silinen} başvuru, ${silinenDosya} ek dosyası.`);
  } else {
    console.log("Kuru çalıştırma — hiçbir şey silinmedi. Silmek için: --uygula");
  }
}

try {
  await calistir();
} finally {
  await sql.end();
}
