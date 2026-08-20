import * as OTPAuth from "otpauth";
import { randomBytes, createHash } from "node:crypto";

export function createTotpEnrollment(email: string) {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({ issuer: "GençTek", label: email, algorithm: "SHA1", digits: 6, period: 30, secret });
  return { secret: secret.base32, uri: totp.toString() };
}

export function verifyTotp(secret: string, token: string) {
  if (!/^\d{6}$/.test(token)) return false;
  const totp = new OTPAuth.TOTP({ issuer: "GençTek", algorithm: "SHA1", digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) });
  return totp.validate({ token, window: 1 }) !== null;
}

export function createRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => randomBytes(6).toString("hex").toUpperCase().match(/.{1,4}/g)!.join("-"));
}

export function hashRecoveryCode(code: string) {
  return createHash("sha256").update(code.replaceAll("-", "").toUpperCase()).digest("hex");
}
