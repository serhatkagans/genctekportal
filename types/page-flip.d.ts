/* page-flip 2.0.7 tip dosyası taşımıyor; yalnızca components/yayin-okuyucu.tsx'in
   kullandığı kısım burada. Ayarların tamamı node_modules/page-flip/src/Settings.ts. */
declare module "page-flip" {
  export type PageFlipAyarlari = {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    startPage?: number;
    showCover?: boolean;
    usePortrait?: boolean;
    autoSize?: boolean;
    drawShadow?: boolean;
    maxShadowOpacity?: number;
    flippingTime?: number;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  };

  export class PageFlip {
    constructor(kok: HTMLElement, ayarlar: PageFlipAyarlari);
    loadFromHTML(sayfalar: HTMLElement[] | NodeListOf<HTMLElement>): void;
    on(olay: "flip", isleyici: (e: { data: number }) => void): PageFlip;
    on(olay: "changeOrientation", isleyici: (e: { data: "portrait" | "landscape" }) => void): PageFlip;
    on(olay: "init", isleyici: (e: { data: { page: number; mode: "portrait" | "landscape" } }) => void): PageFlip;
    flipNext(): void;
    flipPrev(): void;
    flip(sayfa: number): void;
    turnToPage(sayfa: number): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): "portrait" | "landscape";
    update(): void;
    destroy(): void;
  }
}
