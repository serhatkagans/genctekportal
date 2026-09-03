import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// gorselYolu, modül yüklenirken okunan NEXT_PUBLIC_BASE_PATH'e bakıyor; bu
// yüzden her senaryoda modül yeniden içe aktarılıyor.
async function yardimciYukle(onek: string) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_BASE_PATH = onek;
  return (await import("../lib/ortam")).gorselYolu;
}

async function uygulamaYoluYukle(onek: string) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_BASE_PATH = onek;
  return (await import("../lib/ortam")).uygulamaYolu;
}

const oncekiOnek = process.env.NEXT_PUBLIC_BASE_PATH;
beforeEach(() => vi.resetModules());
afterEach(() => {
  if (oncekiOnek === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = oncekiOnek;
});

describe("gorselYolu — alt dizin kurulumu", () => {
  it("site içi yolun önüne uygulama ekini koyar", async () => {
    const gorselYolu = await yardimciYukle("/genctekportal");
    expect(gorselYolu("/temalar/espor.jpg")).toBe("/genctekportal/temalar/espor.jpg");
  });

  // Aynı değer birden çok render katmanından geçebiliyor; ikinci geçişte
  // "/genctekportal/genctekportal/..." üretmemeli.
  it("zaten ekli olan yolu ikinci kez eklemez", async () => {
    const gorselYolu = await yardimciYukle("/genctekportal");
    expect(gorselYolu("/genctekportal/temalar/espor.jpg")).toBe("/genctekportal/temalar/espor.jpg");
  });

  it("dış adresleri ve şemalı bağlantıları olduğu gibi bırakır", async () => {
    const gorselYolu = await yardimciYukle("/genctekportal");
    expect(gorselYolu("https://ornek.gov.tr/a.jpg")).toBe("https://ornek.gov.tr/a.jpg");
    expect(gorselYolu("//cdn.ornek.gov.tr/a.jpg")).toBe("//cdn.ornek.gov.tr/a.jpg");
    expect(gorselYolu("mailto:bilgi@genctek.gov.tr")).toBe("mailto:bilgi@genctek.gov.tr");
    expect(gorselYolu("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
  });

  it("göreli yolu ve çapa bağlantısını değiştirmez", async () => {
    const gorselYolu = await yardimciYukle("/genctekportal");
    expect(gorselYolu("#bolum")).toBe("#bolum");
    expect(gorselYolu("resim.jpg")).toBe("resim.jpg");
  });

  it("boş değer için boş dize döner", async () => {
    const gorselYolu = await yardimciYukle("/genctekportal");
    expect(gorselYolu("")).toBe("");
    expect(gorselYolu(null)).toBe("");
    expect(gorselYolu(undefined)).toBe("");
  });

  it("ek tanımlı değilken yolu olduğu gibi bırakır", async () => {
    const gorselYolu = await yardimciYukle("");
    expect(gorselYolu("/temalar/espor.jpg")).toBe("/temalar/espor.jpg");
  });
});

// Proxy'nin ürettiği Location başlığı ve düz <a>/fetch adresleri buradan geçiyor;
// eksik ek alan adının kökündeki 404'e gidiyordu.
describe("uygulamaYolu — alt dizin kurulumu", () => {
  it("uygulama içi yolun önüne eki koyar", async () => {
    const uygulamaYolu = await uygulamaYoluYukle("/genctekportal");
    expect(uygulamaYolu("/giris")).toBe("/genctekportal/giris");
    expect(uygulamaYolu("/api/basvurular")).toBe("/genctekportal/api/basvurular");
  });

  it("zaten ekli olan yolu ikinci kez eklemez", async () => {
    const uygulamaYolu = await uygulamaYoluYukle("/genctekportal");
    expect(uygulamaYolu("/genctekportal/giris")).toBe("/genctekportal/giris");
    expect(uygulamaYolu("/genctekportal")).toBe("/genctekportal");
  });

  // Eke benzeyen ama farklı olan yol kısaltılmamalı: /genctek başka bir proje.
  it("eke benzeyen farklı yola dokunmaz", async () => {
    const uygulamaYolu = await uygulamaYoluYukle("/genctekportal");
    expect(uygulamaYolu("/genctekportal-arsiv")).toBe("/genctekportal/genctekportal-arsiv");
  });

  it("ek tanımlı değilken yolu olduğu gibi bırakır", async () => {
    const uygulamaYolu = await uygulamaYoluYukle("");
    expect(uygulamaYolu("/giris")).toBe("/giris");
  });
});
