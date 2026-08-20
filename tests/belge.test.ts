import { describe, expect, it } from "vitest";
import {
  aliciAdiniCoz,
  belgeMetniUret,
  belgeTuruMu,
} from "../lib/belge/kurallar";

describe("belge kuralları", () => {
  it("yalnızca tanımlı belge türlerini kabul eder", () => {
    expect(belgeTuruMu("KATILIM")).toBe(true);
    expect(belgeTuruMu("TESEKKUR")).toBe(true);
    expect(belgeTuruMu("BASKA")).toBe(false);
  });

  it("alıcı adını temizler ve 120 karakter sınırını uygular", () => {
    expect(aliciAdiniCoz("  Ayşe   Yılmaz ")).toEqual({ olurMu: true, adSoyad: "Ayşe Yılmaz" });
    expect(aliciAdiniCoz("a".repeat(121)).olurMu).toBe(false);
  });

  it("özel metni tüm kalıp metnin yerine kullanır", () => {
    const belge = belgeMetniUret({
      tur: "TESEKKUR",
      adSoyad: "Ayşe Yılmaz",
      faaliyetAdi: "Örnek Atölye",
      tarihMetni: "1 Ağustos 2026",
      ozelMetin: "Değerli katkıları için.",
    });
    expect(belge.govde).toBe("Değerli katkıları için.");
    expect(belge.baslik).toBe("Teşekkür Belgesi");
  });
});
