import { uygulamaYolu } from "@/lib/ortam";

export function belgeStilleri(): string {
  return `
    @page { size: A4 landscape; margin: 0; }

    .belge-baski-katmani {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      color: #1f2430;
      font-family: Georgia, "Times New Roman", serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .belge-arac-cubugu {
      position: sticky;
      top: 72px;
      z-index: 20;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 16px;
      padding: 10px;
      border: 1px solid #d0d5dd;
      border-radius: 10px;
      background: rgba(255,255,255,.96);
      font-family: system-ui, sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,.08);
    }
    .belge-arac {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 8px 16px;
      border: 1px solid #c9ced6;
      border-radius: 8px;
      background: #fff;
      color: #1f2430;
      font: 600 14px/1.2 system-ui, sans-serif;
      text-decoration: none;
      cursor: pointer;
    }
    .belge-arac-birincil { border-color: #c1272d; background: #c1272d; color: #fff; }
    .belge-sayfasi {
      position: relative;
      display: flex;
      width: 100%;
      min-width: 0;
      justify-content: center;
      margin-bottom: 22px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .belge-sayfasi:not(:last-child) {
      break-after: page;
      page-break-after: always;
    }
    .belge-sira {
      position: absolute;
      top: 10px;
      right: max(10px, calc((100% - min(1180px, 100%)) / 2 + 10px));
      z-index: 2;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(17,24,39,.78);
      color: #fff;
      font: 600 12px/1.2 system-ui, sans-serif;
    }
    .belge-kagit {
      container-type: inline-size;
      position: relative;
      width: min(1180px, 100%);
      aspect-ratio: 3783 / 2756;
      overflow: hidden;
      background: #fff url('${uygulamaYolu("/belge-sablonu.png")}') 0 0 / 100% 100% no-repeat;
      box-shadow: 0 2px 14px rgba(0,0,0,.15);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .belge-guvenli-alan {
      /* %33 logo bandının %29,5 alt sınırını geçer; %15 yan ve %18 alt
         payları da metni çerçevenin içindeki beyaz alanda tutar. */
      position: absolute;
      inset: 33% 15% 18%;
      display: flex;
      min-width: 0;
      min-height: 0;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.1cqw;
      overflow: hidden;
    }
    .belge-ana-metin {
      display: flex;
      min-width: 0;
      min-height: 0;
      flex: 1 1 auto;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: clamp(5px, 1cqw, 13px);
      text-align: center;
    }
    .belge-baslik {
      margin: 0;
      color: #c1272d;
      font-size: clamp(15px, 2.35cqw, 30px);
      font-weight: 700;
      letter-spacing: .22em;
      line-height: 1.12;
      text-transform: uppercase;
    }
    .belge-ad {
      max-width: 100%;
      margin: 0;
      font-size: clamp(16px, 2.65cqw, 34px);
      font-weight: 700;
      line-height: 1.08;
      overflow-wrap: anywhere;
      hyphens: auto;
    }
    .belge-metin {
      max-width: 100%;
      margin: 0;
      font-size: clamp(10px, 1.38cqw, 18px);
      line-height: 1.35;
      overflow-wrap: anywhere;
      hyphens: auto;
    }
    .belge-alt {
      display: flex;
      min-width: 0;
      flex: 0 0 auto;
      align-items: flex-end;
      justify-content: space-between;
      gap: 2cqw;
      font: clamp(8px, 1.05cqw, 14px)/1.25 system-ui, sans-serif;
    }
    .belge-alt time { flex: 0 0 auto; white-space: nowrap; }
    .belge-imza { min-width: 0; max-width: 58%; text-align: center; overflow-wrap: anywhere; hyphens: auto; }
    .belge-imza-cizgi { border-top: 1px solid #98a0ab; padding-top: .45cqw; font-weight: 600; }
    .belge-birim { margin-top: .25cqw; color: #5b6472; }

    @media (max-width: 600px) {
      .belge-arac-cubugu { position: static; }
    }

    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      /* :has() Chrome ve Edge'de kabuğun DOM derinliğinden bağımsız olarak yalnızca
         belge baskısında panel parçalarını kaldırır; toplu akışı fixed ile kilitlemez. */
      body:has(.belge-baski-katmani) .admin-sidebar,
      body:has(.belge-baski-katmani) .admin-topbar,
      body:has(.belge-baski-katmani) .admin-page-head { display: none !important; }
      body:has(.belge-baski-katmani) .admin-shell,
      body:has(.belge-baski-katmani) .admin-main,
      body:has(.belge-baski-katmani) .admin-content {
        display: block !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }
      .belge-arac-cubugu, .belge-sira { display: none !important; }
      .belge-baski-katmani { margin: 0; padding: 0; background: #fff; }
      .belge-baski-katmani.tek-belge {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        overflow: hidden;
      }
      .belge-sayfasi {
        width: 100vw;
        height: 100vh;
        margin: 0;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .belge-sayfasi:not(:last-child) { break-after: page; page-break-after: always; }
      .belge-sayfasi:last-child { break-after: auto; page-break-after: auto; }
      .belge-kagit {
        width: auto;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        box-shadow: none;
      }
    }
  `;
}
