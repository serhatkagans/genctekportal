import { describe, expect, it } from "vitest";
import { duzMetindenHtml, htmldenDuzMetin, gorselEtiketi } from "../lib/haber-bicim";
import { sanitizeRichText } from "../lib/content-services/sanitize";

describe("düz metinden HTML", () => {
  it("boş satırı paragrafa çevirir", () =>
    expect(duzMetindenHtml("Birinci.\n\nİkinci.")).toBe("<p>Birinci.</p>\n<p>İkinci.</p>"));

  it("tek satır sonunu satır kesmesi yapar", () =>
    expect(duzMetindenHtml("Bir\nİki")).toBe("<p>Bir<br />İki</p>"));

  it("başlıkları ayırır", () =>
    expect(duzMetindenHtml("## Ara başlık\n\n### Alt başlık"))
      .toBe("<h2>Ara başlık</h2>\n<h3>Alt başlık</h3>"));

  it("madde ve numaralı listeleri kurar", () => {
    expect(duzMetindenHtml("- Bir\n- İki")).toBe("<ul><li>Bir</li><li>İki</li></ul>");
    expect(duzMetindenHtml("1. Bir\n2. İki")).toBe("<ol><li>Bir</li><li>İki</li></ol>");
  });

  it("alıntı bloğu üretir", () =>
    expect(duzMetindenHtml("> Söz")).toBe("<blockquote><p>Söz</p></blockquote>"));

  it("kalın, italik ve bağlantıyı işler", () =>
    expect(duzMetindenHtml("**kalın** ve *italik* ve [site](https://ornek.gov.tr)"))
      .toBe('<p><strong>kalın</strong> ve <em>italik</em> ve <a href="https://ornek.gov.tr">site</a></p>'));

  it("görsel etiketini figure'e çevirir", () =>
    expect(duzMetindenHtml(gorselEtiketi("/medya/a.png", "Atölye")))
      .toBe('<figure><img src="/medya/a.png" alt="Atölye" loading="lazy" /><figcaption>Atölye</figcaption></figure>'));

  it("kullanıcının yazdığı HTML'i etiket olarak yorumlamaz", () =>
    expect(duzMetindenHtml("<script>alert(1)</script>"))
      .toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>"));

  it("javascript: bağlantısını bağlantıya çevirmez", () => {
    const cikti = duzMetindenHtml("[tıkla](javascript:alert(1))");
    expect(cikti).not.toContain("<a ");
    expect(cikti).not.toContain("javascript:alert(1)</a>");
  });

  it("ürettiği çıktı temizleyiciden değişmeden geçer", () => {
    const html = duzMetindenHtml("## Başlık\n\nMetin **kalın**.\n\n- Madde\n\n" + gorselEtiketi("/medya/a.png", "alt"));
    expect(sanitizeRichText(html)).toBe(html);
  });
});

describe("HTML'den düz metne", () => {
  it("paragraf, başlık ve listeyi geri getirir", () =>
    expect(htmldenDuzMetin("<h2>Başlık</h2><p>Metin</p><ul><li>Bir</li><li>İki</li></ul>"))
      .toBe("## Başlık\n\nMetin\n\n- Bir\n- İki"));

  it("görseli görsel etiketine döndürür", () =>
    expect(htmldenDuzMetin('<p><img src="/medya/a.png" alt="Atölye"></p>'))
      .toBe("[gorsel:/medya/a.png|Atölye]"));

  it("gidip gelen içerik anlamını korur", () => {
    const html = "<h2>Başlık</h2>\n<p>Metin <strong>kalın</strong>.</p>\n<ul><li>Bir</li></ul>";
    expect(duzMetindenHtml(htmldenDuzMetin(html))).toBe(html);
  });
});
