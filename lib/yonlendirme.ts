import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";

// Yönlendirmeler data/yonlendirmeler.json'daydı; 3 Eylül 2026'da "Redirect"
// tablosuna geçti. Taşınacak kayıt yoktu (dosya hiç oluşmamıştı), bu yüzden
// göç betiği de yok. Dışa açılan üç fonksiyonun imzası aynı.
export type Yonlendirme = { id: string; kaynak: string; hedef: string; kod: 301 | 302 };

/*
 * BAŞTAKİ EĞİK ÇİZGİLER TEKE İNDİRİLİYOR (5 Eylül 2026 · güvenlik incelemesi).
 *
 * "//kotu.example" tarayıcı için site içi yol DEĞİL, şema-göreli bir dış
 * adrestir; eski hâl onu olduğu gibi geçiriyordu ve proxy.ts `new URL(...)` ile
 * çözünce hedef gerçekten dışarı çıkıyordu. Üretimde basePath öneki
 * ("/genctekportal") kazara koruyordu, basePath boş olan kurulumlarda ise
 * yönlendirme motoru açık yönlendiriciye dönüşüyordu. Ters eğik çizgi de aynı
 * kapıya çıkıyor: tarayıcılar "\" karakterini "/" gibi çözüyor.
 *
 * Dış adres yasak değil — "https://" ile yazılan hedef aynen korunuyor.
 */
function normalizeYol(deger: string) {
  const temiz = deger.trim();
  if (!temiz) return "";
  if (/^https?:\/\//.test(temiz)) return temiz;
  return `/${temiz.replace(/^[/\\]+/, "")}`;
}

type YonlendirmeSatiri = { id: string; source: string; target: string; permanent: boolean };

function satirdanYonlendirme(satir: YonlendirmeSatiri): Yonlendirme {
  return { id: satir.id, kaynak: satir.source, hedef: satir.target, kod: satir.permanent ? 301 : 302 };
}

function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

/* proxy.ts bunu HER istekte çağırıyor, o yüzden maliyeti ölçüldü: boş tabloda
   istek başına 0,37 ms (üretim sunucusu, 3 Eylül 2026). Ana sayfanın toplam
   maliyetinin ~%2'si; bellekte tutup tazeleme kuralı uydurmaktansa her istekte
   sormak hem daha basit hem de panelden eklenen yönlendirmeyi anında geçerli
   kılıyor.

   Bağlantı düşerse boş liste dönüyor: yönlendirme kaybı, ara katmanın hata
   fırlatıp bütün siteyi 500'e düşürmesinden iyidir. Şema ve sorgu hataları
   yine gizlenmiyor. */
export async function yonlendirmeleriOku(): Promise<Yonlendirme[]> {
  try {
    const satirlar = await sql<YonlendirmeSatiri[]>`
      SELECT id, source, target, permanent FROM "Redirect"
      WHERE active = true
      ORDER BY "createdAt"
    `;
    return satirlar.map(satirdanYonlendirme);
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return [];
  }
}

export async function yonlendirmeEkle(kaynak: string, hedef: string, kod: 301 | 302) {
  const k = normalizeYol(kaynak);
  const h = normalizeYol(hedef);
  if (!k || !h || k === h) return;
  // Aynı kaynak iki kez tanımlanırsa hangisinin kazandığı belirsiz olur; üzerine yaz.
  await sql`
    INSERT INTO "Redirect" (id, source, target, permanent, "updatedAt")
    VALUES (${randomUUID()}, ${k}, ${h}, ${kod === 301}, CURRENT_TIMESTAMP)
    ON CONFLICT (source) DO UPDATE
      SET target = EXCLUDED.target,
          permanent = EXCLUDED.permanent,
          active = true,
          "updatedAt" = CURRENT_TIMESTAMP
  `;
}

export async function yonlendirmeSil(id: string) {
  await sql`DELETE FROM "Redirect" WHERE id = ${id}`;
}
