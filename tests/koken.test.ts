import { describe, expect, it } from "vitest";
import { istekKokeniGecerliMi } from "@/lib/security/koken";

/*
 * Route handler'lardaki köken kontrolü. Next sunucu eylemlerinde bu kontrolü
 * kendisi yapıyor; POST kabul eden iki ucumuz (medya yükleme ve başvuru) route
 * handler olduğu için o korumanın dışındaydı.
 *
 * Kontrolün SINIRI da burada çiviliyor: Origin yol taşımaz, dolayısıyla aynı
 * host'taki komşu uygulama bu kontrol için aynı kökendir. Bunu bilerek kabul
 * ediyoruz (gerekçe lib/security/koken.ts başlığında) ve test bunu açıkça
 * yazıyor ki ileride "kontrol çalışmıyor" diye okunmasın.
 */

const SITE = "https://aiotechs.cloud/genctekportal";

function basliklar(kayit: Record<string, string>) {
  return new Headers(kayit);
}

describe("kendi sitesinden gelen istek", () => {
  it("site adresiyle aynı köken geçer", () => {
    const karar = istekKokeniGecerliMi(
      basliklar({ origin: "https://aiotechs.cloud" }),
      SITE,
    );
    expect(karar.gecerliMi).toBe(true);
  });

  it("host başlığıyla eşleşen köken geçer", () => {
    const karar = istekKokeniGecerliMi(
      basliklar({ origin: "https://ornek.test", host: "ornek.test" }),
      SITE,
    );
    expect(karar.gecerliMi).toBe(true);
  });

  it("x-forwarded-host ile eşleşen köken geçer", () => {
    const karar = istekKokeniGecerliMi(
      basliklar({
        origin: "https://ornek.test",
        "x-forwarded-host": "ornek.test, ic-vekil.local",
      }),
      SITE,
    );
    expect(karar.gecerliMi).toBe(true);
  });
});

describe("reddedilen istekler", () => {
  it("başka alan adından gelen istek reddedilir", () => {
    const karar = istekKokeniGecerliMi(
      basliklar({ origin: "https://kotu-site.example", host: "aiotechs.cloud" }),
      SITE,
    );
    expect(karar.gecerliMi).toBe(false);
    expect(karar.sebep).toMatch(/ait değil/);
  });

  /*
   * ORIGIN YOKSA REDDEDİLİR (fail-closed). Tarayıcılar POST'ta bu başlığı her
   * zaman yollar; başlığı hiç göndermemek, kontrolü atlamanın en kolay yolu
   * olurdu.
   */
  it("Origin başlığı olmayan istek reddedilir", () => {
    const karar = istekKokeniGecerliMi(basliklar({ host: "aiotechs.cloud" }), SITE);
    expect(karar.gecerliMi).toBe(false);
    expect(karar.sebep).toMatch(/Origin başlığı yok/);
  });

  it("çözümlenemeyen Origin reddedilir", () => {
    expect(
      istekKokeniGecerliMi(basliklar({ origin: "bu-bir-adres-degil" }), SITE)
        .gecerliMi,
    ).toBe(false);
  });

  it("alt alan adı ayrı bir kökendir, geçmez", () => {
    expect(
      istekKokeniGecerliMi(
        basliklar({ origin: "https://baska.aiotechs.cloud" }),
        SITE,
      ).gecerliMi,
    ).toBe(false);
  });

  it("port farkı ayrı bir kökendir, geçmez", () => {
    expect(
      istekKokeniGecerliMi(
        basliklar({ origin: "https://aiotechs.cloud:8443" }),
        SITE,
      ).gecerliMi,
    ).toBe(false);
  });
});

describe("kontrolün bilinen sınırı", () => {
  /*
   * Origin şema+host+porttur, YOL İÇERMEZ. aiotechs.cloud/baska-uygulama
   * adresindeki bir sayfa bu kontrol için aynı kökendir ve GEÇER. Bu bir
   * eksiklik değil, kontrolün doğası: aynı köken tarayıcı için tek bir güven
   * alanıdır ve bir CSRF jetonu da bunu değiştirmez. Gerçek ayrım portalı
   * kendi alt alan adına taşımakla kurulur.
   */
  it("aynı host'taki başka bir uygulamanın isteği geçer — jeton da bunu çözmez", () => {
    const karar = istekKokeniGecerliMi(
      basliklar({ origin: "https://aiotechs.cloud", host: "aiotechs.cloud" }),
      SITE,
    );
    expect(karar.gecerliMi).toBe(true);
  });
});
