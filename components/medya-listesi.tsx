"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiYolu, gorselYolu } from "@/lib/ortam";
import { Icon } from "./icons";

type Dosya = { ad: string; url: string; boyut: number; gorselMi: boolean; kaynak: "yuklenen" | "ice-aktarilan" };

function boyutYaz(bayt: number) {
  if (bayt < 1024) return `${bayt} B`;
  if (bayt < 1024 * 1024) return `${(bayt / 1024).toFixed(0)} KB`;
  return `${(bayt / 1024 / 1024).toFixed(1)} MB`;
}

export function MedyaListesi({ dosyalar }: { dosyalar: Dosya[] }) {
  const router = useRouter();
  const [arama, setArama] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [kopyalanan, setKopyalanan] = useState("");
  const dosyaGirdisi = useRef<HTMLInputElement>(null);

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    return q ? dosyalar.filter(d => d.ad.toLocaleLowerCase("tr-TR").includes(q)) : dosyalar;
  }, [arama, dosyalar]);

  async function yukle(dosya: File) {
    setHata("");
    setYukleniyor(true);
    try {
      const govde = new FormData();
      govde.append("dosya", dosya);
      const yanit = await fetch(apiYolu("/api/yonetim/medya"), { method: "POST", body: govde });
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata ?? "Yükleme başarısız.");
      router.refresh();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setYukleniyor(false);
      if (dosyaGirdisi.current) dosyaGirdisi.current.value = "";
    }
  }

  async function yoluKopyala(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setKopyalanan(url);
      setTimeout(() => setKopyalanan(""), 1500);
    } catch { /* pano izni yoksa sessiz geç */ }
  }

  return (
    <>
      <div className="admin-toolbar">
        <label><Icon name="search"/><input value={arama} onChange={e => setArama(e.target.value)} placeholder="Dosya adında ara"/></label>
        <span className="result-count">{filtreli.length} dosya</span>
        <label className="button button-primary gorsel-secici-yukle">
          {yukleniyor ? "Yükleniyor…" : "Görsel yükle"}
          <input
            ref={dosyaGirdisi}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            disabled={yukleniyor}
            onChange={e => { const d = e.target.files?.[0]; if (d) void yukle(d); }}
          />
        </label>
      </div>
      {hata ? <p className="gorsel-secici-hata">{hata}</p> : null}
      <div className="medya-izgara">
        {filtreli.slice(0, 300).map(d => (
          <figure className="medya-kutu" key={d.url}>
            {d.gorselMi
              ? <img src={gorselYolu(d.url)} alt="" loading="lazy" />
              : <div className="medya-dosya"><Icon name="file"/></div>}
            <figcaption>
              <strong title={d.ad}>{d.ad}</strong>
              <span>{boyutYaz(d.boyut)} · {d.kaynak === "yuklenen" ? "yüklenen" : "içe aktarılan"}</span>
              <button type="button" className="medya-yol" onClick={() => void yoluKopyala(d.url)} title="Yolu kopyala">
                {kopyalanan === d.url ? "kopyalandı" : d.url}
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
      {filtreli.length > 300 ? <p className="result-count">İlk 300 dosya gösteriliyor; daralt için arama kullan.</p> : null}
      {filtreli.length === 0 ? <div className="empty-admin"><strong>Eşleşen dosya yok.</strong></div> : null}
    </>
  );
}
