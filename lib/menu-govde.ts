/**
 * ÜST MENÜNÜN TİPLERİ VE SÜZGEÇLERİ.
 *
 * lib/menu.ts'ten ayrı: o dosya `postgres` sürücüsünü içeri alıyor ve panelin
 * menü editörü bir istemci bileşeni. Hakkında, zirve, alt bilgi, yardımlaşma
 * ve temel etkinlik taraflarındaki aynı ayrım.
 */

import { siteIciYolMu } from "./guvenli-adres";

/**
 * ÜÇ TÜR MENÜ ÖĞESİ VAR ve ayrımın sebebi içeriğin nereden geldiği:
 *
 *   baglanti  — düz bağlantı (Haberler, Etkinlikler). Etiketi de adresi de
 *               panelden yazılır.
 *   hakkinda  — açılır liste; alt başlıkları Hakkında sayfalarından gelir ve
 *               başlığın kendisi ana sayfadaki kart bölümüne (#hakkinda) iner.
 *   zirveler  — açılır liste; alt başlıkları zirve kayıtlarından gelir.
 *
 * Açılır listelerin İÇERİĞİ panelden yazılmaz; o iki liste zaten kendi
 * ekranlarından yönetiliyor. Buradan yalnızca başlıkları ve sıraları değişir —
 * aynı başlığı iki yerde tutmak, birinin eskimesi demekti.
 */

export type MenuOgesiTuru = "baglanti" | "hakkinda" | "zirveler";

export type MenuOgesi = { tur: MenuOgesiTuru; etiket: string; adres: string };

export type Menu = {
  ogeler: MenuOgesi[];
  /** Sağdaki düğme: portala değil GençTek platformuna gider (adres .env'den). */
  girisEtiketi: string;
};

export function guvenliMenuAdresi(deger: unknown): string {
  const metin = typeof deger === "string" ? deger.trim() : "";
  if (!metin) return "";
  if (siteIciYolMu(metin) || metin.startsWith("#")) return metin;
  return /^https?:\/\//i.test(metin) ? metin : "";
}

/** Panelden gelen ve tablodan okunan menü aynı süzgeçten geçiyor. */
export function menuyuCoz(ham: unknown): Menu {
  const govde = (ham ?? {}) as Record<string, unknown>;
  const ogeler = Array.isArray(govde.ogeler) ? govde.ogeler : [];

  return {
    ogeler: ogeler
      .map((o) => {
        const oge = (o ?? {}) as Record<string, unknown>;
        const tur: MenuOgesiTuru =
          oge.tur === "hakkinda" || oge.tur === "zirveler" ? oge.tur : "baglanti";
        return {
          tur,
          etiket: typeof oge.etiket === "string" ? oge.etiket.trim() : "",
          adres: guvenliMenuAdresi(oge.adres),
        };
      })
      // Etiketsiz öğe menüde tıklanamaz boş bir aralık olurdu; düz bağlantının
      // ayrıca adresi olmalı (açılır listelerin hedefi kendi içeriğinden gelir).
      .filter((oge) => oge.etiket && (oge.tur !== "baglanti" || oge.adres)),
    girisEtiketi:
      typeof govde.girisEtiketi === "string" && govde.girisEtiketi.trim()
        ? govde.girisEtiketi.trim()
        : "Giriş",
  };
}
