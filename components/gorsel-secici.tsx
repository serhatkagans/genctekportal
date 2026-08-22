"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gorselYolu, uygulamaYolu } from "@/lib/ortam";
import { Icon } from "./icons";

export type MedyaOgesi = { ad: string; url: string; boyut: number; kaynak: "yuklenen" | "ice-aktarilan" };

type Kaynak = "hepsi" | "yuklenen" | "ice-aktarilan";

const KAYNAKLAR: { deger: Kaynak; etiket: string }[] = [
  { deger: "hepsi", etiket: "Tümü" },
  { deger: "yuklenen", etiket: "Yüklenenler" },
  { deger: "ice-aktarilan", etiket: "İçe aktarılanlar" },
];

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

// Küçük resim ayrı bir kutunun içinde duruyor: kutunun yüksekliği sabit olduğu
// için görsel geç yüklense ya da hiç açılmasa da hücre boyu değişmiyor. Eski
// sürümde yüksekliği doğrudan img taşıyordu, açılmayan dosyalar satırı çökertip
// listeyi üst üste binmiş çizgilere çeviriyordu.
function Kucuk({ url, ad }: { url: string; ad: string }) {
  const [bozuk, setBozuk] = useState(false);
  return (
    <span className="medya-secici-gorsel">
      {bozuk
        ? <span className="medya-secici-bozuk"><Icon name="file" /></span>
        : <img src={gorselYolu(url)} alt={ad} loading="lazy" onError={() => setBozuk(true)} />}
    </span>
  );
}

// Hem kapak görseli hem gövde içi görsel bu pencereden seçiliyor: kütüphane
// aranabilir bir galeri olarak açılıyor, yeni dosya buradan yüklenip anında
// seçilebiliyor. Sayfanın üstünde tam ekran duruyor ki dar sütunlara sıkışmasın.
export function GorselSecici({ baslik, onSec, onKapat }: {
  baslik: string;
  onSec: (oge: MedyaOgesi) => void;
  onKapat: () => void;
}) {
  const [dosyalar, setDosyalar] = useState<MedyaOgesi[] | null>(null);
  const [toplam, setToplam] = useState(0);
  const [dahaVar, setDahaVar] = useState(false);
  const [arama, setArama] = useState("");
  const [kaynak, setKaynak] = useState<Kaynak>("hepsi");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [suruklenen, setSuruklenen] = useState(false);
  const [sayfaAliniyor, setSayfaAliniyor] = useState(false);
  const dosyaGirdisi = useRef<HTMLInputElement>(null);
  const govdeAlani = useRef<HTMLDivElement>(null);

  const sayfaCek = useCallback(async (atla: number, aramaMetni: string, secilenKaynak: Kaynak) => {
    setSayfaAliniyor(true);
    try {
      const sorgu = new URLSearchParams({ arama: aramaMetni, kaynak: secilenKaynak, atla: String(atla) });
      const yanit = await fetch(`${uygulamaYolu("/api/yonetim/medya")}?${sorgu}`);
      if (!yanit.ok) throw new Error("Medya listesi alınamadı.");
      const veri = await yanit.json() as { dosyalar: MedyaOgesi[]; toplam: number; dahaVar: boolean };
      setDosyalar((onceki) => (atla === 0 ? veri.dosyalar : [...(onceki ?? []), ...veri.dosyalar]));
      setToplam(veri.toplam);
      setDahaVar(veri.dahaVar);
      setHata("");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Medya listesi alınamadı.");
      if (atla === 0) setDosyalar([]);
    } finally {
      setSayfaAliniyor(false);
    }
  }, []);

  // Arama kutusunda her harfte istek atmıyoruz; kaynak değişince liste baştan.
  useEffect(() => {
    const zamanlayici = setTimeout(() => {
      govdeAlani.current?.scrollTo({ top: 0 });
      void sayfaCek(0, arama, kaynak);
    }, arama ? 250 : 0);
    return () => clearTimeout(zamanlayici);
  }, [arama, kaynak, sayfaCek]);

  // Pencere açıkken Esc kapatıyor ve arkadaki sayfa kaymıyor.
  useEffect(() => {
    const tus = (e: KeyboardEvent) => { if (e.key === "Escape") onKapat(); };
    document.addEventListener("keydown", tus);
    const oncekiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tus);
      document.body.style.overflow = oncekiTasma;
    };
  }, [onKapat]);

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

  const liste = dosyalar ?? [];

  const pencere = (
    <div
      className="medya-secici-perde"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onKapat(); }}
    >
      <section
        className={`medya-secici${suruklenen ? " medya-secici-birakma" : ""}`}
        role="dialog"
        aria-modal="true"
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
        <header className="medya-secici-ust">
          <div>
            <strong>{baslik}</strong>
            <span className="medya-secici-sayi">
              {dosyalar === null ? "yükleniyor…" : `${toplam} görsel`}
            </span>
          </div>
          <button type="button" className="medya-secici-kapat" onClick={onKapat} aria-label="Seçiciyi kapat">×</button>
        </header>

        <div className="medya-secici-araclar">
          <label className="medya-secici-arama">
            <Icon name="search" />
            <input
              autoFocus
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Dosya adında ara"
            />
          </label>
          <div className="medya-secici-suzgec" role="group" aria-label="Kaynak">
            {KAYNAKLAR.map((k) => (
              <button
                type="button"
                key={k.deger}
                className={kaynak === k.deger ? "medya-secici-suzgec-etkin" : ""}
                aria-pressed={kaynak === k.deger}
                onClick={() => setKaynak(k.deger)}
              >
                {k.etiket}
              </button>
            ))}
          </div>
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

        {hata ? <p className="gorsel-secici-hata" role="alert">{hata}</p> : null}

        <div className="medya-secici-govde" ref={govdeAlani}>
          {dosyalar === null ? (
            <p className="medya-secici-durum">Kütüphane yükleniyor…</p>
          ) : liste.length === 0 ? (
            <p className="medya-secici-durum">
              Eşleşen görsel yok. Yukarıdaki düğmeyle yeni bir dosya yükleyebilir ya da buraya sürükleyip bırakabilirsin.
            </p>
          ) : (
            <>
              <div className="medya-secici-izgara">
                {liste.map((d) => (
                  <button type="button" key={d.url} className="medya-secici-oge" onClick={() => onSec(d)} title={d.url}>
                    <Kucuk url={d.url} ad={d.ad} />
                    <span className="medya-secici-ad">{d.ad}</span>
                    <span className="medya-secici-bilgi">
                      {boyutYaz(d.boyut)} · {d.kaynak === "yuklenen" ? "yüklenen" : "içe aktarılan"}
                    </span>
                  </button>
                ))}
              </div>
              {dahaVar ? (
                <div className="medya-secici-daha">
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={sayfaAliniyor}
                    onClick={() => void sayfaCek(liste.length, arama, kaynak)}
                  >
                    {sayfaAliniyor ? "Yükleniyor…" : "Daha fazla göster"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <footer className="medya-secici-alt">
          {suruklenen
            ? "Bırak, yüklensin."
            : dosyalar === null
              ? "Görseli buraya sürükleyip bırakabilirsin."
              : `${liste.length} / ${toplam} görsel gösteriliyor · sürükleyip bırakarak da yükleyebilirsin`}
        </footer>
      </section>
    </div>
  );

  // Portal: seçici, taşması gizlenmiş dar bir sütunun ya da yan rayın içinde
  // sıkışmasın diye doğrudan body'ye açılıyor.
  return typeof document === "undefined" ? null : createPortal(pencere, document.body);
}
