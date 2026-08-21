import type { HaberKarti } from "@/lib/haber";
import { WordPressCard } from "./wordpress-card";

export function HaberGalerisi({ haberler }: { haberler: HaberKarti[] }) {
  if (haberler.length === 0) return null;

  return (
    <section
      className="haber-galerisi"
      aria-roledescription="dönen haber galerisi"
      aria-label="Son haberler ve etkinlikler"
    >
      <div className="haber-galeri-pencere">
        <div className="haber-galeri-serit">
          {haberler.map((haber) => (
            <div className="haber-galeri-kart" key={haber.id}>
              <WordPressCard item={haber} />
            </div>
          ))}
          <div className="haber-galeri-tekrar" aria-hidden="true">
            {haberler.map((haber) => (
              <div className="haber-galeri-kart" key={`tekrar-${haber.id}`}>
                <WordPressCard item={haber} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="haber-galeri-denetimleri">
        <span><strong>{haberler.length}</strong> güncel içerik</span>
      </div>
    </section>
  );
}
