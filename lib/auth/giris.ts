import { createHash } from "node:crypto";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/security/password";
import { ABSOLUTE_MS, IDLE_MS, createSessionMaterial } from "@/lib/security/session";

// Kilitleme: art arda hatalı denemede hesap geçici olarak kapanır. Sayaç
// veritabanında tutuluyor ki sunucu yeniden başlayınca sıfırlanmasın.
const KILIT_ESIGI = 5;
const KILIT_SURESI_DK = 15;

type KullaniciSatiri = {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  status: "INVITED" | "ACTIVE" | "LOCKED" | "DISABLED";
  failedLoginCount: number;
  lockedUntil: Date | null;
  mfaEnabled: boolean;
};

export type GirisSonucu =
  | { tamam: true; jeton: string; kullaniciId: string }
  | { tamam: false; hata: string };

// Kullanıcı bulunamasa bile aynı mesaj döner: e-posta sayımını engeller.
const GENEL_HATA = "E-posta veya parola hatalı.";

export async function girisYap(girdi: {
  eposta: string;
  parola: string;
  userAgent?: string | null;
  ipOzeti?: string | null;
}): Promise<GirisSonucu> {
  const eposta = girdi.eposta.trim().toLocaleLowerCase("tr-TR");
  if (!eposta || !girdi.parola) return { tamam: false, hata: GENEL_HATA };

  const [kullanici] = await sql<KullaniciSatiri[]>`
    SELECT id, email, name, "passwordHash", status::text AS status,
           "failedLoginCount", "lockedUntil", "mfaEnabled"
    FROM "User" WHERE lower(email) = ${eposta} LIMIT 1
  `;

  if (!kullanici || !kullanici.passwordHash) {
    await olayYaz(null, eposta, "LOGIN_FAILURE", "BILINMEYEN_HESAP", girdi);
    return { tamam: false, hata: GENEL_HATA };
  }

  if (kullanici.lockedUntil && kullanici.lockedUntil > new Date()) {
    await olayYaz(kullanici.id, eposta, "LOGIN_FAILURE", "KILITLI", girdi);
    return { tamam: false, hata: `Hesap geçici olarak kilitli. ${KILIT_SURESI_DK} dakika sonra tekrar deneyin.` };
  }

  if (kullanici.status !== "ACTIVE") {
    await olayYaz(kullanici.id, eposta, "LOGIN_FAILURE", `DURUM_${kullanici.status}`, girdi);
    return { tamam: false, hata: "Bu hesap etkin değil. Sistem yöneticisiyle görüşün." };
  }

  if (!await verifyPassword(kullanici.passwordHash, girdi.parola)) {
    const yeniSayac = kullanici.failedLoginCount + 1;
    const kilitlensinMi = yeniSayac >= KILIT_ESIGI;
    await sql`
      UPDATE "User" SET
        "failedLoginCount" = ${yeniSayac},
        "lockedUntil" = ${kilitlensinMi ? sql`CURRENT_TIMESTAMP + make_interval(mins => ${KILIT_SURESI_DK})` : sql`NULL`},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${kullanici.id}
    `;
    await olayYaz(kullanici.id, eposta, kilitlensinMi ? "ACCOUNT_LOCKED" : "LOGIN_FAILURE", "PAROLA_HATALI", girdi);
    return {
      tamam: false,
      hata: kilitlensinMi
        ? `Çok fazla hatalı deneme. Hesap ${KILIT_SURESI_DK} dakika kilitlendi.`
        : GENEL_HATA,
    };
  }

  const oturum = createSessionMaterial();
  // Bitiş zamanları SQL'de hesaplanıyor: JS Date parametreleri sürücü tarafından
  // UTC'ye çevrilip naive timestamp sütununa yazılıyor ve saat farkı kadar
  // geçmişe düşüyor — oturum daha doğmadan süresi dolmuş sayılırdı.
  await sql`
    INSERT INTO "Session" (id, "userId", "csrfHash", "userAgent", "ipHash", "idleExpiresAt", "expiresAt")
    VALUES (${oturum.idHash}, ${kullanici.id}, ${oturum.csrfHash},
            ${girdi.userAgent ?? null}, ${girdi.ipOzeti ?? null},
            CURRENT_TIMESTAMP + make_interval(secs => ${IDLE_MS / 1000}),
            CURRENT_TIMESTAMP + make_interval(secs => ${ABSOLUTE_MS / 1000}))
  `;
  await sql`
    UPDATE "User" SET "failedLoginCount" = 0, "lockedUntil" = NULL,
                      "lastLoginAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${kullanici.id}
  `;
  await olayYaz(kullanici.id, eposta, "LOGIN_SUCCESS", "TAMAM", girdi);

  return { tamam: true, jeton: oturum.id, kullaniciId: kullanici.id };
}

export async function cikisYap(jeton: string) {
  const jetonOzeti = createHash("sha256").update(jeton, "utf8").digest("hex");
  const [oturum] = await sql<{ userId: string }[]>`
    UPDATE "Session" SET "revokedAt" = CURRENT_TIMESTAMP
    WHERE id = ${jetonOzeti} AND "revokedAt" IS NULL
    RETURNING "userId"
  `;
  if (oturum) await olayYaz(oturum.userId, null, "LOGOUT", "TAMAM", {});
}

async function olayYaz(
  kullaniciId: string | null,
  eposta: string | null,
  tip: string,
  sonuc: string,
  girdi: { userAgent?: string | null; ipOzeti?: string | null },
) {
  try {
    await sql`
      INSERT INTO "AuthEvent" (id, "userId", email, type, outcome, "ipHash", "userAgent")
      VALUES (gen_random_uuid()::text, ${kullaniciId}, ${eposta}, ${tip}::"AuthEventType",
              ${sonuc}, ${girdi.ipOzeti ?? null}, ${girdi.userAgent ?? null})
    `;
  } catch {
    // Denetim kaydı yazılamazsa giriş akışı durmamalı.
  }
}
