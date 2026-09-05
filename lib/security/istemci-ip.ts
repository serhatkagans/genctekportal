import { createHmac } from "node:crypto";

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

/*
 * ÖZET ARTIK ANAHTARLI (HMAC) — DÜZ SHA-256 KORUMA SAYILMIYOR
 * (5 Eylül 2026 · güvenlik incelemesi).
 *
 * Ham IP saklanmıyor, denetim kaydına özeti yazılıyor; amaç KVKK tarafında
 * ziyaretçinin adresini veritabanında açıkta bırakmamak. Ama düz
 * `sha256(ip)` bunu SAĞLAMIYOR: IPv4'te yalnızca 2^32 olası değer var,
 * hepsinin özeti sıradan bir makinede dakikalar içinde çıkarılıp tabloya
 * bakılır. Yani veritabanını eline geçiren biri her satırın gerçek IP'sini
 * geri okuyabiliyordu — özet, adresi gizlemiyor yalnızca gizliyormuş gibi
 * duruyordu.
 *
 * HMAC sunucudaki gizli anahtarla üretiliyor; anahtar olmadan sözlük saldırısı
 * kurulamaz. Anahtar yoksa FIRLATIYORUZ: sessizce anahtarsız özete düşmek,
 * kapatılan açığı üretimde geri açardı. `SESSION_SECRET` zaten hem yerelde hem
 * sunucuda tanımlı ve dağıtımın önkoşulu.
 *
 * ETİKET ("ip-ozeti-v1") aynı gizli anahtarın başka bir amaçla üretilmiş
 * özetiyle karışmasın diye; ayrıca ileride anahtar döndürülürse sürüm burada
 * artar.
 *
 * ESKİ SATIRLAR DÖNÜŞTÜRÜLMÜYOR: özetin ham hâli elimizde olmadığı için
 * mümkün de değil. `ipHash` hiçbir yerde KARŞILAŞTIRILMIYOR (yalnızca yazılıp
 * ekranda gösteriliyor), dolayısıyla eski ve yeni satırların farklı biçimde
 * olması bir şeyi bozmuyor. Hız sınırı anahtarları zaten geçici.
 */
const IP_ETIKETI = "ip-ozeti-v1";

export function ipOzeti(ip: string | null): string | null {
  if (!ip) return null;
  const gizli = process.env.SESSION_SECRET ?? "";
  if (!gizli) {
    throw new Error("SESSION_SECRET tanımlı değil; IP özeti anahtarsız üretilemez.");
  }
  return createHmac("sha256", `${IP_ETIKETI}:${gizli}`).update(ip, "utf8").digest("hex").slice(0, 32);
}
