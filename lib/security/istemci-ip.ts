import { createHash } from "node:crypto";

/*
 * X-FORWARDED-FOR SONDAN OKUNUR, BAŞTAN DEĞİL (3 Eylül 2026).
 *
 * Başlık ilk öğesinden okunuyordu ve o öğe İSTEMCİNİN yazdığı değerdi.
 * Sebep Apache'nin davranışı: ProxyPass bu başlığı EZMEZ, sonuna EKLER.
 * Dış istemci `X-Forwarded-For: 1.2.3.4` gönderdiğinde uygulamaya
 * "1.2.3.4, <gerçek-ip>" geliyor, ilk öğeyi alan kod da saldırganın
 * uydurduğu adresi gerçek sanıyordu.
 *
 * İki somut sonucu vardı: hız sınırı (giriş ve başvuru, ikisi de 5/15dk)
 * her istekte başlığı değiştirerek atlatılabiliyordu, ve AuthEvent ile
 * Submission.ipOzeti denetim kayıtlarına uydurma özet yazılıyordu.
 *
 * SON öğe doğru olanıdır çünkü zincire başlığı en son ekleyen, kendisine
 * bağlanan tarafı gören TEK güvenilir vekildir. Bu kurulumda o vekil
 * Apache; başka bir katman (Cloudflare vb.) yok, uygulama da yalnızca
 * 127.0.0.1:3011'i dinliyor — yani zincire dışarıdan öğe eklenemez.
 * Araya ikinci bir vekil girerse bu dosya güncellenmelidir.
 */
export function istemciIp(basliklar: Headers): string | null {
  const ham = basliklar.get("x-forwarded-for");
  if (!ham) return null;
  // Boş öğeler atılıyor: sondaki virgül ("1.2.3.4, ") son öğeyi boş yapardı.
  const zincir = ham.split(",").map((oge) => oge.trim()).filter(Boolean);
  return zincir.at(-1) ?? null;
}

// Ham IP saklanmıyor; oran sınırı ve denetim kaydı için özeti yeterli.
export function ipOzeti(ip: string | null): string | null {
  return ip ? createHash("sha256").update(ip, "utf8").digest("hex").slice(0, 32) : null;
}
