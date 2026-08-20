import type { OturumKullanicisi } from "@/lib/auth/oturum";
import { prisma } from "@/lib/db";

export async function gorunurFaaliyetGetir(kullanici: OturumKullanicisi, id: string) {
  const tumIlleriGorebilir = kullanici.roller.some((rol) =>
    rol === "SYSTEM_ADMIN" || rol === "CONTENT_MANAGER" || rol === "AUDITOR");
  return prisma.event.findFirst({
    where: {
      id,
      ...(tumIlleriGorebilir ? {} : { provinceCode: kullanici.ilKodu ?? "__YOK__" }),
    },
  });
}

export function faaliyetKapsamiCikar(faaliyet: { provinceCode: string | null }) {
  return { ilKodu: faaliyet.provinceCode };
}
