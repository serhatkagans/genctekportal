import { randomUUID } from "node:crypto";
import { sql } from "./db";
import menuYedegi from "@/data-ornek/menu.json";
import { menuyuCoz, type Menu } from "./menu-govde";

/**
 * ÜST MENÜ (4 Eylül 2026 · istek: "menülerin de ismi değişebilir olabilir mi").
 *
 * Menü başlıkları — Hakkında, Haberler, Etkinlikler, GençTek Zirvesi ve sağdaki
 * "Giriş" düğmesi — components/header.tsx içinde sabit yazılıydı. Artık "Page"
 * tablosunda tek bir satırda (section = 'menu') ve panelden düzenleniyor:
 * başlık adı, sırası, düz bağlantıların adresi ve giriş düğmesinin yazısı.
 *
 * AÇILIR LİSTELERİN İÇERİĞİ BURADAN GELMİYOR: "Hakkında"nın altındaki başlıklar
 * Hakkında sayfalarından, "GençTek Zirvesi"nin altındakiler zirve kayıtlarından
 * geliyor. Aynı başlığı iki yerde tutmak, birinin eskimesi demekti.
 *
 * SATIR YOKSA VARSAYILAN: kayıt hiç oluşmamışsa menü boş kalmıyor,
 * data-ornek/menu.json'daki bugünkü hâline düşüyor. Bu yüzden ayrı bir göç
 * betiği YOK — ilk kaydetmede satır kendiliğinden açılıyor (alt bilgideki aynı
 * karar). Boş bırakılmış bir liste ise saygı görür.
 */
export type { Menu, MenuOgesi, MenuOgesiTuru } from "./menu-govde";
export { guvenliMenuAdresi, menuyuCoz } from "./menu-govde";

export const VARSAYILAN_MENU: Menu = menuyuCoz(menuYedegi);

const SLUG = "ust-menu";

/* Menü HER SAYFADA basılıyor: bağlantı düştüğünde hata yükseltilseydi sitenin
   tamamı 500 dönerdi. Şema ve sorgu hataları gizlenmiyor. */
function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

export async function menuyuOku(): Promise<Menu> {
  try {
    const [satir] = await sql<{ blocks: unknown }[]>`
      SELECT blocks FROM "Page" WHERE section = 'menu' LIMIT 1
    `;
    return satir ? menuyuCoz(satir.blocks) : VARSAYILAN_MENU;
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return VARSAYILAN_MENU;
  }
}

export async function menuyuYaz(menu: Menu) {
  const temiz = menuyuCoz(menu);
  // Tek satır: yoksa açılır, varsa üzerine yazılır. Slug benzersiz olduğu için
  // eşzamanlı iki kaydetme de ikinci bir satır üretemez.
  await sql`
    INSERT INTO "Page" (id, section, slug, title, blocks, status, "publishedAt", "updatedAt")
    VALUES (${randomUUID()}, 'menu', ${SLUG}, 'Üst menü', ${sql.json(temiz)},
            'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (slug) DO UPDATE
      SET blocks = ${sql.json(temiz)}, "updatedAt" = CURRENT_TIMESTAMP
  `;
  return temiz;
}
