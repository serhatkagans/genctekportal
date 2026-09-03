import { beforeEach, describe, expect, it, vi } from "vitest";

/* Sayaç süreç içi bir Map'ten veritabanına taşındı: portal çok sürece
   çıkarılacaksa sınırın süreçler arasında ortak olması şart, yoksa dört süreç
   girişteki beş deneme sınırını fiilen yirmiye çıkarır. Buradaki testler o
   taşımanın iki kritik ucunu tutuyor — kuralın kendisi ve veritabanı
   çekildiğinde ne olduğu. */

const sahte = vi.hoisted(() => ({
  // Her test kendi davranışını yazar: satır döndüren, hata atan ya da sayan.
  satir: null as { count: number; resetAt: Date; blockedUntil: Date | null } | null,
  patlasin: false,
  yazilan: [] as unknown[][],
}));

vi.mock("@/lib/db", () => {
  const etiket = async (..._parcalar: unknown[]) => {
    if (sahte.patlasin) throw new Error("veritabanı yok");
    return [];
  };
  const sql = Object.assign(etiket, {
    begin: async (cb: (tx: unknown) => unknown) => {
      if (sahte.patlasin) throw new Error("veritabanı yok");
      let ilk = true;
      const tx = async (...parcalar: unknown[]) => {
        if (ilk) {
          ilk = false;
          return sahte.satir ? [sahte.satir] : [];
        }
        sahte.yazilan.push(parcalar);
        return [];
      };
      return cb(tx);
    },
  });
  return { sql };
});

const { checkRateLimit, sonrakiDurum, yerelKovalariBosalt } = await import("@/lib/security/rate-limit");

const secenekler = { limit: 5, windowMs: 15 * 60_000 };
const T0 = 1_700_000_000_000;

beforeEach(() => {
  sahte.satir = null;
  sahte.patlasin = false;
  sahte.yazilan = [];
  yerelKovalariBosalt();
});

describe("sonrakiDurum", () => {
  it("ilk denemede pencereyi açar ve sayacı bire çeker", () => {
    expect(sonrakiDurum(undefined, secenekler, T0))
      .toEqual({ count: 1, resetAt: T0 + secenekler.windowMs, blockedUntil: 0 });
  });

  it("sınır aşılana kadar engellemez, aşılınca engeller", () => {
    let durum = sonrakiDurum(undefined, secenekler, T0);
    for (let deneme = 2; deneme <= 5; deneme += 1) durum = sonrakiDurum(durum, secenekler, T0);
    expect(durum.count).toBe(5);
    expect(durum.blockedUntil).toBe(0);

    durum = sonrakiDurum(durum, secenekler, T0);
    expect(durum.count).toBe(6);
    expect(durum.blockedUntil).toBe(T0 + secenekler.windowMs);
  });

  it("ceza süresi boyunca gelen istek sayacı artırmaz, cezayı uzatmaz", () => {
    const engelli = { count: 6, resetAt: T0 + secenekler.windowMs, blockedUntil: T0 + 60_000 };
    expect(sonrakiDurum(engelli, secenekler, T0 + 1_000)).toBe(engelli);
  });

  it("ceza penceresinin dört katını aşmaz", () => {
    let durum: ReturnType<typeof sonrakiDurum> = { count: 40, resetAt: T0 + secenekler.windowMs, blockedUntil: 0 };
    durum = sonrakiDurum(durum, secenekler, T0);
    expect(durum.blockedUntil).toBe(T0 + secenekler.windowMs * 4);
  });

  it("pencere dolunca sayaç ve ceza sıfırlanır", () => {
    const eski = { count: 9, resetAt: T0, blockedUntil: T0 - 1 };
    expect(sonrakiDurum(eski, secenekler, T0 + 1))
      .toEqual({ count: 1, resetAt: T0 + 1 + secenekler.windowMs, blockedUntil: 0 });
  });
});

describe("checkRateLimit", () => {
  it("başka bir sürecin doldurduğu sayacı görüp reddeder", async () => {
    // Bu süreç anahtarı ilk kez görüyor; karar yine de paylaşılan satıra göre.
    sahte.satir = { count: 9, resetAt: new Date(T0 + secenekler.windowMs), blockedUntil: new Date(T0 + 60_000) };
    const sinir = await checkRateLimit("giris:a:b", secenekler, T0);

    expect(sinir.allowed).toBe(false);
    expect(sinir.retryAfterMs).toBe(60_000);
    // Engelliyken satır yeniden yazılmaz; ceza uzamasın.
    expect(sahte.yazilan).toHaveLength(0);
  });

  it("paylaşılan sayacı artırıp satırı yazar", async () => {
    sahte.satir = { count: 2, resetAt: new Date(T0 + secenekler.windowMs), blockedUntil: null };
    const sinir = await checkRateLimit("giris:a:b", secenekler, T0);

    expect(sinir.allowed).toBe(true);
    expect(sinir.remaining).toBe(2);
    expect(sahte.yazilan).toHaveLength(1);
  });

  it("veritabanı düşerse açık kalır ama süreç içi sınır yürürlükte kalır", async () => {
    sahte.patlasin = true;
    for (let deneme = 1; deneme <= 5; deneme += 1) {
      expect((await checkRateLimit("giris:a:b", secenekler, T0)).allowed).toBe(true);
    }
    expect((await checkRateLimit("giris:a:b", secenekler, T0)).allowed).toBe(false);
  });
});
