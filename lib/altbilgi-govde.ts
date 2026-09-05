/**
 * ALT BİLGİNİN TİPLERİ VE SÜZGEÇLERİ.
 *
 * lib/altbilgi.ts'ten ayrı duruyor: panelin alt bilgi editörü bir istemci
 * bileşeni ve veritabanına dokunan dosyayı almak postgres sürücüsünü tarayıcı
 * paketine sokardı. Aynı ayrım Hakkında ve zirve tarafında da var.
 */

import { siteIciYolMu } from "./guvenli-adres";

/*
 * Alt bilgideki markalar tek bir sıra: kurum logoları ve GençTek'in kendi
 * yazı markası aynı listede duruyor. Ayrı tutulsalardı sıralamayı panelden
 * değiştirmek mümkün olmazdı — GençTek'in ortada olması bir tasarım kararı,
 * kodun dayattığı bir kural değil.
 */

export type AltbilgiMarkasi = {
  /** "genctek" GençTek yazı markasını basar; "logo" bir kurum logosudur. */
  tur: "genctek" | "logo";
  ad: string;
  logo: string;
  adres: string;
};

export type AltbilgiBaglantisi = { etiket: string; adres: string };

export type Altbilgi = {
  markalar: AltbilgiMarkasi[];
  baglantilar: AltbilgiBaglantisi[];
};

/** Adresler yalnızca site içi yol ya da http(s) olabilir; panelden gelen
    "javascript:" gibi bir değer alt bilgiyi her sayfada tıklama tuzağına
    çevirirdi. */
export function guvenliAltbilgiAdresi(deger: unknown): string {
  const metin = typeof deger === "string" ? deger.trim() : "";
  if (!metin) return "";
  if (siteIciYolMu(metin)) return metin;
  if (metin.startsWith("mailto:")) return metin;
  return /^https?:\/\//i.test(metin) ? metin : "";
}

function yazi(deger: unknown) {
  return typeof deger === "string" ? deger.trim() : "";
}

/** Panelden gelen ve tablodan okunan gövde aynı süzgeçten geçiyor. */
export function altbilgiyiCoz(ham: unknown): Altbilgi {
  const govde = (ham ?? {}) as Record<string, unknown>;
  const markalar = Array.isArray(govde.markalar) ? govde.markalar : [];
  const baglantilar = Array.isArray(govde.baglantilar) ? govde.baglantilar : [];

  return {
    markalar: markalar
      .map((o) => {
        const marka = (o ?? {}) as Record<string, unknown>;
        return {
          tur: marka.tur === "genctek" ? ("genctek" as const) : ("logo" as const),
          ad: yazi(marka.ad),
          logo: guvenliAltbilgiAdresi(marka.logo),
          adres: guvenliAltbilgiAdresi(marka.adres),
        };
      })
      // Adı da logosu da olmayan kurum sütunu boş bir kutu olarak basılırdı.
      .filter((marka) => marka.tur === "genctek" || marka.ad || marka.logo),
    baglantilar: baglantilar
      .map((o) => {
        const baglanti = (o ?? {}) as Record<string, unknown>;
        return { etiket: yazi(baglanti.etiket), adres: guvenliAltbilgiAdresi(baglanti.adres) };
      })
      .filter((baglanti) => baglanti.etiket && baglanti.adres),
  };
}
