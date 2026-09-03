import { createOpaqueToken } from "./tokens";

export const IDLE_MS = 30 * 60 * 1000;
export const ABSOLUTE_MS = 12 * 60 * 60 * 1000;

// Boşta kalma sayacı her istekte sıfırlanıyor; ama her istekte bir UPDATE
// yazmak da gereksiz. Tek bir sayfa açılışı onlarca sunucu bileşeninden
// oturumu sorabiliyor. Son görülme bu aralıktan yeniyse yazma atlanıyor:
// 30 dakikalık pencerede bir dakikalık sapmanın karşılığı yok.
export const TAZELEME_ARALIGI_MS = 60 * 1000;

/*
 * `csrfToken`/`csrfHash` ÜRETİLİYOR AMA HİÇBİR YERDE DOĞRULANMIYOR — bu bir
 * unutkanlık değil, bilinçli bir durum (3 Eylül 2026 · dış güvenlik
 * incelemesinde soruldu).
 *
 * CSRF'e karşı fiilen çalışan koruma iki yerde: Next sunucu eylemlerinde
 * Origin↔Host kontrolünü kendisi yapıyor, POST kabul eden iki route handler'da
 * ise aynı kontrol elle uygulanıyor (lib/security/koken.ts).
 *
 * Jetonun bunlara EKLEYECEĞİ bir şey yok: portal aiotechs.cloud/genctekportal
 * adresinde ve komşu uygulamalar aynı HOST üzerinde. Aynı köken tarayıcı için
 * tek bir güven alanıdır — oradaki bir sayfa portalın yanıtlarını okuyabilir ve
 * çerezlerini görebilir, yani jetonu da elde eder. Jeton yalnızca farklı
 * kökenden gelen isteği durdurur, onu da köken kontrolü zaten durduruyor.
 *
 * Alanlar YİNE DE KALDIRILMADI: portal kendi alt alan adına taşındığı gün
 * (gerçek ayrımın tek yolu budur) jeton anlamlı hâle gelir ve altyapısı hazır
 * durur. Kaldırılırsa o gün sıfırdan yazılması gerekirdi.
 */
export function createSessionMaterial(now = new Date()) {
  const session = createOpaqueToken(32);
  const csrf = createOpaqueToken(32);
  return {
    id: session.token,
    idHash: session.hash,
    csrfToken: csrf.token,
    csrfHash: csrf.hash,
    issuedAt: now,
    idleExpiresAt: new Date(now.getTime() + IDLE_MS),
    expiresAt: new Date(now.getTime() + ABSOLUTE_MS),
  };
}

export function isSessionActive(session: { idleExpiresAt: Date; expiresAt: Date; revokedAt?: Date | null }, now = new Date()) {
  return !session.revokedAt && session.idleExpiresAt > now && session.expiresAt > now;
}

// secure her ortamda açık: "__Host-" öneki Secure zorunlu kılar, aksi halde
// tarayıcı çerezi tümden reddeder ve giriş sessizce başarısız olur. Tarayıcılar
// http://localhost'u güvenli köken saydığı için geliştirmede de çalışır.
//
// Ad portala özel: "__Host-" öneki path="/" zorunlu kıldığı için çerez, alan
// adındaki bütün uygulamalara gider. aiotechs.cloud'da başka uygulamalar da
// barınıyor; genel bir ad kullanılsaydı onların oturum çerezini ezerdi.
export const sessionCookie = {
  name: "__Host-genctekportal_session",
  options: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: ABSOLUTE_MS / 1000 },
};
