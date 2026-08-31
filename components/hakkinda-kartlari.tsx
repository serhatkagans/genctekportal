import Link from "next/link";
import { Icon } from "./icons";
import { HAKKINDA_KARTLARI } from "@/lib/hakkinda";

/**
 * Hakkında başlıklarının kart ızgarası.
 *
 * KART YENİDEN TASARLANDI (20 Ağustos 2026 · istek: "hakkında sayfasındaki
 * kartlar çok gösterişsiz").
 *
 * İlk hâli tema kutularının kopyasıydı: kenarlık, küçük bir sıra numarası,
 * başlık, iki satır yazı. Ekranda altı gri dikdörtgen yan yana duruyordu ve
 * hiçbiri diğerinden ayrışmıyordu — göz nereye bakacağını bilmiyordu.
 *
 * Yeni kartın üç katmanı var ve her biri bir iş yapıyor:
 *
 *   1. RENKLİ BANT — kartı uzaktan tanınır kılar. İçinde filigran hâlinde
 *      büyük bir simge ve sıra numarası durur; simge başlığı okumadan da
 *      "bu neyle ilgili" der (takvim → etkinlikler, kişiler → koordinatörler).
 *   2. GÖVDE — başlık ve tek cümlelik özet.
 *   3. ALT SATIR — "Sayfaya git" ve ok. Kartın tıklanabilir olduğunu söyleyen
 *      şey artık yalnızca imleç değil, yazının kendisi.
 *
 * SÜSLEME DEĞİL AYIRT ETME: bant rengi kartın sırasına göre değil TÜRÜNE göre
 * seçiliyor (bkz. lib/hakkinda.ts · ikon). Rastgele dağıtılan renkler, ikinci
 * ziyarette kartın yerini hatırlamayı zorlaştırırdı.
 */
export function HakkindaKartlari() {
  return (
    <div className="hakkinda-izgara">
      {HAKKINDA_KARTLARI.map((kart, sira) => (
        <Link className="hakkinda-karti" href={kart.adres} key={kart.slug} id={`hakkinda-${kart.slug}`}>
          <span className={`hakkinda-bant hakkinda-bant-${kart.ikon}`}>
            <span className="hakkinda-filigran" aria-hidden="true">
              <Icon name={kart.ikon} />
            </span>
            <span className="hakkinda-numara">{String(sira + 1).padStart(2, "0")}</span>
            <span className="hakkinda-simge" aria-hidden="true">
              <Icon name={kart.ikon} />
            </span>
          </span>
          <span className="hakkinda-govde">
            <h3>{kart.baslik}</h3>
            <p>{kart.ozet}</p>
            <span className="hakkinda-git">
              Sayfaya git
              <Icon name="arrow" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
