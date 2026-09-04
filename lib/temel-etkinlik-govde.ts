/**
 * TEMEL ETKİNLİK KAYITLARININ TİPLERİ VE SÜZGEÇLERİ.
 *
 * lib/temel-etkinlik.ts'ten ayrı: o dosya `postgres` sürücüsünü içeri alıyor ve
 * panelin editörü bir istemci bileşeni. Hakkında, zirve, alt bilgi ve
 * yardımlaşma taraflarındaki aynı ayrım.
 */

export type EtkinlikGorseli = { url: string; alt: string };

/** İki liste var ve ayrı ayrı sıralanıyor: "Temel GençTek Etkinlikleri"
    sayfasındaki program ailesi ile çalışma grubu etkinlikleri. */
export type EtkinlikListesi = "temel" | "grup";

export type TemelEtkinlik = {
  id: string;
  slug: string;
  ad: string;
  liste: EtkinlikListesi;
  aciklama: string;
  gorseller: EtkinlikGorseli[];
  yayinda: boolean;
};

export type EtkinlikGovdesi = { aciklama: string; gorseller: EtkinlikGorseli[] };

export function guvenliEtkinlikAdresi(deger: unknown): string {
  const metin = typeof deger === "string" ? deger.trim() : "";
  if (!metin) return "";
  if (metin.startsWith("/")) return metin;
  return /^https?:\/\//i.test(metin) ? metin : "";
}

/** Panelden gelen ve tablodan okunan gövde aynı süzgeçten geçiyor. */
export function etkinlikGovdesiniCoz(ham: unknown): EtkinlikGovdesi {
  const govde = (ham ?? {}) as Record<string, unknown>;
  const gorseller = Array.isArray(govde.gorseller) ? govde.gorseller : [];
  return {
    aciklama: typeof govde.aciklama === "string" ? govde.aciklama : "",
    gorseller: gorseller
      .map((o) => {
        const gorsel = (o ?? {}) as Record<string, unknown>;
        return {
          url: guvenliEtkinlikAdresi(gorsel.url),
          alt: typeof gorsel.alt === "string" ? gorsel.alt : "",
        };
      })
      // Adresi elenen kare basılmaz: boş src ile <img> kartı bozuyor.
      .filter((gorsel) => gorsel.url),
  };
}

/*
 * Açıklama tek bir uzun metin; sayfada boş satırlardan bölünüyor. Kısa parçalar
 * ara başlık sayılıyor (60 karakterin altı) — YEĞİTEK metinleri bu biçimde
 * geldi ve dosya sürümünden beri böyle basılıyor.
 */
export function aciklamaParcalari(aciklama: string) {
  return aciklama
    .split(/\n{2,}/)
    .map((parca) => parca.trim())
    .filter(Boolean)
    .map((metin) => ({ metin, baslikMi: metin.length < 60 }));
}

/** Kartlarda tek satırlık tanıtım: ara başlıklar atlanır, ilk paragraf alınır. */
export function aciklamaOzeti(aciklama: string) {
  return aciklamaParcalari(aciklama).find((parca) => !parca.baslikMi)?.metin ?? "";
}
