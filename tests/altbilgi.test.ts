import { describe, expect, it } from "vitest";
import { altbilgiyiCoz, guvenliAltbilgiAdresi } from "@/lib/altbilgi-govde";

/*
 * Alt bilgi HER SAYFADA basılıyor ve içeriği panelden geliyor: bozuk bir kayıt
 * sitenin tamamını etkiler. Süzgeç eksik alanı temizliyor, boş satırı eliyor ve
 * adresleri doğruluyor.
 */

describe("guvenliAltbilgiAdresi", () => {
  it("site içi yolu, http(s) ve mailto adresini geçirir", () => {
    expect(guvenliAltbilgiAdresi("/kvkk")).toBe("/kvkk");
    expect(guvenliAltbilgiAdresi("https://yegitek.meb.gov.tr")).toBe("https://yegitek.meb.gov.tr");
    expect(guvenliAltbilgiAdresi("mailto:genctek@eba.gov.tr")).toBe("mailto:genctek@eba.gov.tr");
  });

  it("betik ve göreli adresleri eler", () => {
    // Alt bilgi her sayfada olduğu için buradaki bir "javascript:" bağlantısı
    // sitenin tamamına yayılan bir tıklama tuzağı olurdu.
    expect(guvenliAltbilgiAdresi("javascript:alert(1)")).toBe("");
    expect(guvenliAltbilgiAdresi("kvkk")).toBe("");
    expect(guvenliAltbilgiAdresi(undefined)).toBe("");
  });
});

describe("altbilgiyiCoz", () => {
  it("boş gövdeyi boş listelere çevirir", () => {
    expect(altbilgiyiCoz(null)).toEqual({ markalar: [], baglantilar: [] });
  });

  it("adı ve logosu olmayan kurum sütununu eler, GençTek markasını korur", () => {
    const altbilgi = altbilgiyiCoz({
      markalar: [
        { tur: "logo", ad: "", logo: "", adres: "https://ornek" },
        { tur: "genctek", ad: "GençTek", logo: "", adres: "/" },
        { tur: "logo", ad: "ETKİM", logo: "/logo-etkim.png", adres: "https://etkim.gov.tr/" },
      ],
    });
    expect(altbilgi.markalar.map((m) => m.tur)).toEqual(["genctek", "logo"]);
  });

  it("tanınmayan türü kurum logosu sayar ve metinleri kırpar", () => {
    const [marka] = altbilgiyiCoz({ markalar: [{ tur: "kotu", ad: "  YEĞİTEK  ", logo: "/a.png", adres: " /x " }] }).markalar;
    expect(marka).toEqual({ tur: "logo", ad: "YEĞİTEK", logo: "/a.png", adres: "/x" });
  });

  it("etiketi ya da adresi eksik bağlantıyı basmaz", () => {
    const altbilgi = altbilgiyiCoz({
      baglantilar: [
        { etiket: "KVKK ve Gizlilik", adres: "/kvkk" },
        { etiket: "Boş", adres: "" },
        { etiket: "", adres: "/x" },
        { etiket: "Kötü", adres: "javascript:1" },
      ],
    });
    expect(altbilgi.baglantilar).toEqual([{ etiket: "KVKK ve Gizlilik", adres: "/kvkk" }]);
  });
});
