import type { Metadata } from "next";
import { Archivo, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// latin-ext, Türkçe ş/ğ/İ/ı/ç/ö/ü için zorunlu; eksikse tarayıcı kelime ortasında yedek fonta düşer.
const display = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display-face",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-body-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "GençTek | Sektörün Yeni Liderleri", template: "%s | GençTek" },
  description: "Gençlerin teknolojiyle ürettiği, paylaştığı ve birlikte büyüdüğü bilişim ekosistemi.",
  metadataBase: new URL("https://genctek.eba.gov.tr"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(()=>{const a="genctek-tema",d=document.documentElement;const k=()=>d.dataset.theme==="kirmizi";const g=()=>{document.querySelectorAll("[data-tema-secici]").forEach(b=>{const r=k();b.setAttribute("aria-pressed",String(r));b.setAttribute("aria-label",r?"Açık temaya geç":"Kırmızı temaya geç");b.title=r?"Açık temaya geç":"Kırmızı temaya geç";const m=b.querySelector(".tema-secici-metin");if(m)m.textContent=r?"Açık tema":"Kırmızı tema"})};try{if(localStorage.getItem(a)==="kirmizi")d.dataset.theme="kirmizi"}catch{}document.addEventListener("DOMContentLoaded",g);document.addEventListener("click",e=>{const t=e.target instanceof Element?e.target.closest("[data-tema-secici]"):null;if(!t)return;e.preventDefault();if(k())delete d.dataset.theme;else d.dataset.theme="kirmizi";try{localStorage.setItem(a,k()?"kirmizi":"acik")}catch{}g()})})();` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
