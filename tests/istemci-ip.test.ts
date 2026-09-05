import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ipOzeti, istemciIp } from "@/lib/security/istemci-ip";

/* ipOzeti artık anahtarlı (HMAC) ve anahtar yoksa fırlatıyor; testlerde .env
   okunmadığı için gizli anahtar burada kuruluyor. Anahtarı değiştiren testler
   var, o yüzden her testten önce sıfırlanıyor ve dosya sonunda ilk hâline
   döndürülüyor — başka bir test dosyasının beklentisi bozulmasın. */
const ILK_GIZLI = process.env.SESSION_SECRET;
beforeEach(() => {
  process.env.SESSION_SECRET = "test-gizli-anahtar";
});
afterEach(() => {
  if (ILK_GIZLI === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = ILK_GIZLI;
});

/* Başlık eskiden ilk öğesinden okunuyordu; o öğeyi istemci yazabildiği için
   hız sınırı atlatılabiliyordu. Buradaki testlerin tuttuğu şey son öğenin
   alınması — düzeltmenin tamamı bu. */
function basliklar(deger?: string) {
  return new Headers(deger === undefined ? {} : { "x-forwarded-for": deger });
}

describe("istemciIp", () => {
  it("tek öğeli zincirde o öğeyi verir", () => {
    expect(istemciIp(basliklar("203.0.113.9"))).toBe("203.0.113.9");
  });

  it("istemcinin başa eklediği uydurma adresi değil, vekilin eklediği son öğeyi alır", () => {
    expect(istemciIp(basliklar("1.2.3.4, 203.0.113.9"))).toBe("203.0.113.9");
  });

  it("birden fazla uydurma öğe eklenmiş olsa da sonu alır", () => {
    expect(istemciIp(basliklar("1.2.3.4, 5.6.7.8, 9.9.9.9, 203.0.113.9"))).toBe("203.0.113.9");
  });

  it("boşluk ve sondaki virgülden etkilenmez", () => {
    expect(istemciIp(basliklar("  1.2.3.4 ,  203.0.113.9 ,  "))).toBe("203.0.113.9");
  });

  it("IPv6 adresini bozmadan verir", () => {
    expect(istemciIp(basliklar("1.2.3.4, 2001:db8::1"))).toBe("2001:db8::1");
  });

  it("başlık yoksa null döner", () => {
    expect(istemciIp(basliklar())).toBeNull();
  });

  it("başlık boşsa null döner", () => {
    expect(istemciIp(basliklar(" , "))).toBeNull();
  });
});

describe("ipOzeti", () => {
  it("aynı adres için aynı 32 karakterlik özeti verir", () => {
    const ozet = ipOzeti("203.0.113.9");
    expect(ozet).toHaveLength(32);
    expect(ozet).toBe(ipOzeti("203.0.113.9"));
  });

  it("farklı adresleri farklı özetlere ayırır", () => {
    expect(ipOzeti("203.0.113.9")).not.toBe(ipOzeti("203.0.113.10"));
  });

  it("ham adresi sızdırmaz", () => {
    expect(ipOzeti("203.0.113.9")).not.toContain("203.0.113");
  });

  it("adres yoksa null döner", () => {
    expect(ipOzeti(null)).toBeNull();
  });
});

/*
 * IP ÖZETİ ANAHTARLI (5 Eylül 2026 · güvenlik incelemesi). Düz sha256(ip)
 * koruma değildi: IPv4'ün 2^32 değerinin tümünün özeti çıkarılıp tabloya
 * bakılabilir, yani veritabanını okuyan gerçek adresi geri buluyordu.
 */
describe("ip özeti", () => {
  it("anahtarsız sha256 üretmez", () => {
    const eski = createHash("sha256").update("203.0.113.9", "utf8").digest("hex").slice(0, 32);
    expect(ipOzeti("203.0.113.9")).not.toBe(eski);
  });

  it("aynı gizli anahtarla kararlı, farklı anahtarla farklı", () => {
    process.env.SESSION_SECRET = "birinci";
    const a = ipOzeti("203.0.113.9");
    expect(ipOzeti("203.0.113.9")).toBe(a);
    process.env.SESSION_SECRET = "ikinci";
    expect(ipOzeti("203.0.113.9")).not.toBe(a);
  });

  // Sessizce anahtarsız özete düşmek, kapatılan açığı üretimde geri açardı.
  it("gizli anahtar yoksa fırlatır", () => {
    delete process.env.SESSION_SECRET;
    expect(() => ipOzeti("203.0.113.9")).toThrow(/SESSION_SECRET/);
  });

  it("ip yoksa null döner", () => {
    delete process.env.SESSION_SECRET;
    expect(ipOzeti(null)).toBeNull();
  });
});
