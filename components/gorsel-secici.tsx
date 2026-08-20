"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { gorselYolu, uygulamaYolu } from "@/lib/ortam";
import { Icon } from "./icons";

export type MedyaOgesi = { ad: string; url: string; boyut: number; kaynak: "yuklenen" | "ice-aktarilan" };

// Tek yükleme noktası: seçici de, alan bileşeni de bunu çağırıyor.
export async function gorselYukle(dosya: File): Promise<MedyaOgesi> {
  const govde = new FormData();
  govde.append("dosya", dosya);
  const yanit = await fetch(uygulamaYolu("/api/yonetim/medya"), { method: "POST", body: govde });
  const veri = await yanit.json();
  if (!yanit.ok) throw new Error(veri.hata ?? "Yükleme başarısız.");
  return veri.dosya as MedyaOgesi;
}

// Sürüklenen ilk görsel dosyasını verir; klasör veya metin sürüklenirse null.
export function birakilaniCoz(veri: DataTransfer): File | null {
  const dosyalar = Array.from(veri.files);
  return dosyalar.find((d) => d.type.startsWith("image/")) ?? null;
}

function boyutYaz(bayt: number) {
  if (bayt < 1024) return `${bayt} B`;
  if (bayt < 1024 * 1024) return `${(bayt / 1024).toFixed(0)} KB`;
  return `${(bayt / 1024 / 1024).toFixed(1)} MB`;
}

// Hem kapak görseli hem gövde içi görsel bu panelden seçiliyor: kütüphanedeki
// dosyalar listelenir, yeni dosya buradan yüklenip anında seçilebilir.
export function GorselSecici({ baslik, onSec, onKapat }: {
  baslik: string;
  onSec: (oge: MedyaOgesi) => void;
  onKapat: () => void;
}) {
  const [dosyalar, setDosyalar] = useState<MedyaOgesi[] | null>(null);
  const [arama, setArama] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [suruklenen, setSuruklenen] = useState(false);
  const dosyaGirdisi = useRef<HTMLInputElement>(null);

  const listeyiCek = useCallback(async () => {
    try {
      const yanit = await fetch(uygulamaYolu("/api/yonetim/medya"));
      if (!yanit.ok) throw new Error("Medya listesi alınamadı.");
      const veri = await yanit.json();
      setDosyalar(veri.dosyalar as MedyaOgesi[]);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Medya listesi alınamadı.");
      setDosyalar([]);
    }
  }, []);

  useEffect(() => { void listeyiCek(); }, [listeyiCek]);

  async function yukle(dosya: File) {
    setHata("");
    setYukleniyor(true);
    try {
      const yeni = await gorselYukle(dosya);
      setDosyalar((onceki) => [yeni, ...(onceki ?? [])]);
      onSec(yeni);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setYukleniyor(false);
      if (dosyaGirdisi.current) dosyaGirdisi.current.value = "";
    }
  }

  const q = arama.trim().toLocaleLowerCase("tr-TR");
  const filtreli = (dosyalar ?? []).filter((d) => !q || d.ad.toLocaleLowerCase("tr-TR").includes(q));

  return (
    <section
      className={`gorsel-secici${suruklenen ? " gorsel-secici-birakma" : ""}`}
      aria-label={baslik}
      onDragOver={(e) => { e.preventDefault(); setSuruklenen(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSuruklenen(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setSuruklenen(false);
        const dosya = birakilaniCoz(e.dataTransfer);
        if (dosya) void yukle(dosya);
        else setHata("Yalnızca görsel dosyası bırakabilirsin.");
      }}
    >
      <header className="gorsel-secici-ust">
        <strong>{baslik}</strong>
        <button type="button" className="gorsel-secici-kapat" onClick={onKapat} aria-label="Seçiciyi kapat">×</button>
      </header>

      <p className="gorsel-secici-ipucu">
        {suruklenen ? "Bırak, yüklensin." : "Dosyayı buraya sürükleyip bırakabilir ya da aşağıdan seçebilirsin."}
      </p>

      <div className="gorsel-secici-araclar">
        <label className="gorsel-secici-arama">
          <Icon name="search" />
          <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Dosya adında ara" />
        </label>
        <label className="button button-secondary gorsel-secici-yukle">
          {yukleniyor ? "Yükleniyor…" : "Bilgisayardan yükle"}
          <input
            ref={dosyaGirdisi}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            disabled={yukleniyor}
            onChange={(e) => { const d = e.target.files?.[0]; if (d) void yukle(d); }}
          />
        </label>
      </div>

      {hata ? <p className="gorsel-secici-hata">{hata}</p> : null}

      {dosyalar === null ? (
        <p className="result-count">Kütüphane yükleniyor…</p>
      ) : filtreli.length === 0 ? (
        <p className="result-count">Eşleşen görsel yok. Yukarıdaki düğmeyle yeni bir dosya yükleyebilirsin.</p>
      ) : (
        <div className="gorsel-secici-izgara">
          {filtreli.slice(0, 120).map((d) => (
            <button type="button" key={d.url} className="gorsel-secici-oge" onClick={() => onSec(d)} title={d.url}>
              <img src={gorselYolu(d.url)} alt="" loading="lazy" />
              <span className="gorsel-secici-ad">{d.ad}</span>
              <span className="gorsel-secici-bilgi">
                {boyutYaz(d.boyut)} · {d.kaynak === "yuklenen" ? "yüklenen" : "içe aktarılan"}
              </span>
            </button>
          ))}
        </div>
      )}
      {filtreli.length > 120 ? <p className="result-count">İlk 120 görsel gösteriliyor; daraltmak için arama kullan.</p> : null}
    </section>
  );
}
