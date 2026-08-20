import { createOpaqueToken } from "./tokens";

export const IDLE_MS = 30 * 60 * 1000;
export const ABSOLUTE_MS = 12 * 60 * 60 * 1000;

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
