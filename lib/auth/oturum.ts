import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RoleCode } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sessionCookie } from "@/lib/security/session";
import { hashToken } from "@/lib/security/tokens";

export interface OturumKullanicisi {
  id: string;
  adSoyad: string;
  ilKodu: string | null;
  roller: RoleCode[];
}

// Yönlendirmeyen biçim: çerezin varlığı değil, oturumun gerçekten geçerli olması
// sorulur. Giriş sayfası ile korunan sayfalar aynı yanıta bakmak zorunda —
// biri "çerez var" deyip diğeri "oturum geçersiz" derse ikisi birbirine
// yönlendirir ve sayfa sonsuz yenilenir.
export async function oturumKullanicisi(): Promise<OturumKullanicisi | null> {
  const depo = await cookies();
  const token = depo.get(sessionCookie.name)?.value;
  if (!token) return null;

  const now = new Date();
  const oturum = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: { include: { roles: true } } },
  });
  if (!oturum || oturum.revokedAt || oturum.idleExpiresAt <= now || oturum.expiresAt <= now) {
    return null;
  }

  return {
    id: oturum.user.id,
    adSoyad: oturum.user.name,
    ilKodu: oturum.user.provinceCode,
    roller: oturum.user.roles.map((kayit) => kayit.role),
  };
}

export async function oturumKullanicisiZorunlu(): Promise<OturumKullanicisi> {
  const kullanici = await oturumKullanicisi();
  if (!kullanici) redirect("/giris");
  return kullanici;
}
