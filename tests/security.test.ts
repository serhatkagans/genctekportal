import { describe, expect, it } from "vitest";
import { hashPassword, validatePassword, verifyPassword } from "../lib/security/password";
import { createOpaqueToken, tokenMatches } from "../lib/security/tokens";
import { createSessionMaterial, isSessionActive } from "../lib/security/session";
import { createRecoveryCodes, createTotpEnrollment, hashRecoveryCode } from "../lib/security/totp";

describe("credential security", () => {
  it("rejects short and common passwords", () => {
    expect(validatePassword("short").valid).toBe(false);
    expect(validatePassword("password1234").valid).toBe(false);
  });
  it("hashes passwords with Argon2id", async () => {
    const hash = await hashPassword("uzun-ve-benzersiz-bir-parola");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(hash, "uzun-ve-benzersiz-bir-parola")).toBe(true);
    expect(await verifyPassword(hash, "yanlis-parola")).toBe(false);
  });
  it("stores opaque tokens as hashes", () => {
    const value = createOpaqueToken();
    expect(value.token).not.toBe(value.hash);
    expect(tokenMatches(value.token, value.hash)).toBe(true);
    expect(tokenMatches("wrong", value.hash)).toBe(false);
  });
});

describe("sessions and MFA material", () => {
  it("enforces idle and absolute expiry", () => {
    const now = new Date("2026-08-01T10:00:00Z"); const session = createSessionMaterial(now);
    expect(isSessionActive(session, new Date("2026-08-01T10:20:00Z"))).toBe(true);
    expect(isSessionActive(session, new Date("2026-08-01T10:31:00Z"))).toBe(false);
  });
  it("creates unique recovery codes and a TOTP URI", () => {
    const codes = createRecoveryCodes(); const enrollment = createTotpEnrollment("admin@example.org");
    expect(new Set(codes).size).toBe(8);
    expect(hashRecoveryCode(codes[0])).toHaveLength(64);
    expect(enrollment.uri).toContain("otpauth://totp/");
  });
});
