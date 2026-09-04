import { randomUUID } from "node:crypto";
import { sql } from "./db";
import altbilgiYedegi from "@/data-ornek/altbilgi.json";
import { altbilgiyiCoz, type Altbilgi } from "./altbilgi-govde";

/**
 * ALT BİLGİ AYARLARI (4 Eylül 2026 · istek: "footer için de ayar yap").
 *
 * Alt bilgideki kurum logoları ve alt satır bağlantıları koda yazılıydı: yeni
 * bir paydaş logosu eklemek ya da bir adresi düzeltmek kod değişikliği ve
 * dağıtım demekti. Artık "Page" tablosunda tek bir satırda (section =
 * 'altbilgi') duruyorlar ve panelden düzenleniyorlar.
 *
 * TEK SATIR, ÇÜNKÜ ALT BİLGİ TEK: Hakkında ve zirvede olduğu gibi çoklu kayıt
 * yok; gövde tek bir JSONB nesnesi.
 *
 * SATIR YOKSA VARSAYILAN: kayıt hiç oluşmamışsa (yeni kurulum, göç
 * çalıştırılmamış) alt bilgi boş kalmıyor, data-ornek/altbilgi.json'daki
 * hâline düşüyor. Bu yüzden bu göçün ayrı bir betiği YOK — ilk kaydetmede
 * satır kendiliğinden açılıyor. Boş bırakılmış bir liste ise saygı görür:
 * "satır yok" ile "yönetici hepsini sildi" ayrı durumlar.
 *
 * E-POSTA BURADA DEĞİL: alt bilgide görünen adres Genel ayarlardaki
 * `iletisim.eposta` (bkz. lib/yonetim/ayar.ts). Aynı değeri iki yerde tutmak,
 * birinin eskimesi demekti — panelde tek ekrandan düzenleniyor ama kaydı hep
 * GlobalSetting tutuyor.
 */

export type { Altbilgi, AltbilgiMarkasi, AltbilgiBaglantisi } from "./altbilgi-govde";
export { guvenliAltbilgiAdresi, altbilgiyiCoz } from "./altbilgi-govde";

export const VARSAYILAN_ALTBILGI: Altbilgi = altbilgiyiCoz(altbilgiYedegi);

const SLUG = "altbilgi";

/* Alt bilgi HER SAYFADA basılıyor: bağlantı düştüğünde hata yükseltilseydi
   sitenin tamamı 500 dönerdi. Şema ve sorgu hataları gizlenmiyor. */
function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

export async function altbilgiyiOku(): Promise<Altbilgi> {
  try {
    const [satir] = await sql<{ blocks: unknown }[]>`
      SELECT blocks FROM "Page" WHERE section = 'altbilgi' LIMIT 1
    `;
    return satir ? altbilgiyiCoz(satir.blocks) : VARSAYILAN_ALTBILGI;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return VARSAYILAN_ALTBILGI;
  }
}

export async function altbilgiyiYaz(govde: Altbilgi) {
  const temiz = altbilgiyiCoz(govde);
  // Tek satır: yoksa açılır, varsa üzerine yazılır. Slug benzersiz olduğu için
  // eşzamanlı iki kaydetme de ikinci bir satır üretemez.
  await sql`
    INSERT INTO "Page" (id, section, slug, title, blocks, status, "publishedAt", "updatedAt")
    VALUES (${randomUUID()}, 'altbilgi', ${SLUG}, 'Alt bilgi', ${sql.json(temiz)},
            'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (slug) DO UPDATE
      SET blocks = ${sql.json(temiz)}, "updatedAt" = CURRENT_TIMESTAMP
  `;
  return temiz;
}
