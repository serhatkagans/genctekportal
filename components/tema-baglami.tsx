"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { uygulamaYolu } from "@/lib/ortam";
import { TEMA_CEREZI, type Tema } from "@/lib/tema-tercihi";

/**
 * TEMA TERCİHİ (4 Eylül 2026'da yeniden yazıldı).
 *
 * ÖNCEDEN: tercih `localStorage`daydı ve app/layout.tsx'te satır içi bir
 * `<script>` React'ten önce çalışıp `data-theme`i yazıyordu. Sunucu tercihi
 * göremediği için düğme de yanlış yazıyla basılıyor, farkı iki yerde
 * `suppressHydrationWarning` ile susturuyorduk. React 19 üstelik "Encountered a
 * script tag while rendering React component" uyarısı veriyordu; `next/script`
 * + `beforeInteractive` ise betiği Next'in kuyruğuna (`__next_s`) alıyor ve
 * tema ancak hydration'dan sonra uygulanıyor — kırmızı temayı seçen kullanıcı
 * her açılışta bir an beyaz ekran görürdü. Ölçüldü: üretim çıktısında da öyle.
 *
 * ŞİMDİ: tercih bir ÇEREZDE. Sunucu çerezi okuyup `<html data-theme>`i doğru
 * basıyor; ne satır içi betik kaldı, ne uyumsuzluk, ne de titreme. Çerez
 * yalnızca bu tercihi taşır, kimlik bilgisi değil.
 *
 * ÇEREZ YOLU UYGULAMANIN KENDİ DİZİNİ: portal bir alt dizinde de yayınlanıyor
 * ve aynı alan adındaki öteki uygulamaya sızmasın diye kök yerine kendi yolu
 * veriliyor.
 */

export type { Tema } from "@/lib/tema-tercihi";

const TemaBaglami = createContext<{ tema: Tema; degistir: () => void }>({
  tema: "acik",
  degistir: () => {},
});

export function temaCereziniYaz(tema: Tema) {
  // Bir yıl: tercih tarayıcı kapanınca unutulmamalı. SameSite=Lax, çünkü çerez
  // yalnızca kendi sayfalarımızda okunuyor.
  document.cookie = `${TEMA_CEREZI}=${tema}; path=${uygulamaYolu("/")}; max-age=31536000; samesite=lax`;
}

export function TemaSaglayici({ baslangic, children }: { baslangic: Tema; children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(baslangic);

  /*
   * ESKİ TERCİHİ BİR KEREYE MAHSUS TAŞI: bu değişiklikten önce kırmızı temayı
   * seçmiş kullanıcıların tercihi `localStorage`da duruyor, çerezde yok.
   * Çerez yoksa ve orada "kirmizi" yazıyorsa tercih çereze geçiriliyor —
   * kullanıcı ayarını ikinci kez yapmak zorunda kalmasın. Bir sonraki açılışta
   * artık sunucu da biliyor.
   */
  useEffect(() => {
    if (document.cookie.includes(`${TEMA_CEREZI}=`)) return;
    let eski: string | null = null;
    try {
      eski = localStorage.getItem(TEMA_CEREZI);
    } catch {
      return;
    }
    if (eski !== "kirmizi") return;
    temaCereziniYaz("kirmizi");
    document.documentElement.dataset.theme = "kirmizi";
    setTema("kirmizi");
  }, []);

  function degistir() {
    const yeni: Tema = tema === "kirmizi" ? "acik" : "kirmizi";
    // Sınıf hemen uygulanıyor: sayfa yeniden yüklenmeden tema değişsin.
    if (yeni === "kirmizi") document.documentElement.dataset.theme = "kirmizi";
    else delete document.documentElement.dataset.theme;
    temaCereziniYaz(yeni);
    try {
      // Eski anahtar da güncelleniyor: bu sürüme geri dönülürse tercih kaybolmasın.
      localStorage.setItem(TEMA_CEREZI, yeni);
    } catch {
      // Çerezler/depolama kapalıysa tema yine de bu sekmede çalışır.
    }
    setTema(yeni);
  }

  return <TemaBaglami.Provider value={{ tema, degistir }}>{children}</TemaBaglami.Provider>;
}

export function useTema() {
  return useContext(TemaBaglami);
}
