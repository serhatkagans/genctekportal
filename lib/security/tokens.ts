import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createOpaqueToken(bytes = 32) {
  const token = randomBytes(bytes).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function tokenMatches(token: string, expectedHash: string) {
  const actual = Buffer.from(hashToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createReference(prefix = "GT") {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${prefix}-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}
