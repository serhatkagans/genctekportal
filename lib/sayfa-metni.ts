import { randomUUID } from "node:crypto";
import { sql } from "./db";
import anaSayfaYedegi from "@/data-ornek/anasayfa.json";
import katilimYedegi from "@/data-ornek/katilim.json";
import kvkkYedegi from "@/data-ornek/kvkk.json";
import {
  anaSayfaMetniniCoz,
  katilimMetniniCoz,
  kvkkMetniniCoz,
  type AnaSayfaMetni,
  type KatilimMetni,
  type KvkkMetni,
} from "./sayfa-metni-govde";

/**
 * SABİT SAYFA METİNLERİ (5 Eylül 2026 · istek: "hepsini yap").
 *
 * Ana sayfa hero'su, katılım sayfasının başlığı ve KVKK aydınlatma metni koda
 * yazılıydı — panelden düzenlenebilen tek şey haberler, temalar ve Hakkında
 * sayfalarıydı. Üçü de "Page" tablosunda birer TEKİL satırda; alt bilgi ve üst
 * menüde uygulanan kalıbın aynısı.
 *
 * GÖÇ BETİĞİ YOK, BİLEREK: satır hiç açılmamışsa (yeni kurulum, temiz
 * veritabanı) sayfa boş kalmıyor, data-ornek altındaki bugünkü metne düşüyor.
 * Panelden ilk kaydetmede satır kendiliğinden açılıyor. Haber ve koordinatör
 * göçlerinde yaşanan "betik çalıştırılmadı, sayfa boş" durumu burada
 * doğmuyor.
 *
 * DÜZ ALANLARDA BOŞLUK SAYGI GÖRÜYOR ama boş liste de: bir yönetici şeridin
 * tamamını sildiyse şerit basılmaz — "satır yok" ile "yönetici sildi" ayrı
 * durumlar, birincisinde varsayılan gelir, ikincisinde boş kalır.
 */

export type { AnaSayfaMetni, KatilimMetni, KvkkMetni, KvkkBolumu, KvkkMaddesi, KvkkSatiri } from "./sayfa-metni-govde";
export { paragraflaraBol, guvenliSayfaAdresi } from "./sayfa-metni-govde";

export const VARSAYILAN_ANASAYFA: AnaSayfaMetni = anaSayfaMetniniCoz(anaSayfaYedegi);
export const VARSAYILAN_KATILIM: KatilimMetni = katilimMetniniCoz(katilimYedegi);
export const VARSAYILAN_KVKK: KvkkMetni = kvkkMetniniCoz(kvkkYedegi);

/* Bu metinler ana sayfada ve her ziyaretçinin gördüğü sayfalarda basılıyor:
   bağlantı düştüğünde hata yükseltilseydi sayfa 500 dönerdi. Şema ve sorgu
   hataları gizlenmeden yukarı iletiliyor (lib/haber.ts ve lib/altbilgi.ts'teki
   aynı ayrım). */
function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

/* Üç bölüm de tek satır, tek JSONB gövde ve aynı okuma/yazma kalıbı: ayrı ayrı
   yazmak yerine bölüm adı, başlık ve çözücü parametre. */
async function tekilSayfaOku<T>(bolum: string, coz: (ham: unknown) => T, varsayilan: T): Promise<T> {
  try {
    const [satir] = await sql<{ blocks: unknown }[]>`
      SELECT blocks FROM "Page" WHERE section = ${bolum} LIMIT 1
    `;
    return satir ? coz(satir.blocks) : varsayilan;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return varsayilan;
  }
}

async function tekilSayfaYaz<T>(bolum: string, baslik: string, coz: (ham: unknown) => T, govde: T): Promise<T> {
  const temiz = coz(govde);
  // Slug bölüm adıyla aynı ve benzersiz: eşzamanlı iki kaydetme de ikinci bir
  // satır üretemez, ikincisi birincinin üzerine yazar.
  await sql`
    INSERT INTO "Page" (id, section, slug, title, blocks, status, "publishedAt", "updatedAt")
    VALUES (${randomUUID()}, ${bolum}, ${bolum}, ${baslik}, ${sql.json(temiz as never)},
            'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (slug) DO UPDATE
      SET blocks = ${sql.json(temiz as never)}, "updatedAt" = CURRENT_TIMESTAMP
  `;
  return temiz;
}

export function anaSayfaMetniniOku() {
  return tekilSayfaOku("anasayfa", anaSayfaMetniniCoz, VARSAYILAN_ANASAYFA);
}

export function anaSayfaMetniniYaz(govde: AnaSayfaMetni) {
  return tekilSayfaYaz("anasayfa", "Ana sayfa", anaSayfaMetniniCoz, govde);
}

export function katilimMetniniOku() {
  return tekilSayfaOku("katilim", katilimMetniniCoz, VARSAYILAN_KATILIM);
}

export function katilimMetniniYaz(govde: KatilimMetni) {
  return tekilSayfaYaz("katilim", "Katılım sayfası", katilimMetniniCoz, govde);
}

export function kvkkMetniniOku() {
  return tekilSayfaOku("kvkk", kvkkMetniniCoz, VARSAYILAN_KVKK);
}

export function kvkkMetniniYaz(govde: KvkkMetni) {
  return tekilSayfaYaz("kvkk", "KVKK aydınlatma metni", kvkkMetniniCoz, govde);
}
