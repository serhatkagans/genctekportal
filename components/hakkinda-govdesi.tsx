import { gorselYolu } from "@/lib/ortam";
import type { HakkindaBlogu, HakkindaSayfasi } from "@/lib/hakkinda";

/**
 * HAKKINDA SAYFALARININ GÖVDESİ (4 Eylül 2026).
 *
 * Üç sayfa (GençTek Nedir?, Ekosistem Yapılanması, GençTek Kurumsal) elle
 * yazılmış JSX'ti; içerikleri veritabanına taşınırken bu bileşen yazıldı.
 * Amaç sayfaların GÖRÜNÜŞÜNÜ AYNEN KORUMAK: blok türleri o üç sayfada zaten
 * kullanılan CSS sınıflarına (value-list, yapilanma-liste, marka-karti,
 * zirve-video) birebir karşılık geliyor. Yeni bir tür icat edilmedi.
 *
 * PANELDEN GELEN METİN HİÇBİR YERDE HAM HTML DEĞİL: her blok kendi etiketini
 * kendisi basıyor, dangerouslySetInnerHTML yok. İçerik yazarının eline script
 * geçmesin diye — haber gövdesinde temizleyiciyle (sanitize-html) çözülen
 * sorun burada hiç doğmuyor.
 */

// Boş satırla ayrılmış metin paragraflara bölünüyor: editörde uzun bir metin
// kutusuna yazmak, her paragraf için ayrı blok eklemekten kolay.
function paragraflar(metin: string) {
  return metin.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function videoTuru(url: string) {
  if (/\.webm($|\?)/i.test(url)) return "video/webm";
  if (/\.ogv($|\?)/i.test(url)) return "video/ogg";
  return "video/mp4";
}

function Blok({ blok }: { blok: HakkindaBlogu }) {
  switch (blok.tur) {
    case "baslik":
      // Üst etiketli başlık, sitenin her yerindeki bölüm başlığı kalıbı;
      // etiketsizi düz bir h2.
      return blok.ustEtiket ? (
        <div className="section-heading">
          <div>
            <span className="eyebrow">{blok.ustEtiket}</span>
            <h2>{blok.metin}</h2>
          </div>
        </div>
      ) : (
        <h2>{blok.metin}</h2>
      );

    case "metin":
      return <>{paragraflar(blok.metin).map((p, i) => <p key={i}>{p}</p>)}</>;

    case "not":
      return <p className="etkinlik-bos hakkinda-not">{blok.metin}</p>;

    case "gorsel":
      return blok.url ? (
        <figure className="yapilanma-sema">
          <img src={gorselYolu(blok.url)} alt={blok.alt} />
        </figure>
      ) : null;

    case "video":
      // Videolar 20–45 MB; sayfa açılırken inmesinler diye yalnızca süreleri
      // okunuyor. Dosyalar public/video altında ve depoya girmiyor.
      return blok.url ? (
        <figure className="zirve-video">
          <video controls preload="metadata">
            <source src={gorselYolu(blok.url)} type={videoTuru(blok.url)} />
          </video>
        </figure>
      ) : null;

    case "liste": {
      const ogeler = blok.ogeler.filter((o) => (o.baslik ?? "").trim() || (o.metin ?? "").trim());
      if (ogeler.length === 0) return null;
      // Başlığı da metni de olan maddeler kalın bir liste ister (yapılanma
      // sayfası); yalnız metin ya da yalnız başlık taşıyanlar ince liste.
      const kalin = ogeler.some((o) => (o.baslik ?? "").trim() && (o.metin ?? "").trim());
      return (
        <div className={kalin ? "yapilanma-liste" : "value-list"}>
          {ogeler.map((oge, sira) => (
            <article key={sira}>
              <span>{String(sira + 1).padStart(2, "0")}</span>
              {kalin ? (
                <div>
                  {oge.baslik ? <h2>{oge.baslik}</h2> : null}
                  {paragraflar(oge.metin ?? "").map((p, i) => <p key={i}>{p}</p>)}
                </div>
              ) : oge.baslik ? (
                <h3>{oge.baslik}</h3>
              ) : (
                <p>{oge.metin}</p>
              )}
            </article>
          ))}
        </div>
      );
    }

    case "kartlar": {
      const ogeler = blok.ogeler.filter((o) => o.ad.trim());
      if (ogeler.length === 0) return null;
      return (
        <div className="card-grid hakkinda-kart-izgara">
          {ogeler.map((oge, sira) =>
            oge.dosya ? (
              <a className="content-card marka-karti" href={gorselYolu(oge.dosya)} download key={sira}>
                <span className="card-body">
                  <span className="chip">Dosyayı indir</span>
                  <h3>{oge.ad}</h3>
                  <p>{oge.aciklama}</p>
                </span>
              </a>
            ) : (
              // Dosyası olmayan kart pasif duruyor: "yakında" demek, kartı
              // sessizce gizlemekten iyi — dosyayı elinde tutan kişi neyin
              // beklendiğini görüyor.
              <div className="content-card marka-karti marka-karti-pasif" key={sira} aria-disabled="true">
                <span className="card-body">
                  <span className="chip">Yakında</span>
                  <h3>{oge.ad}</h3>
                  <p>{oge.aciklama}</p>
                </span>
              </div>
            ),
          )}
        </div>
      );
    }
  }
}

/*
 * Bölümlere ayırma: "yeni bölüm başlat" işaretli bir başlık, o noktadan sonrası
 * için ayrı bir <section> açıyor. Marka sayfasındaki "Kullanım kuralları"
 * bölümünün zeminli şeridi böyle korunuyor; işaretsiz sayfalar tek bölüm kalır.
 */
function bolumlereAyir(bloklar: HakkindaBlogu[]) {
  const bolumler: HakkindaBlogu[][] = [[]];
  for (const blok of bloklar) {
    if (blok.tur === "baslik" && blok.yeniBolum && bolumler[bolumler.length - 1].length > 0) bolumler.push([]);
    bolumler[bolumler.length - 1].push(blok);
  }
  return bolumler.filter((bolum) => bolum.length > 0);
}

export function HakkindaGovdesi({ sayfa }: { sayfa: HakkindaSayfasi }) {
  const bolumler = bolumlereAyir(sayfa.bloklar);

  return (
    <>
      {bolumler.map((bloklar, sira) => {
        /* İKİLİ DÜZEN yalnızca ilk bölümde: solda anlatım, sağda uzun madde
           listesi (GençTek Nedir? sayfasının kalıbı). Sonraki bölümler tam
           genişlikte akıyor — iki sütunlu bir şeridi ikinci kez açmak sayfanın
           hizasını bozardı. */
        const ikili = sira === 0 && sayfa.duzen === "ikili";
        const sag = ikili ? bloklar.filter((b) => b.sutun === "sag") : [];
        const sol = ikili ? bloklar.filter((b) => b.sutun !== "sag") : bloklar;

        return (
          <section className={sira === 0 ? "section" : "section themes-section"} key={sira}>
            <div className={ikili ? "container prose-grid" : "container"}>
              {ikili ? (
                <>
                  <div>{sol.map((blok, i) => <Blok blok={blok} key={i} />)}</div>
                  <div>{sag.map((blok, i) => <Blok blok={blok} key={i} />)}</div>
                </>
              ) : (
                sol.map((blok, i) => <Blok blok={blok} key={i} />)
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
