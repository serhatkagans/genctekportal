"use client";

import type { MouseEvent, ReactNode } from "react";

/*
 * MENÜDEKİ "HAKKINDA" BAŞLIĞI (1 Eylül 2026 · istek: "anasayfada Hakkımdaya
 * basınca aşağı hakkımda kartlarına gitsin").
 *
 * Bağlantı bir <summary> içinde duruyor: tıklama hem açılır menüyü açıp
 * kapatıyor hem de çapaya gitmeye çalışıyor, tarayıcıya göre biri diğerini
 * yutuyordu — düz <a href="…#hakkinda"> yeterli olmadı.
 *
 * Burada kaydırmayı kendimiz yapıyoruz: bölüm bu sayfadaysa (yani ana
 * sayfadaysak) menü kapatılıp #hakkinda'ya iniliyor; değilse bağlantı normal
 * davranıp ana sayfaya gidiyor, oradaki karma tarayıcıyı bölüme indiriyor.
 */
export function HakkindaBaglantisi({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const tiklama = (olay: MouseEvent<HTMLAnchorElement>) => {
    // Yeni sekme/pencere isteklerine karışmıyoruz.
    if (olay.defaultPrevented || olay.metaKey || olay.ctrlKey || olay.shiftKey || olay.altKey || olay.button !== 0) return;
    const bolum = document.getElementById("hakkinda");
    if (!bolum) return;

    olay.preventDefault();
    olay.currentTarget.closest("details")?.removeAttribute("open");
    bolum.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#hakkinda");
  };

  return <a className={className} href={href} onClick={tiklama}>{children}</a>;
}
