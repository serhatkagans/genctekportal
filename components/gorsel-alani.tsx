"use client";
import { useRef, useState } from "react";
import { gorselYolu } from "@/lib/ortam";
import { GorselSecici, birakilaniCoz, gorselYukle, type MedyaOgesi } from "./gorsel-secici";

// Form içindeki tek bir görsel alanı. Yol yazmak yerine: kütüphaneden seç,
// bilgisayardan yükle ya da dosyayı doğrudan alanın üzerine bırak.
// Değer gizli girdiyle taşınır, böylece çevreleyen form sunucu bileşeni kalabilir.
export function GorselAlani({ name, baslangic = "", etiket, yardim, kompakt = false, seciciBasligi }: {
  name: string;
  baslangic?: string;
  etiket?: string;
  yardim?: string;
  kompakt?: boolean;
  seciciBasligi?: string;
}) {
  const [deger, setDeger] = useState(baslangic);
  const [secici, setSecici] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [suruklenen, setSuruklenen] = useState(false);
  const [hata, setHata] = useState("");
  const dosyaGirdisi = useRef<HTMLInputElement>(null);

  async function dosyayiAl(dosya: File) {
    setHata("");
    setYukleniyor(true);
    try {
      setDeger((await gorselYukle(dosya)).url);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setYukleniyor(false);
      if (dosyaGirdisi.current) dosyaGirdisi.current.value = "";
    }
  }

  function birakildi(e: React.DragEvent) {
    e.preventDefault();
    setSuruklenen(false);
    const dosya = birakilaniCoz(e.dataTransfer);
    if (dosya) void dosyayiAl(dosya);
    else setHata("Yalnızca görsel dosyası bırakabilirsin.");
  }

  const suruklemeOlaylari = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setSuruklenen(true); },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setSuruklenen(false);
    },
    onDrop: birakildi,
  };

  function secildi(oge: MedyaOgesi) {
    setDeger(oge.url);
    setSecici(false);
  }

  const gizliGirdi = <input type="hidden" name={name} value={deger} />;

  // Satır içi kullanım: küçük yuvarlak önizleme hem düğme hem bırakma alanı.
  if (kompakt) {
    return (
      <div className="gorsel-alani-kompakt">
        {gizliGirdi}
        <button
          type="button"
          className={`gorsel-kucuk${suruklenen ? " gorsel-birakma" : ""}`}
          onClick={() => setSecici((a) => !a)}
          title={hata || deger || "Görsel seç, yükle veya sürükleyip bırak"}
          aria-label={etiket ?? "Görsel seç veya yükle"}
          {...suruklemeOlaylari}
        >
          {yukleniyor
            ? <span className="gorsel-kucuk-durum">…</span>
            : deger
              ? <img src={gorselYolu(deger)} alt="" loading="lazy" />
              : <span className="gorsel-kucuk-durum">+</span>}
        </button>
        {hata ? <span className="gorsel-alani-hata" role="alert">{hata}</span> : null}
        {secici ? (
          <div className="gorsel-alani-acilir">
            <GorselSecici
              baslik={seciciBasligi ?? "Görsel seç"}
              onSec={secildi}
              onKapat={() => setSecici(false)}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="kapak-alani">
      {etiket ? <span className="kapak-etiket">{etiket}</span> : null}
      {gizliGirdi}

      <div
        className={`gorsel-birakma-alani${suruklenen ? " gorsel-birakma" : ""}`}
        {...suruklemeOlaylari}
      >
        {deger ? (
          <img className="editor-onizleme" src={gorselYolu(deger)} alt="" />
        ) : (
          <div className="kapak-bos">
            {yukleniyor ? "Yükleniyor…" : suruklenen ? "Bırak, yüklensin" : "Görseli buraya sürükleyip bırak"}
          </div>
        )}
      </div>

      <div className="kapak-dugmeler">
        <button type="button" className="button button-secondary" onClick={() => setSecici((a) => !a)}>
          {deger ? "Değiştir" : "Kütüphaneden seç"}
        </button>
        <label className="button button-secondary gorsel-secici-yukle">
          {yukleniyor ? "Yükleniyor…" : "Yükle"}
          <input
            ref={dosyaGirdisi}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            disabled={yukleniyor}
            onChange={(e) => { const d = e.target.files?.[0]; if (d) void dosyayiAl(d); }}
          />
        </label>
        {deger ? <button type="button" className="kapak-kaldir" onClick={() => setDeger("")}>Kaldır</button> : null}
      </div>

      {hata ? <p className="gorsel-secici-hata" role="alert">{hata}</p> : null}
      {yardim && !hata ? <small className="kapak-yardim">{yardim}</small> : null}
      {deger ? <code className="kapak-yol">{deger}</code> : null}
      {secici ? (
        <GorselSecici baslik={seciciBasligi ?? "Görsel seç"} onSec={secildi} onKapat={() => setSecici(false)} />
      ) : null}
    </div>
  );
}
