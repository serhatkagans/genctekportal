import { describe, expect, it } from "vitest";
import {
  anaSayfaMetniniCoz,
  guvenliSayfaAdresi,
  katilimMetniniCoz,
  kvkkMetniniCoz,
  paragraflaraBol,
} from "../lib/sayfa-metni-govde";
import anaSayfaYedegi from "../data-ornek/anasayfa.json";
import katilimYedegi from "../data-ornek/katilim.json";
import kvkkYedegi from "../data-ornek/kvkk.json";

/* Bu üç gövde panelden geliyor ve tabloya elle satır da girilebilir: süzgeç
   hem yazarken hem okurken çalışıyor, testler de ikisini birden karşılıyor. */

describe("sayfa adresleri", () => {
  it("site içi yolu, http(s), mailto ve tel adreslerini geçirir", () => {
    expect(guvenliSayfaAdresi("/kvkk")).toBe("/kvkk");
    expect(guvenliSayfaAdresi("https://yegitek.meb.gov.tr")).toBe("https://yegitek.meb.gov.tr");
    expect(guvenliSayfaAdresi("mailto:yegitek@meb.gov.tr")).toBe("mailto:yegitek@meb.gov.tr");
    expect(guvenliSayfaAdresi("tel:+903122969400")).toBe("tel:+903122969400");
  });

  it("script taşıyan ve tanınmayan şemaları atar", () => {
    expect(guvenliSayfaAdresi("javascript:alert(1)")).toBe("");
    expect(guvenliSayfaAdresi("data:text/html,<script>")).toBe("");
    expect(guvenliSayfaAdresi("ftp://sunucu/dosya")).toBe("");
    expect(guvenliSayfaAdresi(42)).toBe("");
  });
});

describe("paragraflara bölme", () => {
  it("boş satırda böler, boşlukları kırpar", () =>
    expect(paragraflaraBol("Bir.\n\n  İki.  \n\n\n")).toEqual(["Bir.", "İki."]));
});

describe("ana sayfa metni", () => {
  it("varsayılan dosyayı kayıpsız çözer", () => {
    const metin = anaSayfaMetniniCoz(anaSayfaYedegi);
    expect(metin.hero.baslik).toBe("Sektörün Yeni");
    expect(metin.hero.vurgu).toBe("Liderleri");
    expect(metin.serit).toHaveLength(3);
    expect(metin.cagri.dugme).toBe("Ekosisteme Katıl");
  });

  it("eksik gövdede çökmez, boş alanlara düşer", () => {
    const metin = anaSayfaMetniniCoz(null);
    expect(metin.hero.baslik).toBe("");
    expect(metin.serit).toEqual([]);
  });

  // Şeritteki boş satır, sitede boş bir sütun olurdu.
  it("şeritteki boş satırları atar", () =>
    expect(anaSayfaMetniniCoz({ serit: ["Bir", "  ", "", "İki"] }).serit).toEqual(["Bir", "İki"]));
});

describe("katılım metni", () => {
  it("varsayılan dosyayı çözer", () =>
    expect(katilimMetniniCoz(katilimYedegi).baslik).toBe("Üretim yolculuğun burada başlıyor."));
});

describe("KVKK metni", () => {
  const metin = kvkkMetniniCoz(kvkkYedegi);

  it("yedekteki yedi bölümü de taşır", () => {
    expect(metin.bolumler).toHaveLength(7);
    expect(metin.bolumler[0].baslik).toBe("1. Veri Sorumlusu");
    // 2. bölümdeki yedi işleme amacı ve 6. bölümdeki dokuz hak.
    expect(metin.bolumler[1].maddeler).toHaveLength(7);
    expect(metin.bolumler[5].maddeler).toHaveLength(9);
  });

  it("başvuru bölümündeki telefon ve e-posta bağlantılarını korur", () => {
    const satirlar = metin.bolumler[6].satirlar;
    expect(satirlar).toHaveLength(5);
    expect(satirlar.map((s) => s.adres)).toContain("tel:+903122969400");
    expect(satirlar.map((s) => s.adres)).toContain("mailto:yegitek@meb.gov.tr");
  });

  it("bağlantı adresindeki script'i atar ama satırı bırakır", () => {
    const cozulmus = kvkkMetniniCoz({
      bolumler: [{ baslik: "1.", satirlar: [{ metin: "Tık:", baglantiMetni: "buraya", adres: "javascript:alert(1)" }] }],
    });
    expect(cozulmus.bolumler[0].satirlar[0]).toEqual({ metin: "Tık:", baglantiMetni: "buraya", adres: "" });
  });

  it("boş madde, boş satır ve boş bölümü atar", () => {
    const cozulmus = kvkkMetniniCoz({
      bolumler: [
        { baslik: "1. Dolu", maddeler: [{ baslik: "", metin: "  " }, { baslik: "", metin: "Kalır." }] },
        { baslik: "", giris: "   ", maddeler: [], satirlar: [] },
      ],
    });
    expect(cozulmus.bolumler).toHaveLength(1);
    expect(cozulmus.bolumler[0].maddeler).toEqual([{ baslik: "", metin: "Kalır." }]);
  });

  it("tanınmayan gövdede boş liste döner", () =>
    expect(kvkkMetniniCoz({ bolumler: "bölüm değil" }).bolumler).toEqual([]));
});
