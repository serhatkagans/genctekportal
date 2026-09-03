import { describe, expect, it } from "vitest";
import { ipOzeti, istemciIp } from "@/lib/security/istemci-ip";

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
