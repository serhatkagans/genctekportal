/**
 * YARDIMLAŞMA GRUPLARININ TİPLERİ VE SÜZGEÇLERİ.
 *
 * lib/yardimlasma.ts'ten ayrı: o dosya `postgres` sürücüsünü içeri alıyor ve
 * panelin editörü bir istemci bileşeni. Aynı ayrım Hakkında, zirve ve alt bilgi
 * tarafında da var.
 */

import { siteIciYolMu } from "./guvenli-adres";

export type YardimlasmaGrubu = {
  id: string;
  slug: string;
  ad: string;
  gorsel: string;
  metin: string;
  yayinda: boolean;
};

/** Tabloda gövde tek bir JSONB nesnesi: kart görseli ve tanıtım metni. */
export type YardimlasmaGovdesi = { gorsel: string; metin: string };

export function guvenliYardimlasmaAdresi(deger: unknown): string {
  const metin = typeof deger === "string" ? deger.trim() : "";
  if (!metin) return "";
  if (siteIciYolMu(metin)) return metin;
  return /^https?:\/\//i.test(metin) ? metin : "";
}

/** Panelden gelen ve tablodan okunan gövde aynı süzgeçten geçiyor. */
export function yardimlasmaGovdesiniCoz(ham: unknown): YardimlasmaGovdesi {
  const govde = (ham ?? {}) as Record<string, unknown>;
  return {
    gorsel: guvenliYardimlasmaAdresi(govde.gorsel),
    metin: typeof govde.metin === "string" ? govde.metin : "",
  };
}

/** Metin boş satırlarla paragraflara bölünüyor; editörde tek kutuya yazılıyor. */
export function yardimlasmaParagraflari(metin: string) {
  return metin.split(/\n{2,}/).map((parca) => parca.trim()).filter(Boolean);
}
