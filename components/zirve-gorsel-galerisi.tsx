"use client";

import { useEffect, useRef } from "react";
import { gorselYolu } from "@/lib/ortam";
import type { ZirveGorseli } from "@/lib/zirve-govde";

const TUR_SURESI = 72_000;
const DUGME_BEKLEMESI = 900;

export function KayanGorselGalerisi({
  gorseller,
  galeriAdi,
  className = "",
}: {
  gorseller: ZirveGorseli[];
  galeriAdi: string;
  className?: string;
}) {
  const pencereRef = useRef<HTMLDivElement>(null);
  const tekrarRef = useRef<HTMLDivElement>(null);
  const durakRef = useRef(false);
  const beklemeRef = useRef(0);

  const donem = () => {
    const pencere = pencereRef.current;
    const ilk = pencere?.querySelector<HTMLElement>(".zirve-galeri-gorsel");
    const tekrar = tekrarRef.current;
    return ilk && tekrar ? tekrar.offsetLeft - ilk.offsetLeft : 0;
  };

  useEffect(() => {
    const pencere = pencereRef.current;
    if (!pencere || gorseller.length < 2) return;

    const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)");
    const turSuresi = Math.min(TUR_SURESI, Math.max(16_000, gorseller.length * 4_000));
    let kare = 0;
    let onceki = 0;

    const adim = (an: number) => {
      kare = requestAnimationFrame(adim);
      const fark = onceki ? Math.min(an - onceki, 50) : 0;
      onceki = an;

      const tur = donem();
      if (!tur || an < beklemeRef.current) return;

      if (pencere.scrollLeft >= tur) pencere.scrollLeft -= tur;
      else if (pencere.scrollLeft < 0) pencere.scrollLeft += tur;

      if (azHareket.matches || durakRef.current) return;
      pencere.scrollLeft += (tur / turSuresi) * fark;
    };

    kare = requestAnimationFrame(adim);
    return () => cancelAnimationFrame(kare);
  }, [gorseller.length]);

  const kaydir = (yon: -1 | 1) => {
    const pencere = pencereRef.current;
    if (!pencere) return;

    const gorsel = pencere.querySelector<HTMLElement>(".zirve-galeri-gorsel");
    const tur = donem();
    const bosluk = window.innerWidth <= 720 ? 12 : 18;
    const mesafe = gorsel ? gorsel.offsetWidth + bosluk : pencere.clientWidth * 0.8;

    if (yon < 0 && tur && pencere.scrollLeft - mesafe < 0) pencere.scrollLeft += tur;
    beklemeRef.current = performance.now() + DUGME_BEKLEMESI;
    pencere.scrollBy({ left: yon * mesafe, behavior: "smooth" });
  };

  if (!gorseller.length) return null;

  return (
    <section
      className={`zirve-gorsel-galerisi ${className}`.trim()}
      aria-label={`${galeriAdi} fotoğraf galerisi`}
      aria-roledescription="otomatik kayan fotoğraf galerisi"
      onMouseEnter={() => { durakRef.current = true; }}
      onMouseLeave={() => { durakRef.current = false; }}
      onFocusCapture={() => { durakRef.current = true; }}
      onBlurCapture={() => { durakRef.current = false; }}
      onPointerDown={() => { durakRef.current = true; }}
      onPointerUp={() => { durakRef.current = false; }}
    >
      <div className="zirve-galeri-pencere" ref={pencereRef}>
        <div className="zirve-galeri-serit">
          {gorseller.map((gorsel) => (
            <figure className="zirve-galeri-gorsel" key={gorsel.url}>
              <img
                src={gorselYolu(gorsel.url)}
                alt={gorsel.alt || galeriAdi}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
          {gorseller.length > 1 ? <div className="zirve-galeri-tekrar" aria-hidden="true" ref={tekrarRef}>
            {gorseller.map((gorsel) => (
              <figure className="zirve-galeri-gorsel" key={`tekrar-${gorsel.url}`}>
                <img src={gorselYolu(gorsel.url)} alt="" loading="lazy" decoding="async" />
              </figure>
            ))}
          </div> : null}
        </div>
      </div>
      {gorseller.length > 1 ? <><button
        className="zirve-galeri-oku zirve-galeri-oku-sol galeri-yon-oku galeri-yon-oku-sol"
        type="button"
        aria-label="Önceki fotoğraf"
        onClick={() => kaydir(-1)}
      />
      <button
        className="zirve-galeri-oku zirve-galeri-oku-sag galeri-yon-oku galeri-yon-oku-sag"
        type="button"
        aria-label="Sonraki fotoğraf"
        onClick={() => kaydir(1)}
      /></> : null}
    </section>
  );
}

export function ZirveGorselGalerisi({ gorseller, zirveAdi }: { gorseller: ZirveGorseli[]; zirveAdi: string }) {
  return <KayanGorselGalerisi gorseller={gorseller} galeriAdi={zirveAdi} />;
}
