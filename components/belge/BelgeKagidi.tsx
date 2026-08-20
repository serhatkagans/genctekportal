import type { BelgeMetni } from "@/lib/belge/kurallar";

export function BelgeKagidi({
  belge,
  imzaAdSoyad,
  imzaBirim,
}: {
  belge: BelgeMetni;
  imzaAdSoyad: string;
  imzaBirim: string;
}): React.ReactElement {
  return (
    <div className="belge-kagit">
      <div className="belge-guvenli-alan">
        <div className="belge-ana-metin">
          <p className="belge-baslik">{belge.baslik}</p>
          <p className="belge-ad">{belge.adSoyad}</p>
          <p className="belge-metin">{belge.govde}</p>
        </div>
        <div className="belge-alt">
          <time>{belge.tarihMetni}</time>
          <div className="belge-imza">
            <div className="belge-imza-cizgi">{imzaAdSoyad}</div>
            <div className="belge-birim">{imzaBirim}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
