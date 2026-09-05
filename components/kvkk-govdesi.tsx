import { Fragment } from "react";
import { paragraflaraBol, type KvkkBolumu } from "@/lib/sayfa-metni-govde";

/**
 * KVKK AYDINLATMA METNİNİN GÖVDESİ (5 Eylül 2026).
 *
 * Metin app/kvkk/page.tsx içinde elle yazılmış JSX'ti; veritabanına taşınırken
 * bu bileşen yazıldı. Amaç sayfanın GÖRÜNÜŞÜNÜ AYNEN KORUMAK: hukuki metin
 * `.article-body` içinde düz h2/p/ul olarak akıyor — Hakkında sayfalarının
 * numaralı kart listeleri (value-list, yapilanma-liste) buraya uymaz, bir
 * aydınlatma metni tasarım öğesi değil belgedir.
 *
 * PANELDEN GELEN METİN HAM HTML DEĞİL: her alan kendi etiketini kendisi
 * basıyor, dangerouslySetInnerHTML yok.
 */

/* Başvuru bölümündeki adres bloğu tek bir paragrafta <br> ile akıyor — kurum
   adı, adres, telefon, e-posta alt alta. Liste yapılsaydı madde imleriyle
   dolardı; bu bir liste değil, bir adres. */
function IletisimBloku({ satirlar }: { satirlar: KvkkBolumu["satirlar"] }) {
  return (
    <p>
      {satirlar.map((satir, sira) => (
        <span key={sira}>
          {sira > 0 ? <br /> : null}
          {satir.metin ? `${satir.metin} ` : null}
          {satir.baglantiMetni ? (
            satir.adres ? (
              /* Dış adres yeni sekmede; tel:/mailto: aynı sekmede kalır,
                 tarayıcı zaten uygulamaya devrediyor. */
              <a
                href={satir.adres}
                target={/^https?:/i.test(satir.adres) ? "_blank" : undefined}
                rel={/^https?:/i.test(satir.adres) ? "noreferrer" : undefined}
              >
                {satir.baglantiMetni}
              </a>
            ) : (
              satir.baglantiMetni
            )
          ) : null}
        </span>
      ))}
    </p>
  );
}

export function KvkkGovdesi({ bolumler }: { bolumler: KvkkBolumu[] }) {
  return (
    <section className="section">
      <div className="article-body">
        {/* Bölümler sarmalayıcı bir kutuya alınmıyor: başlıklar ve paragraflar
            `.article-body`nin doğrudan çocuğu kalsın diye — dosya sürümündeki
            DOM ve dolayısıyla aralıklar birebir korunuyor. */}
        {bolumler.map((bolum, sira) => (
          <Fragment key={sira}>
            {bolum.baslik ? <h2>{bolum.baslik}</h2> : null}
            {paragraflaraBol(bolum.giris).map((p, i) => <p key={i}>{p}</p>)}
            {bolum.maddeler.length > 0 ? (
              <ul>
                {bolum.maddeler.map((madde, i) => (
                  // Başlıklı madde kalın etiketle ("Hizmet Sunumu: …"),
                  // başlıksız olan düz cümle (11. maddedeki haklar listesi).
                  // Etiket ve iki nokta tek bir dizgede: ayrı çocuk düğüm
                  // olsalardı React araya <!-- --> ayracı basardı.
                  <li key={i}>
                    {madde.baslik ? <strong>{`${madde.baslik}:`}</strong> : null}
                    {madde.baslik ? ` ${madde.metin}` : madde.metin}
                  </li>
                ))}
              </ul>
            ) : null}
            {bolum.satirlar.length > 0 ? <IletisimBloku satirlar={bolum.satirlar} /> : null}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
