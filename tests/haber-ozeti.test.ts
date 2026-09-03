import { beforeEach, describe, expect, it, vi } from "vitest";

/* Haberler 3 Eylül 2026'da data/haberler.json'dan "Article" tablosuna geçti.
   Buradaki testler göçün iki kırılgan yerini tutuyor: sütunların Haber
   alanlarına eşlenmesi ve bağlantı düştüğünde yedek anlık görüntüye düşme.
   Dosya sürümündeki mtime belleği testleri konusuz kaldı, kaldırıldı. */

const sahte = vi.hoisted(() => ({
  satirlar: [] as unknown[],
  patlasin: false,
}));

vi.mock("@/lib/db", () => {
  const etiket = (..._parcalar: unknown[]) => {
    if (sahte.patlasin) {
      const hata = new Error("connection terminated") as Error & { code?: string };
      hata.code = "ECONNRESET";
      return Promise.reject(hata);
    }
    return Promise.resolve(sahte.satirlar);
  };
  return { sql: Object.assign(etiket, { json: (deger: unknown) => deger }) };
});

const { haberOzetiniTamamla, haberBul, haberleriOku, haberSayfasi } = await import("@/lib/haber");

beforeEach(() => {
  sahte.satirlar = [];
  sahte.patlasin = false;
});

describe("haberOzetiniTamamla", () => {
  it("WordPress tarafından yarım bırakılan özeti paragraf sonunda tamamlar", () => {
    const html = "<p>İlk cümle.</p><p>İkinci paragraf eksiksiz olarak burada tamamlanır.</p>";
    expect(haberOzetiniTamamla("İlk cümle. İkinci paragraf eksiksiz […]", html))
      .toBe("İlk cümle. İkinci paragraf eksiksiz olarak burada tamamlanır.");
  });

  it("tam cümleden sonra eklenen kesme işaretini kaldırır", () => {
    const html = "<p>Etkinlik başarıyla gerçekleştirildi.</p><p>Programa öğrenciler katıldı.</p>";
    expect(haberOzetiniTamamla("Etkinlik başarıyla gerçekleştirildi. […]", html))
      .toBe("Etkinlik başarıyla gerçekleştirildi.");
  });

  it("elle yazılmış özeti değiştirmez", () => {
    expect(haberOzetiniTamamla("Eksiksiz haber özeti.", "<p>Başka bir metin.</p>"))
      .toBe("Eksiksiz haber özeti.");
  });
});

describe("satır → Haber eşlemesi", () => {
  const satir = {
    refNo: 42,
    slug: "ornek-haber",
    title: "Örnek Haber",
    summary: "Özet.",
    body: "<p>Gövde.</p>",
    coverImage: "/temalar/ornek.jpg",
    categories: [7, 9],
    format: "duz",
    source: "Gövde.",
    publishedAt: new Date("2026-08-31T09:00:00.000Z"),
    updatedAt: new Date("2026-09-01T10:00:00.000Z"),
  };

  it("sütunları dosya sürümündeki alan adlarına çevirir", async () => {
    sahte.satirlar = [satir];
    const haber = await haberBul("ornek-haber");

    // refNo uygulamanın haber kimliği; cuid birincil anahtar dışarı sızmıyor.
    expect(haber?.id).toBe(42);
    expect(haber?.excerpt).toBe("Özet.");
    expect(haber?.html).toBe("<p>Gövde.</p>");
    expect(haber?.featuredImage).toBe("/temalar/ornek.jpg");
    expect(haber?.categories).toEqual([7, 9]);
    expect(haber?.bicim).toBe("duz");
    expect(haber?.kaynak).toBe("Gövde.");
    expect(haber?.date).toBe("2026-08-31T09:00:00.000Z");
    expect(haber?.modified).toBe("2026-09-01T10:00:00.000Z");
  });

  it("[...slug] rotası haberleri statik sayfalarla birleştirdiği için tip alanları da dolar", async () => {
    sahte.satirlar = [satir];
    const haber = await haberBul("ornek-haber");
    expect(haber?.type).toBe("post");
    expect(haber?.path).toBe("ornek-haber");
  });

  it("bilinmeyen biçim html sayılır", async () => {
    sahte.satirlar = [{ ...satir, format: "bilinmeyen" }];
    expect((await haberBul("ornek-haber"))?.bicim).toBe("html");
  });
});

describe("veritabanı düştüğünde", () => {
  it("yedek anlık görüntüye düşer ve orada kesik özet bırakmaz", async () => {
    sahte.patlasin = true;
    const haberler = await haberleriOku();

    expect(haberler.length).toBeGreaterThan(0);
    expect(haberler.some((haber) => /\[…\]\s*$/u.test(haber.excerpt))).toBe(false);
    expect(haberler.find((haber) => haber.slug === "genctek-eskisehir-akran-bulusmasi")?.excerpt)
      .toContain("büyük bir başarıyla gerçekleştirildi.");
  });

  it("sayfalama yedekte de çalışır", async () => {
    sahte.patlasin = true;
    const { kartlar, sayfa, sonSayfa, toplam } = await haberSayfasi(2);

    expect(sayfa).toBe(2);
    expect(sonSayfa).toBeGreaterThan(1);
    expect(kartlar.length).toBeGreaterThan(0);
    expect(toplam).toBeGreaterThan(kartlar.length);
  });
});
