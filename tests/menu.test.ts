import { describe, expect, it } from "vitest";
import { guvenliMenuAdresi, menuyuCoz } from "@/lib/menu-govde";

/*
 * Üst menü her sayfada basılıyor ve içeriği panelden geliyor: bozuk bir kayıt
 * sitenin tamamını etkiler. Süzgeç, basılamayacak öğeleri eliyor ve adresleri
 * doğruluyor.
 */

describe("guvenliMenuAdresi", () => {
  it("site içi yolu, çapayı ve http(s) adresini geçirir", () => {
    expect(guvenliMenuAdresi("/haberler")).toBe("/haberler");
    expect(guvenliMenuAdresi("#hakkinda")).toBe("#hakkinda");
    expect(guvenliMenuAdresi("https://genctek.meb.gov.tr")).toBe("https://genctek.meb.gov.tr");
  });

  it("betik ve göreli adresleri eler", () => {
    expect(guvenliMenuAdresi("javascript:alert(1)")).toBe("");
    expect(guvenliMenuAdresi("haberler")).toBe("");
    expect(guvenliMenuAdresi(null)).toBe("");
  });
});

describe("menuyuCoz", () => {
  it("boş gövdede giriş düğmesi varsayılana düşer", () => {
    expect(menuyuCoz(null)).toEqual({ ogeler: [], girisEtiketi: "Giriş" });
  });

  it("etiketsiz öğeyi ve adressiz bağlantıyı eler", () => {
    // Etiketsiz öğe menüde tıklanamaz boş bir aralık olurdu.
    const menu = menuyuCoz({
      ogeler: [
        { tur: "baglanti", etiket: "Haberler", adres: "/haberler" },
        { tur: "baglanti", etiket: "", adres: "/x" },
        { tur: "baglanti", etiket: "Adressiz", adres: "" },
        { tur: "baglanti", etiket: "Kötü", adres: "javascript:1" },
      ],
    });
    expect(menu.ogeler).toEqual([{ tur: "baglanti", etiket: "Haberler", adres: "/haberler" }]);
  });

  it("açılır listeler adressiz de kalabilir", () => {
    // İçerikleri kendi ekranlarından geldiği için hedef adresleri yok.
    const menu = menuyuCoz({
      ogeler: [
        { tur: "hakkinda", etiket: "Hakkında" },
        { tur: "zirveler", etiket: "GençTek Zirvesi" },
      ],
    });
    expect(menu.ogeler.map((o) => o.tur)).toEqual(["hakkinda", "zirveler"]);
  });

  it("tanınmayan türü düz bağlantı sayar ve etiketleri kırpar", () => {
    const menu = menuyuCoz({ ogeler: [{ tur: "kotu", etiket: "  Haberler  ", adres: " /haberler " }] });
    expect(menu.ogeler[0]).toEqual({ tur: "baglanti", etiket: "Haberler", adres: "/haberler" });
  });

  it("giriş düğmesinin yazısı boşsa varsayılana döner", () => {
    expect(menuyuCoz({ girisEtiketi: "   " }).girisEtiketi).toBe("Giriş");
    expect(menuyuCoz({ girisEtiketi: "Platforma giriş" }).girisEtiketi).toBe("Platforma giriş");
  });
});
