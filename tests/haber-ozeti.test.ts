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
