"use client";
import { useTema } from "./tema-baglami";

/**
 * Tema düğmesi.
 *
 * ARTIK HYDRATION UYUMSUZLUĞU YOK (4 Eylül 2026): tema tercihi çerezde
 * duruyor, yani sunucu da biliyor ve düğme daha ilk basıldığında doğru yazıyla
 * çıkıyor. Önceden tercih `localStorage`daydı; sunucu "Kırmızı tema" basıyor,
 * tarayıcıdaki satır içi betik yazıyı değiştiriyor ve React hydrate olurken
 * farkı görüyordu — iki ayrı `suppressHydrationWarning` o yüzden vardı, ikisi
 * de kalktı (bkz. components/tema-baglami.tsx).
 *
 * Tıklama artık belge üzerinde yakalanan bir olay değil, düğmenin kendi
 * `onClick`i: delegasyon, betiğin React'ten önce çalışması zorunluyken
 * gerekiyordu.
 */
export function TemaSecici() {
  const { tema, degistir } = useTema();
  const kirmiziMi = tema === "kirmizi";
  const etiket = kirmiziMi ? "Açık temaya geç" : "Kırmızı temaya geç";

  return (
    <button
      type="button"
      className="tema-secici"
      data-tema-secici
      aria-pressed={kirmiziMi}
      aria-label={etiket}
      title={etiket}
      onClick={degistir}
    >
      <span className="tema-secici-isaret" aria-hidden />
      <span className="tema-secici-metin">{kirmiziMi ? "Açık tema" : "Kırmızı tema"}</span>
    </button>
  );
}
