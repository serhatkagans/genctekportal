"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { gorselYolu } from "@/lib/ortam";
import { Icon } from "./icons";

type Satir = { id: number; title: string; slug: string; date: string; featuredImage: string };

export function HaberListesi({ haberler }: { haberler: Satir[] }) {
  const [arama, setArama] = useState("");

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    if (!q) return haberler;
    return haberler.filter(h => `${h.title} ${h.slug}`.toLocaleLowerCase("tr-TR").includes(q));
  }, [arama, haberler]);

  return (
    <>
      <div className="admin-toolbar">
        <label><Icon name="search"/><input value={arama} onChange={e => setArama(e.target.value)} placeholder="Başlık veya adreste ara"/></label>
        <span className="result-count">{filtreli.length} haber</span>
      </div>
      <section className="admin-panel">
        <div className="resource-list">
          {filtreli.map(h => (
            <Link className="haber-satiri" href={`/yonetim/icerik/${h.id}`} key={h.id}>
              <img src={gorselYolu(h.featuredImage || "/Genc.png")} alt="" loading="lazy" />
              <div>
                <strong>{h.title}</strong>
                <span>/haberler/{h.slug}</span>
              </div>
              <time dateTime={h.date}>{new Date(h.date).toLocaleDateString("tr-TR")}</time>
              <span className="haber-duzenle">Düzenle →</span>
            </Link>
          ))}
          {filtreli.length === 0 && <div className="empty-admin"><strong>Eşleşen haber yok.</strong><p>Arama ölçütlerini değiştir.</p></div>}
        </div>
      </section>
    </>
  );
}
