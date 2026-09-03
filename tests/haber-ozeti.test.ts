import { stat, utimes } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { haberOzetiniTamamla, haberleriOku } from "@/lib/haber";

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

  it("mevcut haberlerde kesilmiş özet bırakmaz", async () => {
    const haberler = await haberleriOku();
    expect(haberler.some((haber) => /\[…\]\s*$/u.test(haber.excerpt))).toBe(false);
    expect(haberler.find((haber) => haber.slug === "genctek-eskisehir-akran-bulusmasi")?.excerpt)
      .toContain("büyük bir başarıyla gerçekleştirildi.");
  });
});

/* Özet tamamlama istek başına ~41 ms CPU tutuyordu ve /haberler'i 24 istek/sn'de
   tıkıyordu; sonuç artık dosyanın mtime+boyutuna göre saklanıyor. İki koşul da
   sınanmalı: aynı dosyada iş tekrarlanmamalı, dosya değişince bayat kayıt
   dönmemeli — ikincisi bozulursa panelden yapılan düzenleme sitede görünmez. */
describe("haberleriOku belleği", () => {
  const dosya = path.join(process.cwd(), "data", "haberler.json");

  it("dosya değişmedikçe aynı sonucu yeniden hesaplamaz", async () => {
    expect(await haberleriOku()).toBe(await haberleriOku());
  });

  it("dosya değişince kayıtları baştan okur", async () => {
    const once = await haberleriOku();
    const { atime, mtime } = await stat(dosya);
    try {
      await utimes(dosya, atime, new Date(mtime.getTime() + 1000));
      const sonra = await haberleriOku();
      expect(sonra).not.toBe(once);
      expect(sonra.map((h) => h.slug)).toEqual(once.map((h) => h.slug));
    } finally {
      await utimes(dosya, atime, mtime);
    }
  });
});
