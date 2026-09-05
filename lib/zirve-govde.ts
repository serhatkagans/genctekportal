/**
 * ZİRVE SAYFALARININ TİPLERİ VE SÜZGEÇLERİ.
 *
 * lib/zirve.ts'ten ayrıldı (4 Eylül 2026): o dosya artık `postgres` sürücüsünü
 * içeri alıyor ve panelin zirve editörü bir istemci bileşeni — tipleri oradan
 * almak sürücüyü tarayıcı paketine sokup derlemeyi durdururdu. Burada
 * veritabanına dokunan hiçbir şey yok. Aynı ayrım Hakkında tarafında da var
 * (bkz. lib/hakkinda-govde.ts).
 */

import { siteIciYolMu } from "./guvenli-adres";

export type ZirveGorseli = { url: string; alt: string };

/**
 * Zirve videosu. Dosyalar `public/video` altında ve DEPODA DEĞİL — 200 MB'lık
 * bir mp4 her klonlamaya eklenirdi (bkz. .gitignore'daki medya kararı).
 * Sunucuda `/opt/genctekportal/public/video` içinde duruyor.
 */
export type ZirveVideosu = { url: string; kapak?: string; baslik: string };

export type ZirveVurgusu = { deger: string; etiket: string };

/** Zirve programının başlıklı bölümleri (oturumlar, alanlar, etkinlikler). */
export type ZirveBolumu = { baslik: string; metin: string };

export type Zirve = {
  id: string;
  /** Panelde ve adreste kullanılan ad. */
  slug: string;
  /** Sayfanın adresi (site kökünden). Eski iki zirve kendi tarihsel adresini
      taşıyor; panelden açılan yenilerinki `/zirve/<slug>` olur. */
  yol: string;
  ad: string;
  yil: string;
  /** Sayfa başlığının üstündeki satır: tarih ve şehir. */
  tarihYer: string;
  /** Kart ve başlık altı için tek satırlık tanıtım. */
  ozet: string;
  metin: string;
  /** Başlığın altındaki sayı şeridi; boş bırakılırsa şerit basılmaz. */
  vurgular: ZirveVurgusu[];
  /** Program bölümleri: metnin ardından başlıklı bloklar hâlinde basılır. */
  bolumler: ZirveBolumu[];
  gorseller: ZirveGorseli[];
  video?: ZirveVideosu;
  yayinda: boolean;
};

/** Tabloda gövde tek bir JSONB nesnesi; sayfanın düzeni sabit olduğu için
    Hakkında'daki gibi serbest blok listesi değil, adlı alanlar tutuluyor. */
export type ZirveGovdesi = {
  yil: string;
  metin: string;
  vurgular: ZirveVurgusu[];
  bolumler: ZirveBolumu[];
  gorseller: ZirveGorseli[];
  video: ZirveVideosu | null;
};

/*
 * Adresler yalnızca site içi yol ya da http(s) olabilir: alan panelden
 * doldurulduğu için "javascript:" yazılabilseydi video kaynağı ya da görsel
 * yolu bir tıklama tuzağına dönebilirdi.
 */
export function guvenliZirveAdresi(deger: unknown): string {
  const metin = typeof deger === "string" ? deger.trim() : "";
  if (!metin) return "";
  if (siteIciYolMu(metin)) return metin;
  return /^https?:\/\//i.test(metin) ? metin : "";
}

function yazi(deger: unknown) {
  return typeof deger === "string" ? deger : "";
}

function dizi(deger: unknown): unknown[] {
  return Array.isArray(deger) ? deger : [];
}

/** Panelden gelen ve tablodan okunan gövde aynı süzgeçten geçiyor: eksik alan
    varsayılanına düşer, tanınmayan alan atılır, adresler doğrulanır. */
export function zirveGovdesiniCoz(ham: unknown): ZirveGovdesi {
  const govde = (ham ?? {}) as Record<string, unknown>;
  const video = (govde.video ?? null) as Record<string, unknown> | null;
  const videoAdresi = video ? guvenliZirveAdresi(video.url) : "";

  return {
    yil: yazi(govde.yil).trim(),
    metin: yazi(govde.metin),
    vurgular: dizi(govde.vurgular)
      .map((o) => {
        const vurgu = (o ?? {}) as Record<string, unknown>;
        return { deger: yazi(vurgu.deger).trim(), etiket: yazi(vurgu.etiket).trim() };
      })
      .filter((v) => v.deger || v.etiket),
    bolumler: dizi(govde.bolumler)
      .map((o) => {
        const bolum = (o ?? {}) as Record<string, unknown>;
        return { baslik: yazi(bolum.baslik).trim(), metin: yazi(bolum.metin).trim() };
      })
      .filter((b) => b.baslik || b.metin),
    gorseller: dizi(govde.gorseller)
      .map((o) => {
        const gorsel = (o ?? {}) as Record<string, unknown>;
        return { url: guvenliZirveAdresi(gorsel.url), alt: yazi(gorsel.alt) };
      })
      // Adresi elenen kare basılmaz: next/image ve <img> boş src ile patlıyor.
      .filter((g) => g.url),
    // Videosu olmayan zirve olağan: 2025'in kaydı sonradan geldi.
    video: videoAdresi
      ? { url: videoAdresi, kapak: guvenliZirveAdresi(video!.kapak) || undefined, baslik: yazi(video!.baslik) }
      : null,
  };
}

/** Panelden açılan zirvelerin adresi; eski ikisi kendi yolunu satırda taşıyor. */
export function zirveYolu(slug: string, kayitliYol: string) {
  return guvenliZirveAdresi(kayitliYol) || `/zirve/${slug}`;
}
