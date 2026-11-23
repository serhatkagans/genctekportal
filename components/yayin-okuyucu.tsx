"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PageFlip } from "page-flip";

/**
 * SAYFASI ÇEVRİLEBİLİR YAYIN OKUYUCU (23 Kasım 2026 · istek: "sayfalar
 * çekiştirip çevrilebilir formatta olacak").
 *
 * Çevirme StPageFlip (`page-flip`, MIT) ile: köşeden tutup çekince sayfa
 * kâğıt gibi kıvrılıyor, telefonda parmakla kaydırılıyor. Geniş ekranda iki
 * sayfa yan yana, dar ekranda tek sayfa — geçişi kütüphane kendisi yapıyor.
 *
 * KİTAP DOM'U REACT'İN DIŞINDA: kütüphane sayfa öğelerini kendi sarmalayıcısına
 * taşıyor ve `destroy()` kök öğeyi sayfadan söküyor. React'in yönettiği bir
 * öğe söküldüğünde React kendi ağacını kaybeder; o yüzden React boş bir sahne
 * basıyor, kitabın kökü ve sayfaları etkinin içinde elle kuruluyor.
 *
 * GÖRSELLER TEMBEL: 68 sayfanın hepsi baştan istenmiyor. Açık sayfanın iki
 * gerisi ve beş ilerisi yükleniyor; çevrildikçe pencere kayıyor.
 */

type Etiketler = {
  onceki: string; sonraki: string; sayfa: string; tamEkran: string; pdf: string;
  yukleniyor: string; onizlemeler: string; git: string;
};

const ETIKETLER: Record<"tr" | "en", Etiketler> = {
  tr: {
    onceki: "Önceki sayfa", sonraki: "Sonraki sayfa", sayfa: "Sayfa", tamEkran: "Tam ekran",
    pdf: "PDF'i indir", yukleniyor: "Yayın yükleniyor…", onizlemeler: "Sayfa önizlemeleri", git: "sayfasına git",
  },
  en: {
    onceki: "Previous page", sonraki: "Next page", sayfa: "Page", tamEkran: "Full screen",
    pdf: "Download PDF", yukleniyor: "Loading publication…", onizlemeler: "Page thumbnails", git: "go to page",
  },
};

const GERI = 2;
const ILERI = 5;

export function YayinOkuyucu({ kokAdres, sayfaSayisi, genislik, yukseklik, pdfAdresi, dil }: {
  /** Görsellerin klasörü, uygulama eki dahil: ".../yayinlar/genctek-ekosistemi/tr" */
  kokAdres: string;
  sayfaSayisi: number;
  genislik: number;
  yukseklik: number;
  pdfAdresi: string;
  dil: "tr" | "en";
}) {
  const e = ETIKETLER[dil];
  const kapRef = useRef<HTMLDivElement>(null);
  const sahneRef = useRef<HTMLDivElement>(null);
  const seritRef = useRef<HTMLDivElement>(null);
  const kitapRef = useRef<PageFlip | null>(null);
  const [sayfa, setSayfa] = useState(0);
  const [yatay, setYatay] = useState(true);
  const [hazir, setHazir] = useState(false);

  const no = (i: number) => String(i + 1).padStart(3, "0");

  useEffect(() => {
    const sahne = sahneRef.current;
    if (!sahne) return;
    let iptal = false;
    let kitap: PageFlip | null = null;

    const kok = document.createElement("div");
    kok.className = "yayin-kitap";
    const gorseller: HTMLImageElement[] = [];
    const sayfalar = Array.from({ length: sayfaSayisi }, (_, i) => {
      const s = document.createElement("div");
      s.className = "yayin-sayfa";
      const img = document.createElement("img");
      img.alt = `${e.sayfa} ${i + 1}`;
      img.decoding = "async";
      img.draggable = false;
      s.appendChild(img);
      gorseller.push(img);
      return s;
    });
    sayfalar.forEach((s) => kok.appendChild(s));
    sahne.appendChild(kok);

    const yukle = (merkez: number) => {
      for (let i = Math.max(0, merkez - GERI); i <= Math.min(sayfaSayisi - 1, merkez + ILERI); i++) {
        if (!gorseller[i].src) gorseller[i].src = `${kokAdres}/s${no(i)}.webp`;
      }
    };
    yukle(0);

    import("page-flip").then(({ PageFlip }) => {
      if (iptal) return;
      kitap = new PageFlip(kok, {
        width: genislik,
        height: yukseklik,
        size: "stretch",
        minWidth: 280,
        maxWidth: 900,
        minHeight: 380,
        maxHeight: 1300,
        showCover: true,
        usePortrait: true,
        mobileScrollSupport: true,
        maxShadowOpacity: 0.45,
        flippingTime: 750,
        // BOYUT CSS'TE (bkz. globals.css · .yayin-kitap). autoSize açıkken
        // kütüphane yüksekliği yalnızca genişlikten hesaplıyor ve CSS'teki
        // sınırı görmüyordu: tam ekranda kitap denetim düğmelerinin üstüne
        // taşıyordu. Kapalıyken kökün ölçüsüne sığdırıyor.
        autoSize: false,
      });
      kitap.on("flip", ({ data }) => { setSayfa(data); yukle(data); });
      kitap.on("changeOrientation", ({ data }) => setYatay(data === "landscape"));
      kitap.loadFromHTML(sayfalar);
      kitapRef.current = kitap;
      setYatay(kitap.getOrientation() === "landscape");
      setHazir(true);
    });

    return () => {
      iptal = true;
      kitapRef.current = null;
      if (kitap) kitap.destroy(); else kok.remove();
    };
  }, [kokAdres, sayfaSayisi, genislik, yukseklik]);

  const git = useCallback((hedef: number) => {
    const kitap = kitapRef.current;
    if (!kitap) return;
    const sinirli = Math.max(0, Math.min(sayfaSayisi - 1, hedef));
    // Yakın sayfaya canlandırarak, uzağa doğrudan: 40 sayfa ötesi için
    // tek bir kıvrılma, araya giren sayfaları göstermeden atlıyor zaten.
    if (Math.abs(sinirli - kitap.getCurrentPageIndex()) <= 2) kitap.flip(sinirli);
    else { kitap.turnToPage(sinirli); setSayfa(kitap.getCurrentPageIndex()); }
  }, [sayfaSayisi]);

  // Klavye: kitap ekrandayken ok tuşları sayfa çevirir (yazı alanında değil).
  useEffect(() => {
    const tus = (olay: KeyboardEvent) => {
      const hedef = olay.target as HTMLElement | null;
      if (hedef?.closest("input, textarea, select, [contenteditable]")) return;
      if (olay.key === "ArrowRight") kitapRef.current?.flipNext();
      else if (olay.key === "ArrowLeft") kitapRef.current?.flipPrev();
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, []);

  // Tam ekrana girip çıkınca kitabın kökü yeni ölçüsünü CSS'ten alıyor;
  // kütüphane yalnızca pencere boyutunu dinlediği için bir kez de elle ölçtür.
  useEffect(() => {
    const yenile = () => requestAnimationFrame(() => kitapRef.current?.update());
    document.addEventListener("fullscreenchange", yenile);
    return () => document.removeEventListener("fullscreenchange", yenile);
  }, []);

  // Şeritte açık sayfanın önizlemesi görünür kalsın.
  useEffect(() => {
    const serit = seritRef.current;
    const etkin = serit?.querySelector<HTMLElement>(`[data-sayfa="${sayfa}"]`);
    if (!serit || !etkin) return;
    serit.scrollTo({ left: etkin.offsetLeft - serit.clientWidth / 2 + etkin.clientWidth / 2, behavior: "smooth" });
  }, [sayfa]);

  const tamEkran = () => {
    const kap = kapRef.current;
    if (!kap) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void kap.requestFullscreen?.();
  };

  // Yatayda kapak ve arka kapak tek, aradakiler çift sayfa: 2–3, 4–5 …
  const ikinci = yatay && sayfa > 0 && sayfa < sayfaSayisi - 1 ? sayfa + 1 : null;
  const gosterge = ikinci !== null ? `${sayfa + 1}–${ikinci + 1}` : `${sayfa + 1}`;

  return (
    <div className="yayin-okuyucu" ref={kapRef} style={{ "--yayin-oran": genislik / yukseklik } as React.CSSProperties}>
      <div className="yayin-sahne" ref={sahneRef} aria-busy={!hazir}>
        {!hazir && <p className="yayin-yukleniyor">{e.yukleniyor}</p>}
      </div>

      <div className="yayin-denetim">
        <button type="button" className="button button-secondary" onClick={() => kitapRef.current?.flipPrev()}
          disabled={!hazir || sayfa === 0} aria-label={e.onceki}>‹</button>
        <span className="yayin-gosterge" aria-live="polite">
          {e.sayfa} {gosterge} / {sayfaSayisi}
        </span>
        <button type="button" className="button button-secondary" onClick={() => kitapRef.current?.flipNext()}
          disabled={!hazir || (ikinci ?? sayfa) >= sayfaSayisi - 1} aria-label={e.sonraki}>›</button>
        <span className="yayin-denetim-ara" />
        <button type="button" className="button button-secondary" onClick={tamEkran}>{e.tamEkran}</button>
        <a className="button button-secondary" href={pdfAdresi} download>{e.pdf}</a>
      </div>

      <div className="yayin-serit" ref={seritRef} role="list" aria-label={e.onizlemeler}>
        {Array.from({ length: sayfaSayisi }, (_, i) => (
          <button type="button" role="listitem" key={i} data-sayfa={i}
            className={i === sayfa || i === ikinci ? "yayin-onizleme etkin" : "yayin-onizleme"}
            onClick={() => git(i)} aria-label={`${i + 1}. ${e.git}`}>
            <img src={`${kokAdres}/k${no(i)}.webp`} alt="" loading="lazy" decoding="async" />
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
