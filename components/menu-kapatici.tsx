"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * MENÜLERİ KAPATAN EK (2 Eylül 2026 · istek: "bazen normal web ortamında menü
 * takılı kalıyor boş yere tıklanınca da kapanmıyor").
 *
 * Üst menüdeki açılır kutular `<details>` — açılmaları için BETİK GEREKMİYOR
 * (header.tsx'teki nota bakınız) ve bu bilinçli. Ama `<details>` yalnızca
 * kendi `<summary>`si ile kapanır: boşluğa tıklamak, Esc'e basmak ya da
 * menüden bir sayfaya gitmek onu açık bırakır. Masaüstünde açık kalan kutu
 * altındaki içeriği örtüyordu.
 *
 * Bu bileşen SADECE KAPATIR — bir ek özellik (progressive enhancement).
 * Betik yüklenmezse menü eskisi gibi çalışmaya devam eder; hiçbir şey
 * bozulmaz, yalnızca kapatma kolaylığı olmaz.
 *
 * Dört kapanma sebebi var: dışarı tıklama, Esc, menüden bir bağlantıya
 * tıklama (istemci tarafı gezinmede header sökülmediği için DOM'daki `open`
 * kendiliğinden gitmez) ve adres değişimi (tarayıcının geri tuşu).
 *
 * Kardeş kutular da birbirini kapatıyor: iki açılır menü aynı anda açıkken
 * paneller üst üste biniyordu.
 */
export function MenuKapatici() {
  const yol = usePathname();

  useEffect(() => {
    const acikOlanlar = () =>
      Array.from(
        document.querySelectorAll<HTMLDetailsElement>(".site-header details[open]"),
      );

    const kapat = (haric?: Element | null) => {
      for (const kutu of acikOlanlar()) {
        if (haric && (kutu === haric || kutu.contains(haric))) continue;
        kutu.open = false;
      }
    };

    /* Tıklama değil "pointerdown": bağlantıya basıldığında gezinme başlamadan
       önce kutuyu kapatmak, kapanmanın sayfa geçişine takılmasını önlüyor. */
    const disariBasildi = (olay: PointerEvent) => {
      const hedef = olay.target;
      if (!(hedef instanceof Element)) return;
      /* Menü içindeki bir bağlantıya basıldıysa hepsi kapanır; başka bir yere
         basıldıysa yalnızca o tıklamayı içermeyen kutular kapanır. */
      const baglanti = hedef.closest(".site-header a");
      kapat(baglanti ? null : hedef);
    };

    const tusaBasildi = (olay: KeyboardEvent) => {
      if (olay.key !== "Escape") return;
      const acik = acikOlanlar();
      if (acik.length === 0) return;
      kapat();
      /* Odak kapanan panelin içinde kalmasın: klavyeyle gezen kişi Esc'ten
         sonra menü başlığına döner. */
      const odak = document.activeElement;
      if (odak instanceof HTMLElement && acik.some((kutu) => kutu.contains(odak))) {
        acik.find((kutu) => kutu.contains(odak))?.querySelector("summary")?.focus();
      }
    };

    /* "toggle" balonlanmaz; yakalama aşamasında dinleniyor. */
    const acildi = (olay: Event) => {
      const hedef = olay.target;
      if (!(hedef instanceof HTMLDetailsElement) || !hedef.open) return;
      if (!hedef.closest(".site-header")) return;
      kapat(hedef);
    };

    document.addEventListener("pointerdown", disariBasildi);
    document.addEventListener("keydown", tusaBasildi);
    document.addEventListener("toggle", acildi, true);
    return () => {
      document.removeEventListener("pointerdown", disariBasildi);
      document.removeEventListener("keydown", tusaBasildi);
      document.removeEventListener("toggle", acildi, true);
    };
  }, []);

  /* Adres değiştiğinde (menüden gezinme ya da geri tuşu) her şey kapanır. */
  useEffect(() => {
    for (const kutu of document.querySelectorAll<HTMLDetailsElement>(
      ".site-header details[open]",
    )) {
      kutu.open = false;
    }
  }, [yol]);

  return null;
}
