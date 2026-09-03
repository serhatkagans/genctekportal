import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "../lib/content-services/sanitize";
import { ekDosyaYolu } from "../lib/forms/basvuru";
import { gorselKaydet } from "../lib/medya";
import { participationSchema } from "../lib/validation/participation";

describe("Güvenlik Testleri — XSS (Cross-Site Scripting) Koruması", () => {
  it("<script> etiketlerini ve içeriklerini tamamen temizler", () => {
    const kirli = '<p>Normal metin <script>alert("xss")</script></p>';
    const temiz = sanitizeRichText(kirli);
    expect(temiz).not.toContain("<script>");
    expect(temiz).not.toContain("alert");
  });

  it("HTML özniteliklerine enjekte edilen olay yakalayıcıları (onerror, onload, onclick) temizler", () => {
    const kirli = '<img src="resim.jpg" onerror="alert(\'xss\')" onload="doEvil()" />';
    const temiz = sanitizeRichText(kirli);
    expect(temiz).not.toContain("onerror");
    expect(temiz).not.toContain("onload");
    expect(temiz).not.toContain("alert");
  });

  it("javascript: ve data: URI şemalarını bağlantılardan temizler", () => {
    const kirli = '<a href="javascript:alert(1)">Tıklayınız</a> <a href="data:text/html,<script>alert(1)</script>">Bağlantı</a>';
    const temiz = sanitizeRichText(kirli);
    expect(temiz).not.toContain("javascript:");
    expect(temiz).not.toContain("data:text/html");
  });

  it("İzin verilmeyen dış iframe kaynaklarını engeller (yalnızca YouTube izinli)", () => {
    const zararliIframe = '<iframe src="https://saldirgan-site.com/zararli-kod"></iframe>';
    const temizZararli = sanitizeRichText(zararliIframe);
    expect(temizZararli).not.toContain("saldirgan-site.com");

    const guvenliIframe = '<iframe src="https://www.youtube.com/embed/ornek123"></iframe>';
    const temizGuvenli = sanitizeRichText(guvenliIframe);
    expect(temizGuvenli).toContain("https://www.youtube.com/embed/ornek123");
  });

  it("SVG ve potansiyel zararlı XML gömülü kodları temizler", () => {
    const kirli = '<svg><script>alert("svg xss")</script></svg>';
    const temiz = sanitizeRichText(kirli);
    expect(temiz).not.toContain("<svg>");
    expect(temiz).not.toContain("<script>");
  });
});

describe("Güvenlik Testleri — Dizin Dolaşımı (Path Traversal) Koruması", () => {
  it(".. ve göreceli yollarla dosya kök dizini dışına çıkışı engeller", () => {
    expect(ekDosyaYolu("../../etc/passwd")).toBeNull();
    expect(ekDosyaYolu("..\\..\\Windows\\System32\\cmd.exe")).toBeNull();
    expect(ekDosyaYolu("sub/../../../secret.txt")).toBeNull();
  });

  it("Yalnızca güvenli depo anahtarlarına ve alt dizinlere izin verir", () => {
    const guvenliYol = ekDosyaYolu("basvuru-123/belge-abc.pdf");
    expect(guvenliYol).not.toBeNull();
    expect(guvenliYol).toContain("basvuru-ekleri");
  });
});

describe("Güvenlik Testleri — Dosya Yükleme Güvenliği", () => {
  it("Zararlı betik içerebilecek SVG dosyalarının yüklenmesini reddeder", async () => {
    const dosya = new File(["<svg></svg>"], "test.svg", { type: "image/svg+xml" });
    const sonuc = await gorselKaydet(dosya);
    expect(sonuc.tamam).toBe(false);
    if (!sonuc.tamam) {
      expect(sonuc.hata).toContain("Yalnızca PNG, JPEG, WebP, AVIF ve GIF");
    }
  });

  it("Çalıştırılabilir veya zararlı uzantıları (.exe, .php, .js) reddeder", async () => {
    const dosya = new File(["echo 1;"], "shell.php", { type: "application/x-php" });
    const sonuc = await gorselKaydet(dosya);
    expect(sonuc.tamam).toBe(false);
  });

  it("8 MB sınırını aşan dosyaları reddeder", async () => {
    // 9 MB dosya simülasyonu
    const devasaVeri = new Uint8Array(9 * 1024 * 1024);
    const dosya = new File([devasaVeri], "buyuk.png", { type: "image/png" });
    const sonuc = await gorselKaydet(dosya);
    expect(sonuc.tamam).toBe(false);
    if (!sonuc.tamam) {
      expect(sonuc.hata).toContain("sınırını aşıyor");
    }
  });
});

describe("Güvenlik Testleri — Form ve Bot Koruması", () => {
  it("Honeypot tuzağı (website alanı) doldurulduğunda formu geçersiz kılar", () => {
    const veri = {
      applicantType: "STUDENT",
      studentName: "Ahmet Yılmaz",
      studentPhone: "+90 555 123 45 67",
      studentEmail: "ahmet@example.com",
      institution: "Örnek Lise",
      province: "Ankara",
      district: "Çankaya",
      workDescription: "Yapay zeka ve robotik alanında projeler geliştiriyorum.",
      consent: "on",
      website: "http://spam-bot.com", // Bot doldurdu
      startedAt: Date.now() - 5000,
    };
    const sonuc = participationSchema.safeParse(veri);
    expect(sonuc.success).toBe(false);
  });

  it("Geçersiz telefon formatı veya e-posta girildiğinde reddeder", () => {
    const veri = {
      applicantType: "STUDENT",
      studentName: "Ahmet Yılmaz",
      studentPhone: "05551234567", // +90 formatı değil
      studentEmail: "gecersiz-eposta",
      institution: "Örnek Lise",
      province: "Ankara",
      district: "Çankaya",
      workDescription: "Yapay zeka ve robotik alanında projeler geliştiriyorum.",
      consent: "on",
      website: "",
      startedAt: Date.now() - 5000,
    };
    const sonuc = participationSchema.safeParse(veri);
    expect(sonuc.success).toBe(false);
  });
});
