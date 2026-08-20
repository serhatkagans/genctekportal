import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Başvurulardaki doğrudan iletişim bilgileri (telefon, e-posta) veritabanında
// açık durmasın diye AES-256-GCM ile şifrelenir. Anahtar .env'deki
// DATA_ENCRYPTION_KEY; base64 çözülmüş hâli 32 bayt olmalı.
const ONEK = "enc:v1:";

let onbellek: Buffer | null = null;

function anahtar(): Buffer {
  if (onbellek) return onbellek;
  const ham = process.env.DATA_ENCRYPTION_KEY ?? "";
  const cozulmus = Buffer.from(ham, "base64");
  if (cozulmus.length < 32) {
    throw new Error("DATA_ENCRYPTION_KEY en az 32 bayt (base64) olmalı.");
  }
  onbellek = cozulmus.subarray(0, 32);
  return onbellek;
}

export function sifrelenmisMi(deger: string) {
  return deger.startsWith(ONEK);
}

export function sifrele(acikMetin: string): string {
  if (!acikMetin) return "";
  const iv = randomBytes(12);
  const sifreleyici = createCipheriv("aes-256-gcm", anahtar(), iv);
  const govde = Buffer.concat([sifreleyici.update(acikMetin, "utf8"), sifreleyici.final()]);
  const etiket = sifreleyici.getAuthTag();
  return ONEK + Buffer.concat([iv, etiket, govde]).toString("base64");
}

// Çözülemezse (anahtar değişmiş, veri bozulmuş) istisna fırlatmak yerine null
// döner; ekran "çözülemedi" yazar, tek bir kayıt yüzünden liste patlamaz.
export function coz(deger: string): string | null {
  if (!deger) return "";
  if (!sifrelenmisMi(deger)) return deger;
  try {
    const ham = Buffer.from(deger.slice(ONEK.length), "base64");
    const iv = ham.subarray(0, 12);
    const etiket = ham.subarray(12, 28);
    const govde = ham.subarray(28);
    const cozucu = createDecipheriv("aes-256-gcm", anahtar(), iv);
    cozucu.setAuthTag(etiket);
    return Buffer.concat([cozucu.update(govde), cozucu.final()]).toString("utf8");
  } catch {
    return null;
  }
}
