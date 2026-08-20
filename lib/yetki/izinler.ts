import type { OturumKullanicisi } from "@/lib/auth/oturum";

export function faaliyetRaporuYazabilirMi(
  kullanici: OturumKullanicisi,
  kapsam: { ilKodu: string | null },
): boolean {
  if (kullanici.roller.some((rol) => rol === "SYSTEM_ADMIN" || rol === "CONTENT_MANAGER")) return true;
  const raporRoluVar = kullanici.roller.some((rol) => rol === "FORM_REVIEWER");
  return raporRoluVar && Boolean(kullanici.ilKodu) && kullanici.ilKodu === kapsam.ilKodu;
}
