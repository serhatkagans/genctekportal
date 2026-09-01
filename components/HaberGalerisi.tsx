"use client";

import { useEffect, useRef } from "react";
import type { HaberKarti } from "@/lib/haber";
import { WordPressCard } from "./wordpress-card";

/*
 * SON HABERLER ŞERİDİ.
 *
 * Şerit kendiliğinden akıyor; kartlar iki kez basıldığı için akış sonsuz
 * görünüyor: ikinci kopyanın başına gelindiğinde konum bir "dönem" geri
 * alınıyor, göz bunu göremiyor çünkü aynı kartlar.
 *
 * SOLA/SAĞA DÜĞMELERİ (1 Eylül 2026 · istek: "haberler kayıp gidiyor ama
 * kaçan haber için sola kaydırma yok"). Akış CSS animasyonuyla yapılırken
 * kaçan habere dönmenin yolu yoktu — animasyonla sürülen bir dönüşüme elle
 * müdahale edilemiyor. Bu yüzden şerit gerçek bir yatay kaydırma kutusuna
 * alındı: akışı `scrollLeft`i büyüten bir kare döngüsü yürütüyor, düğmeler de
 * aynı değeri bir kart kadar oynatıyor. Yan faydası, dokunmatik ekranda
 * parmakla kaydırmanın da çalışması.
 */
const TUR_SURESI = 72_000; // bir dönem kaç ms'de akıyor (eski animasyonla aynı)
const DUGME_BEKLEMESI = 900; // düğmeden sonra yumuşak kaydırma bitene kadar

export function HaberGalerisi({ haberler }: { haberler: HaberKarti[] }) {
  const pencereRef = useRef<HTMLDivElement>(null);
  const tekrarRef = useRef<HTMLDivElement>(null);
  const durakRef = useRef(false); // imleç/odak şeridin üstünde
  const beklemeRef = useRef(0); // bu ana kadar akış ve konum düzeltmesi durur

  /** Bir dönem: özgün şeridin genişliği + iki kopya arasındaki boşluk. */
  const donem = () => {
    const tekrar = tekrarRef.current;
    const ilk = pencereRef.current?.querySelector<HTMLElement>(".haber-galeri-kart");
    return tekrar && ilk ? tekrar.offsetLeft - ilk.offsetLeft : 0;
  };

  useEffect(() => {
    const pencere = pencereRef.current;
    if (!pencere) return;

    const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)");
    let kare = 0;
    let onceki = 0;

    const adim = (an: number) => {
      kare = requestAnimationFrame(adim);
      const fark = onceki ? Math.min(an - onceki, 50) : 0;
      onceki = an;

      const tur = donem();
      // Düğmeyle başlayan yumuşak kaydırma sürerken konuma dokunmuyoruz:
      // scrollLeft'e yazmak tarayıcının animasyonunu iptal ederdi.
      if (!tur || an < beklemeRef.current) return;

      // Sarma: ikinci kopyaya geçildiyse başa, başa dayanıldıysa ikinci kopyaya.
      if (pencere.scrollLeft >= tur) pencere.scrollLeft -= tur;
      else if (pencere.scrollLeft <= 0) pencere.scrollLeft += tur;

      if (azHareket.matches || durakRef.current) return;
      pencere.scrollLeft += (tur / TUR_SURESI) * fark;
    };

    kare = requestAnimationFrame(adim);
    return () => cancelAnimationFrame(kare);
  }, []);

  const kaydir = (yon: -1 | 1) => {
    const pencere = pencereRef.current;
    if (!pencere) return;
    const kart = pencere.querySelector<HTMLElement>(".haber-galeri-kart");
    const tur = donem();
    const adim = kart ? kart.offsetWidth + 20 : pencere.clientWidth * 0.8;

    // Sola giderken sol duvara dayanmamak için önce bir dönem ileri atlıyoruz:
    // içerik birebir tekrar ettiği için sıçrama görünmüyor, ama artık geride
    // kaydırılacak yer var — "kaçan haber" böyle geri geliyor.
    if (yon < 0 && tur && pencere.scrollLeft - adim < 0) pencere.scrollLeft += tur;

    beklemeRef.current = performance.now() + DUGME_BEKLEMESI;
    pencere.scrollBy({ left: yon * adim, behavior: "smooth" });
  };

  if (haberler.length === 0) return null;

  return (
    <section
      className="haber-galerisi"
      aria-roledescription="dönen haber galerisi"
      aria-label="Son haberler ve etkinlikler"
      onMouseEnter={() => { durakRef.current = true; }}
      onMouseLeave={() => { durakRef.current = false; }}
      onFocusCapture={() => { durakRef.current = true; }}
      onBlurCapture={() => { durakRef.current = false; }}
      onPointerDown={() => { beklemeRef.current = performance.now() + DUGME_BEKLEMESI; }}
    >
      <div className="haber-galeri-pencere" ref={pencereRef}>
        <div className="haber-galeri-serit">
          {haberler.map((haber) => (
            <div className="haber-galeri-kart" key={haber.id}>
              <WordPressCard item={haber} />
            </div>
          ))}
          <div className="haber-galeri-tekrar" aria-hidden="true" ref={tekrarRef}>
            {haberler.map((haber) => (
              <div className="haber-galeri-kart" key={`tekrar-${haber.id}`}>
                <WordPressCard item={haber} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="haber-galeri-denetimleri">
        <button type="button" aria-label="Önceki haberler" onClick={() => kaydir(-1)}>←</button>
        <span><strong>{haberler.length}</strong> güncel içerik</span>
        <button type="button" aria-label="Sonraki haberler" onClick={() => kaydir(1)}>→</button>
      </div>
    </section>
  );
}
