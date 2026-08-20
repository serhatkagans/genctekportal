export const BELGE_TURLERI = ["KATILIM", "TESEKKUR"] as const;
export type BelgeTuru = (typeof BELGE_TURLERI)[number];

export const BELGE_TURU_ETIKETLERI: Record<BelgeTuru, string> = {
  KATILIM: "Katılım Belgesi",
  TESEKKUR: "Teşekkür Belgesi",
};

export function belgeTuruMu(deger: string): deger is BelgeTuru {
  return BELGE_TURLERI.some((tur) => tur === deger);
}

export interface BelgeMetni {
  baslik: string;
  adSoyad: string;
  govde: string;
  tarihMetni: string;
}

export function belgeMetniUret(girdi: {
  tur: BelgeTuru;
  adSoyad: string;
  faaliyetAdi: string;
  tarihMetni: string;
  ozelMetin?: string | null;
}): BelgeMetni {
  const ozelMetin = girdi.ozelMetin?.trim();
  return {
    baslik: BELGE_TURU_ETIKETLERI[girdi.tur],
    adSoyad: girdi.adSoyad,
    govde: ozelMetin || (girdi.tur === "KATILIM"
      ? `${girdi.faaliyetAdi} faaliyetine katılımından dolayı bu belgeyi almaya hak kazanmıştır.`
      : `${girdi.faaliyetAdi} faaliyetindeki değerli katkıları için teşekkür ederiz.`),
    tarihMetni: girdi.tarihMetni,
  };
}

export function aliciAdiniCoz(ham: string):
  | { olurMu: true; adSoyad: string }
  | { olurMu: false; neden: string } {
  const adSoyad = ham.trim().replace(/\s+/g, " ");
  if (!adSoyad) return { olurMu: false, neden: "Alıcı adı boş olamaz." };
  if (adSoyad.length > 120) return { olurMu: false, neden: "Alıcı adı 120 karakteri aşamaz." };
  return { olurMu: true, adSoyad };
}
