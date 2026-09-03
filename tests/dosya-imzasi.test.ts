import { describe, expect, it } from "vitest";
import { dosyaImzasiUyuyorMu } from "@/lib/security/dosya-imzasi";

/*
 * Yüklenen dosyanın içeriği, bildirdiği türle uyuşuyor mu.
 *
 * Asıl korunan senaryo en altta: içeriği HTML olan bir dosyanın image/png
 * etiketiyle geçmesi. Yüklenenler public/ altından siteyle AYNI KÖKENDEN
 * sunuluyor, yani sahte türlü bir dosya sniffing'e açık bir tarayıcıda aynı
 * kökende çalışan içeriğe dönüşebilirdi.
 */

const ascii = (metin: string) => [...metin].map((h) => h.charCodeAt(0));

/** İmzanın ardına dolgu: gerçek dosyalar ilk 12 bayttan uzundur. */
const dosya = (...onek: number[]) =>
  new Uint8Array([...onek, ...new Array(32).fill(0)]);

const PNG = dosya(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const JPEG = dosya(0xff, 0xd8, 0xff, 0xe0);
const WEBP = dosya(...ascii("RIFF"), 0x24, 0, 0, 0, ...ascii("WEBP"));
const GIF = dosya(...ascii("GIF89a"));
const PDF = dosya(...ascii("%PDF-1.7"));
// AVIF'te ilk dört bayt kutu uzunluğudur, sabit değildir; imza 4. bayttan başlar.
const AVIF = dosya(0, 0, 0, 0x20, ...ascii("ftyp"), ...ascii("avif"));
const AVIF_DIZI = dosya(0, 0, 0, 0x20, ...ascii("ftyp"), ...ascii("avis"));

describe("doğru imza kabul edilir", () => {
  it.each([
    ["image/png", PNG],
    ["image/jpeg", JPEG],
    ["image/webp", WEBP],
    ["image/gif", GIF],
    ["image/avif", AVIF],
    ["image/avif", AVIF_DIZI],
    ["application/pdf", PDF],
  ])("%s", (tur, baytlar) => {
    expect(dosyaImzasiUyuyorMu(baytlar, tur).olurMu).toBe(true);
  });
});

describe("uyuşmayan içerik reddedilir", () => {
  it("HTML içerik görsel etiketiyle geçemez", () => {
    const html = new Uint8Array(ascii("<html><script>alert(1)</script>"));
    expect(dosyaImzasiUyuyorMu(html, "image/png").olurMu).toBe(false);
    expect(dosyaImzasiUyuyorMu(html, "image/jpeg").olurMu).toBe(false);
    expect(dosyaImzasiUyuyorMu(html, "application/pdf").olurMu).toBe(false);
  });

  /*
   * SVG yüklemeye zaten kapalı (lib/medya.ts) çünkü içine script gömülebiliyor.
   * Bu test o kararın ikinci kilidini tutuyor: SVG içeriği başka bir görsel
   * türünün etiketiyle de giremez.
   */
  it("SVG içerik başka bir görsel türü etiketiyle geçemez", () => {
    const svg = new Uint8Array(ascii('<svg xmlns="http://www.w3.org/2000/svg">'));
    expect(dosyaImzasiUyuyorMu(svg, "image/png").olurMu).toBe(false);
    expect(dosyaImzasiUyuyorMu(svg, "image/webp").olurMu).toBe(false);
  });

  it("türler birbirinin yerine geçmez", () => {
    expect(dosyaImzasiUyuyorMu(PNG, "image/jpeg").olurMu).toBe(false);
    expect(dosyaImzasiUyuyorMu(PDF, "image/png").olurMu).toBe(false);
    expect(dosyaImzasiUyuyorMu(JPEG, "application/pdf").olurMu).toBe(false);
  });

  /* "RIFF" wav ve avi'de de var; webp kararı 8.–11. bayttaki kap türüne bakar. */
  it("RIFF kabı webp değilse reddedilir", () => {
    const wav = dosya(...ascii("RIFF"), 0x24, 0, 0, 0, ...ascii("WAVE"));
    expect(dosyaImzasiUyuyorMu(wav, "image/webp").olurMu).toBe(false);
  });

  /* ftyp kutusu var ama marka görsel değil (ör. mp4). */
  it("ftyp kabı avif değilse reddedilir", () => {
    const mp4 = dosya(0, 0, 0, 0x20, ...ascii("ftyp"), ...ascii("isom"));
    expect(dosyaImzasiUyuyorMu(mp4, "image/avif").olurMu).toBe(false);
  });
});

describe("kenar durumlar", () => {
  it("boş ve kısa dosya taşma vermeden reddedilir", () => {
    expect(dosyaImzasiUyuyorMu(new Uint8Array(), "image/png").olurMu).toBe(false);
    expect(
      dosyaImzasiUyuyorMu(new Uint8Array([0x89, 0x50]), "image/png").olurMu,
    ).toBe(false);
  });

  /*
   * İmza dosyanın BAŞINDA aranır. "Başta bir yerde" demek, saldırganın
   * istediği içeriğin önüne dolgu koyup geçmesine izin vermekti.
   */
  it("imzanın önüne dolgu konmuş dosya reddedilir", () => {
    const dolgulu = new Uint8Array([0, 0, ...ascii("%PDF-1.7")]);
    expect(dosyaImzasiUyuyorMu(dolgulu, "application/pdf").olurMu).toBe(false);
  });

  /*
   * TANINMAYAN TÜR REDDEDİLİR: kabul listesine yeni bir tür eklemek, imzası
   * yazılmadan kontrolü o tür için sessizce kapatmamalı.
   */
  it("tabloda olmayan tür doğrulanamadığı için reddedilir", () => {
    const karar = dosyaImzasiUyuyorMu(PNG, "image/svg+xml");
    expect(karar.olurMu).toBe(false);
    expect(karar.neden).toMatch(/doğrulanamıyor/);
  });
});
