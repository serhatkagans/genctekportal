import { readFile } from "node:fs/promises";
import path from "node:path";
import { YUKLEME_KLASORU, YUKLENEN_TURLER } from "@/lib/medya";

/*
 * PANELDEN YÜKLENEN GÖRSELLERİ DİSKTEN SUNAR (9 Kasım 2026).
 *
 * `next start`, public/ altındaki dosyaların listesini yalnızca AÇILIŞTA bir
 * kez çıkarıyor (node_modules/next/dist/server/lib/router-utils/filesystem.js,
 * `publicFolderItems`). Panel yüklemeyi public/medya'ya yazıyor ama sunucu o
 * dosyayı yeniden başlatılana kadar tanımıyordu: adres 404, `_next/image` 400
 * veriyordu. Ebru ALACA'nın fotoğrafında böyle fark edildi.
 *
 * Next önce public/ listesine bakıyor, sonra rotalara. Açılışta orada olan
 * dosyalar eskisi gibi statik sunuluyor; bu rotaya yalnızca açılıştan sonra
 * eklenenler düşüyor. Adres (/medya/<ad>) değişmediği için kayıtlara
 * dokunmak gerekmedi.
 */

export const dynamic = "force-dynamic";

// Tek parça, gizli dosya değil, klasör ayıracı yok. path.basename kontrolü
// aşağıda ikinci kez bakıyor; "..", "%2F" ve benzeri hiçbir yolla klasörden
// çıkılamasın.
const GECERLI_AD = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function bulunamadi() {
  return new Response("Bulunamadı.", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(_istek: Request, { params }: { params: Promise<{ ad: string }> }) {
  const { ad } = await params;
  if (!GECERLI_AD.test(ad) || path.basename(ad) !== ad) return bulunamadi();

  // Yalnızca yüklemenin üretebildiği türler. SVG ve tanınmayan uzantılar
  // sunulmuyor: dosyalar siteyle aynı kökenden çıkıyor (bkz. lib/medya.ts).
  const tur = YUKLENEN_TURLER[path.extname(ad).toLowerCase()];
  if (!tur) return bulunamadi();

  let icerik: Buffer;
  try {
    icerik = await readFile(path.join(YUKLEME_KLASORU, ad));
  } catch {
    return bulunamadi();
  }

  return new Response(new Uint8Array(icerik), {
    headers: {
      "Content-Type": tur,
      "Content-Length": String(icerik.length),
      // Yüklenen adlar rastgele son ek taşıyor ve üzerine yazılmıyor; bir gün
      // önbellek güvenli. Aynı ada elle dosya konursa en geç ertesi gün düşer.
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
