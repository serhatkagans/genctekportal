import { describe, expect, it } from "vitest";
import {
  aciklamaOzeti,
  aciklamaParcalari,
  etkinlikGovdesiniCoz,
  guvenliEtkinlikAdresi,
} from "@/lib/temel-etkinlik-govde";

/*
 * Etkinlik programları panelden yazılıyor; gövde hem yazarken hem okurken aynı
 * süzgeçten geçiyor. Açıklamanın paragraflara bölünmesi de sayfada ve kart
 * özetinde kullanılan davranış, o yüzden burada kilitleniyor.
 */

describe("guvenliEtkinlikAdresi", () => {
  it("site içi yolu ve http(s) adresini geçirir, ötekini eler", () => {
    expect(guvenliEtkinlikAdresi("/medya/a.webp")).toBe("/medya/a.webp");
    expect(guvenliEtkinlikAdresi("https://ornek/a.webp")).toBe("https://ornek/a.webp");
    expect(guvenliEtkinlikAdresi("javascript:alert(1)")).toBe("");
    expect(guvenliEtkinlikAdresi(7)).toBe("");
  });
});

describe("etkinlikGovdesiniCoz", () => {
  it("boş gövdeyi varsayılanlara çevirir", () => {
    expect(etkinlikGovdesiniCoz(null)).toEqual({ aciklama: "", gorseller: [] });
  });

  it("adresi elenen kareyi listeden düşürür", () => {
    const govde = etkinlikGovdesiniCoz({
      aciklama: "Metin",
      gorseller: [
        { url: "/medya/kapak.webp", alt: "" },
        { url: "javascript:1", alt: "kötü" },
        { alt: "adressiz" },
      ],
    });
    expect(govde.gorseller).toEqual([{ url: "/medya/kapak.webp", alt: "" }]);
  });
});

describe("aciklamaParcalari", () => {
  it("boş satırdan böler ve kısa parçaları ara başlık sayar", () => {
    const parcalar = aciklamaParcalari("Kısa başlık\n\nBu paragraf altmış karakterden uzun olduğu için ara başlık değil, düz metin sayılır.");
    expect(parcalar.map((p) => p.baslikMi)).toEqual([true, false]);
  });

  it("kart özeti ilk uzun paragrafı alır", () => {
    const ozet = aciklamaOzeti("Ara başlık\n\nProgramın ne olduğunu anlatan, altmış karakterden uzun ilk paragraf burada.");
    expect(ozet.startsWith("Programın ne olduğunu")).toBe(true);
  });

  it("metin yoksa özet boş döner", () => {
    // Tanıtım metni gelmemiş programlar var; kart yine basılmalı.
    expect(aciklamaOzeti("")).toBe("");
  });
});
