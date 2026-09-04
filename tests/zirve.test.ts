import { describe, expect, it } from "vitest";
import { guvenliZirveAdresi, zirveGovdesiniCoz, zirveYolu } from "@/lib/zirve-govde";

/*
 * Zirve gövdesi panelden JSON olarak geliyor ve hem yazarken hem okurken aynı
 * süzgeçten geçiyor. Testler süzgecin üç işini kontrol ediyor: eksik alanı
 * varsayılanına düşürmek, adresleri doğrulamak ve boş kayıtları elemek.
 */

describe("guvenliZirveAdresi", () => {
  it("site içi yolu ve http(s) adresini geçirir, ötekini eler", () => {
    expect(guvenliZirveAdresi("/video/zirve.mp4")).toBe("/video/zirve.mp4");
    expect(guvenliZirveAdresi("https://ornek/zirve.mp4")).toBe("https://ornek/zirve.mp4");
    expect(guvenliZirveAdresi("javascript:alert(1)")).toBe("");
    expect(guvenliZirveAdresi("video/zirve.mp4")).toBe("");
    expect(guvenliZirveAdresi(null)).toBe("");
  });
});

describe("zirveGovdesiniCoz", () => {
  it("boş gövdeyi varsayılanlara çevirir", () => {
    expect(zirveGovdesiniCoz(undefined)).toEqual({
      yil: "", metin: "", vurgular: [], bolumler: [], gorseller: [], video: null,
    });
  });

  it("adresi elenen görseli listeden düşürür", () => {
    // Boş src ile basılan <img> sayfayı bozuyor; karenin hiç basılmaması iyidir.
    const govde = zirveGovdesiniCoz({
      gorseller: [
        { url: "/medya/a.jpg", alt: "kare" },
        { url: "javascript:alert(1)", alt: "kötü" },
        { alt: "adressiz" },
      ],
    });
    expect(govde.gorseller).toEqual([{ url: "/medya/a.jpg", alt: "kare" }]);
  });

  it("boş vurgu ve bölümleri eler, metinleri kırpar", () => {
    const govde = zirveGovdesiniCoz({
      vurgular: [{ deger: " 63 ", etiket: " il " }, { deger: "", etiket: "" }],
      bolumler: [{ baslik: " Sergi Alanı ", metin: " 55 il " }, { baslik: "", metin: "" }],
    });
    expect(govde.vurgular).toEqual([{ deger: "63", etiket: "il" }]);
    expect(govde.bolumler).toEqual([{ baslik: "Sergi Alanı", metin: "55 il" }]);
  });

  it("videoyu yalnızca geçerli adresle kurar", () => {
    expect(zirveGovdesiniCoz({ video: { url: "javascript:1", baslik: "x" } }).video).toBeNull();
    expect(zirveGovdesiniCoz({ video: { url: "/video/a.mp4", baslik: "Tanıtım", kapak: "data:x" } }).video)
      .toEqual({ url: "/video/a.mp4", baslik: "Tanıtım", kapak: undefined });
  });
});

describe("zirveYolu", () => {
  it("tarihsel adresi korur, yoksa /zirve/<slug> üretir", () => {
    expect(zirveYolu("zirve", "/zirve")).toBe("/zirve");
    expect(zirveYolu("2-genctek-zirvesi-2026", "/2-genctek-zirvesi-2026")).toBe("/2-genctek-zirvesi-2026");
    expect(zirveYolu("3-genctek-zirvesi-2027", "")).toBe("/zirve/3-genctek-zirvesi-2027");
    // Panelden bozuk bir adres yazılsa da sayfa erişilebilir kalmalı.
    expect(zirveYolu("yeni", "javascript:1")).toBe("/zirve/yeni");
  });
});
