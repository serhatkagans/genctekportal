import argon2 from "argon2";

const COMMON_PASSWORDS = new Set([
  "password1234", "123456789012", "qwerty123456", "admin12345678",
  "genctek123456", "turkiye123456", "letmein123456",
]);

export type PasswordCheck = { valid: boolean; errors: string[] };

export function validatePassword(password: string): PasswordCheck {
  const errors: string[] = [];
  if (password.length < 12) errors.push("Parola en az 12 karakter olmalıdır.");
  if (password.length > 128) errors.push("Parola en fazla 128 karakter olabilir.");
  if (COMMON_PASSWORDS.has(password.toLocaleLowerCase("tr-TR"))) errors.push("Bu parola yaygın parola listesinde bulunuyor.");
  return { valid: errors.length === 0, errors };
}

export async function hashPassword(password: string) {
  const check = validatePassword(password);
  if (!check.valid) throw new Error(check.errors.join(" "));
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string) {
  try { return await argon2.verify(hash, password); } catch { return false; }
}
