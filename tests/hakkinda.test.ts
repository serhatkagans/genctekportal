import { describe, expect, it } from "vitest";
import { bloklariCoz, guvenliAdres, kartAdresi, baglantiKartiMi } from "@/lib/hakkinda";

/*
 * Hakkında sayfaları panelden yazılıyor: gövde bir JSON alanı olarak geliyor ve
 * hem yazarken hem okurken aynı süzgeçten (bloklariCoz) geçiyor. Testler o
 * süzgecin iki işini kontrol ediyor — tanımadığı şeyi atması ve adreslerin
 * yalnızca site içi yol ya da http(s) olabilmesi.
 */

describe("guvenliAdres", () => {
  it("site içi yolu ve http(s) adresini geçirir", () => {
    expect(guvenliAdres("/temalar")).toBe("/temalar");
    expect(guvenliAdres("https://genctek.meb.gov.tr")).toBe("https://genctek.meb.gov.tr");
    expect(guvenliAdres("  /medya/a.jpg  ")).toBe("/medya/a.jpg");
  });

  it("betik ve göreli şemaları eler", () => {
    // Kart adresine "javascript:" yazılabilseydi kartın kendisi bir tıklama
    // tuzağı olurdu; alan panelden serbestçe doldurulabiliyor.
    expect(guvenliAdres("javascript:alert(1)")).toBe("");
    expect(guvenliAdres("data:text/html,<script>")).toBe("");
    expect(guvenliAdres("temalar")).toBe("");
    expect(guvenliAdres(42)).toBe("");
  });
});

describe("bloklariCoz", () => {
  it("tanımadığı blok türünü atar, tanıdıklarını korur", () => {
    const bloklar = bloklariCoz([
      { tur: "metin", metin: "iki paragraf" },
      { tur: "iframe", src: "https://kotu" },
      null,
      "metin",
      { tur: "baslik", metin: "Başlık", ustEtiket: "Etiket", yeniBolum: true },
    ]);
    expect(bloklar.map((b) => b.tur)).toEqual(["metin", "baslik"]);
    expect(bloklar[1]).toMatchObject({ ustEtiket: "Etiket", yeniBolum: true });
  });

  it("dizi olmayan gövdeyi boş listeye çevirir", () => {
    expect(bloklariCoz(null)).toEqual([]);
    expect(bloklariCoz({ tur: "metin" })).toEqual([]);
  });

  it("blok içindeki adresleri de süzer", () => {
    const [gorsel, kartlar] = bloklariCoz([
      { tur: "gorsel", url: "javascript:alert(1)", alt: "x" },
      { tur: "kartlar", ogeler: [{ ad: "Logo", aciklama: "", dosya: "/marka/a.pdf" }, { ad: "Kötü", aciklama: "", dosya: "javascript:1" }] },
    ]);
    expect(gorsel).toMatchObject({ tur: "gorsel", url: "", alt: "x" });
    expect(kartlar).toMatchObject({
      tur: "kartlar",
      ogeler: [{ dosya: "/marka/a.pdf" }, { dosya: "" }],
    });
  });

  it("metin olmayan alanları boş metne çevirir", () => {
    expect(bloklariCoz([{ tur: "metin", metin: { kotu: true } }])).toEqual([
      { tur: "metin", metin: "", sutun: undefined },
    ]);
  });
});

describe("kart adresi", () => {
  it("bağlantı kartı hedefine, normal kart kendi sayfasına gider", () => {
    expect(kartAdresi({ slug: "logolar", adres: "" })).toBe("/hakkinda/logolar");
    expect(kartAdresi({ slug: "calisma-gruplari", adres: "/temalar" })).toBe("/temalar");
    expect(baglantiKartiMi({ adres: "/temalar" })).toBe(true);
    expect(baglantiKartiMi({ adres: "  " })).toBe(false);
  });
});
