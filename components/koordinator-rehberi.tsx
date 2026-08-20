"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Koordinator } from "@/lib/koordinator";
import { Icon } from "./icons";

/**
 * İl koordinatörleri rehberi.
 *
 * GÖRSELLER ARTIK `next/image` İLE (20 Ağustos 2026 · istek: "o koordinatör
 * sayfası çok geç yükleniyor, muhtemelen görseller yüksek çözünürlükte" —
 * tespit doğruydu).
 *
 * Sayfa 75 farklı portreyi 96×96 piksellik dairelerde gösteriyor ama düz bir
 * `<img>` ile dosyaların TAMAMI iniyordu: WordPress'ten aktarılan bu görseller
 * toplamda ~55 MB ve tek tek 1 MB'a varıyor. Yani ekranda 96 piksel olarak
 * görünen bir fotoğraf için megabaytlarca veri çekiliyordu.
 *
 * `next/image` aynı dosyadan ekranda gerçekten kullanılan boyutta ve modern
 * biçimde bir sürüm üretip onu servis eder; `sizes` ile hangi genişliğin
 * isteneceği de söyleniyor. Kaynak dosyalara DOKUNULMADI — küçültme istek
 * anında yapılıyor, arşivdeki asıl görsel olduğu gibi duruyor.
 *
 * YOL HAM VERİLİYOR, `gorselYolu`ndan geçirilmiyor: `next/image` alt dizin
 * önekini (basePath) kendisi ekler; ikisi birden uygulanırsa yol iki kez
 * öneklenir ve görsel bulunamaz.
 */
export function KoordinatorRehberi({ kayitlar }: { kayitlar: Koordinator[] }) {
  const [arama, setArama] = useState("");

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    if (!q) return kayitlar;
    return kayitlar.filter((k) =>
      `${k.ad} ${k.il} ${k.rol}`.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [arama, kayitlar]);

  return (
    <>
      <div className="directory-search">
        <Icon name="search" />
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="İl, ad veya rol ara"
          aria-label="Koordinatörlerde ara"
        />
        <span className="result-count">{filtreli.length} kişi</span>
      </div>

      {filtreli.length === 0 ? (
        <p className="rehber-bos">Aramanla eşleşen kayıt yok.</p>
      ) : (
        <div className="rehber-grid">
          {filtreli.map((k, sira) => (
            <article className="rehber-kart" key={k.id}>
              <Image
                className="rehber-avatar"
                src={k.gorsel}
                alt={k.ad ? `${k.ad} portresi` : ""}
                width={96}
                height={96}
                sizes="96px"
                /*
                 * İlk kartlar ekranın üstünde: onlar hemen, gerisi görünür
                 * oldukça insin. Hepsi birden istenseydi tarayıcı yine
                 * yüzlerce eşzamanlı istek açardı.
                 */
                loading={sira < 8 ? "eager" : "lazy"}
              />
              <strong>{k.ad || "Atama bekliyor"}</strong>
              <span>{k.rol ? `${k.il} · ${k.rol}` : k.il}</span>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
