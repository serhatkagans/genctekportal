import { describe, expect, it } from "vitest";
import { duzMetindenHtml, htmldenDuzMetin, gorselEtiketi } from "../lib/haber-bicim";
import { altyazilariAt, galeriGorselleriBuyut, oneCikanTekrariniAt, sanitizeRichText } from "../lib/content-services/sanitize";

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

  // Alt metin `alt`'ta kalır, görselin altına açıklama basılmaz.
  it("görsel etiketini altyazısız figure'e çevirir", () =>
    expect(duzMetindenHtml(gorselEtiketi("/medya/a.png", "Atölye")))
      .toBe('<figure><img src="/medya/a.png" alt="Atölye" loading="lazy" /></figure>'));

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

describe("Haber gövdesi görselleri", () => {
  const kapak = "/medya/kamp-1.jpg";
  const govde = `<p>Metin</p> <figure><img src="${kapak}" alt="a" /><figcaption>Altyazı</figcaption></figure> <p>Devam</p>`;

  it("kapakla aynı görseli gövdeden çıkarır", () => {
    const cikti = oneCikanTekrariniAt(govde, kapak);
    expect(cikti).not.toContain(kapak);
    expect(cikti).not.toContain("Altyazı");
    expect(cikti).toContain("<p>Devam</p>");
  });

  it("başka görsellere dokunmaz", () =>
    expect(oneCikanTekrariniAt(govde, "/medya/baska.jpg")).toBe(govde));

  it("galeri görselinin sizes değerini gövde genişliğine çeker", () => {
    const html = '<a href="/wordpress/media/1.jpg"><img src="/wordpress/media/1-300x200.jpg" srcset="/wordpress/media/1-300x200.jpg 300w, /wordpress/media/1.jpg 1600w" sizes="(max-width: 300px) 100vw, 300px" width="300" height="200" /></a>';
    const cikti = galeriGorselleriBuyut(html);
    expect(cikti).toContain('sizes="(max-width: 940px) 100vw, 940px"');
    expect(cikti).not.toContain('width="300"');
  });

  it("srcset'i olmayan küçük görseli tam boy dosyaya çevirir", () => {
    const html = '<a href="/wordpress/media/1.jpg"><img src="/wordpress/media/1-300x200.jpg" width="300" height="200" /></a>';
    expect(galeriGorselleriBuyut(html)).toContain('src="/wordpress/media/1.jpg"');
  });
});

describe("altyazilariAt", () => {
  it("figure içindeki açıklamayı söker, görseli bırakır", () =>
    expect(altyazilariAt('<figure><img src="/medya/a.png" alt="Atölye" /><figcaption>Atölye</figcaption></figure>'))
      .toBe('<figure><img src="/medya/a.png" alt="Atölye" /></figure>'));

  it("altyazısı olmayan gövdeye dokunmaz", () =>
    expect(altyazilariAt("<p>Metin</p>")).toBe("<p>Metin</p>"));
});

/* Şema-göreli adres (5 Eylül 2026 · güvenlik incelemesi): sanitize-html'in
   varsayılanı "//kotu.example" gibi adresleri geçirmek — `allowedSchemes` şema
   taşımayan değere bakmıyor. Haber gövdesi panelden yazıldığı için bu, site
   içi yol kılığında dışarı götüren bir bağlantı demekti. */
describe("temizleyici şema-göreli adresleri atar", () => {
  it("bağlantı ve görselden şema-göreli adresi kaldırır", () => {
    expect(sanitizeRichText('<p><a href="//kotu.example">tık</a></p>')).not.toContain("kotu.example");
    expect(sanitizeRichText('<p><img src="//kotu.example/x.png" /></p>')).not.toContain("kotu.example");
  });

  it("gerçek adresleri geçirmeye devam eder", () => {
    expect(sanitizeRichText('<p><a href="https://ok.example">tık</a></p>')).toContain('href="https://ok.example"');
    expect(sanitizeRichText('<p><a href="/haberler">tık</a></p>')).toContain('href="/haberler"');
    expect(sanitizeRichText('<p><a href="mailto:a@b.example">e</a></p>')).toContain("mailto:a@b.example");
  });
});
