import { sql } from "@/lib/db";

export type HizSiniriSecenekleri = { limit: number; windowMs: number };
const VARSAYILAN: HizSiniriSecenekleri = { limit: 5, windowMs: 15 * 60_000 };

export type Durum = { count: number; resetAt: number; blockedUntil: number };

/* Sayacın tek kuralı burada; hem süreç içi hem veritabanı katmanı bunu çağırır
   ki iki yerde iki ayrı davranış oluşmasın. Engelliyken sayaç artmaz: ceza
   süresi boyunca gelen istekler cezayı uzatmasın. */
export function sonrakiDurum(mevcut: Durum | undefined, { limit, windowMs }: HizSiniriSecenekleri, simdi: number): Durum {
  if (mevcut && mevcut.blockedUntil > simdi) return mevcut;

  const temel = !mevcut || mevcut.resetAt <= simdi
    ? { count: 0, resetAt: simdi + windowMs, blockedUntil: 0 }
    : mevcut;
  const count = temel.count + 1;
  const blockedUntil = count > limit
    ? simdi + Math.min(windowMs * 4, windowMs * (count - limit))
    : temel.blockedUntil;

  return { count, resetAt: temel.resetAt, blockedUntil };
}

function sonuc(durum: Durum, { limit }: HizSiniriSecenekleri, simdi: number) {
  return {
    allowed: durum.blockedUntil <= simdi,
    remaining: Math.max(0, limit - durum.count),
    retryAfterMs: Math.max(0, durum.blockedUntil - simdi),
  };
}

/* Süreç içi katman. Veritabanı erişilemezse tek koruma bu kalır; bu yüzden
   paylaşımlı sayaç çalışsa bile beslenmeye devam eder. */
const kovalar = new Map<string, Durum>();

function yerelKontrol(key: string, secenekler: HizSiniriSecenekleri, simdi: number) {
  const durum = sonrakiDurum(kovalar.get(key), secenekler, simdi);
  kovalar.set(key, durum);
  return sonuc(durum, secenekler, simdi);
}

/* Paylaşımlı katman. Satır kilidi altında okunup yazılır: iki süreç aynı anda
   aynı anahtarı denediğinde ikisi de aynı sayacı görsün, sayım kaybolmasın. */
async function paylasimliKontrol(key: string, secenekler: HizSiniriSecenekleri, simdi: number) {
  return sql.begin(async (tx) => {
    const [kayit] = await tx<{ count: number; resetAt: Date; blockedUntil: Date | null }[]>`
      SELECT "count", "resetAt", "blockedUntil" FROM "RateLimit" WHERE "key" = ${key} FOR UPDATE
    `;
    const mevcut: Durum | undefined = kayit
      ? {
          count: kayit.count,
          resetAt: kayit.resetAt.getTime(),
          blockedUntil: kayit.blockedUntil?.getTime() ?? 0,
        }
      : undefined;

    const durum = sonrakiDurum(mevcut, secenekler, simdi);
    if (durum !== mevcut) {
      await tx`
        INSERT INTO "RateLimit" ("key", "count", "resetAt", "blockedUntil")
        VALUES (${key}, ${durum.count}, ${new Date(durum.resetAt)},
                ${durum.blockedUntil ? new Date(durum.blockedUntil) : null})
        ON CONFLICT ("key") DO UPDATE
          SET "count" = EXCLUDED."count",
              "resetAt" = EXCLUDED."resetAt",
              "blockedUntil" = EXCLUDED."blockedUntil"
      `;
    }
    return sonuc(durum, secenekler, simdi);
  });
}

/* Süresi dolmuş satırlar birikmesin. Kesinlik gerekmediği için süreç başına
   saatte bir denenir; temizlik başarısız olursa sınır yine doğru çalışır. */
const TEMIZLIK_ARALIGI = 60 * 60_000;
let sonTemizlik = 0;

async function temizle(simdi: number) {
  if (simdi - sonTemizlik < TEMIZLIK_ARALIGI) return;
  sonTemizlik = simdi;
  await sql`
    DELETE FROM "RateLimit"
    WHERE "resetAt" < ${new Date(simdi - 24 * 60 * 60_000)}
      AND ("blockedUntil" IS NULL OR "blockedUntil" < ${new Date(simdi)})
  `;
}

/* Veritabanı yoksa AÇIK kalınır, kapalı değil: sayaç sorgusu düştüğü için
   girişi kilitlemek, veritabanı zaten kapalıyken kimsenin giremeyeceği bir
   anda tek yaptığı hatayı büyütmek olurdu. Süreç içi sınır yürürlükte kalır. */
export async function checkRateLimit(key: string, secenekler: HizSiniriSecenekleri = VARSAYILAN, simdi = Date.now()) {
  const yerel = yerelKontrol(key, secenekler, simdi);
  if (!yerel.allowed) return yerel;

  try {
    const paylasimli = await paylasimliKontrol(key, secenekler, simdi);
    void temizle(simdi).catch(() => {});
    return paylasimli;
  } catch {
    return yerel;
  }
}

export async function resetRateLimit(key: string) {
  kovalar.delete(key);
  try {
    await sql`DELETE FROM "RateLimit" WHERE "key" = ${key}`;
  } catch {
    // Veritabanı erişilemiyorsa sayaç penceresi dolunca kendiliğinden sıfırlanır.
  }
}

// Testler için: süreç içi kovaları boşaltır, veritabanına dokunmaz.
export function yerelKovalariBosalt() {
  kovalar.clear();
  sonTemizlik = 0;
}
