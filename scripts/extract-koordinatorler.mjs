// İl koordinatörleri sayfası WordPress'te Elementor ile kurulmuştu; 101 kayıt
// image-box widget'ları içine gömülüydü. Bu betik onları tek seferlik olarak
// yapılandırılmış veriye çıkarır. Bundan sonrası yönetim panelinden düzenlenir,
// yani betik yeniden çalıştırılırsa paneldeki değişiklikler kaybolur.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hedef = resolve(kok, "data/koordinatorler.json");

const sayfalar = JSON.parse(readFileSync(resolve(kok, "lib/generated/wordpress-pages.json"), "utf8"));
const sayfa = sayfalar.find((s) => s.slug === "il-koordinatorleri");
if (!sayfa) throw new Error("il-koordinatorleri sayfası wordpress-pages.json içinde yok.");

const desen =
  /<figure class="elementor-image-box-img"><img[^>]*?src="([^"]+)"[\s\S]*?<h4 class="elementor-image-box-title">([^<]*)<\/h4><p class="elementor-image-box-description">([\s\S]*?)<\/p>/g;

const kayitlar = [...sayfa.html.matchAll(desen)].map((eslesme, sira) => {
  const gorsel = eslesme[1];
  const hamAd = eslesme[2].replace(/\s+/g, " ").trim();
  const parcalar = eslesme[3].replace(/\s+/g, " ").trim().split("/").map((p) => p.trim());

  // Atanmamış kayıtlar kaynakta ad alanına "..." yazılarak işaretlenmiş.
  const atanmamis = !hamAd || /^[.·]+$/.test(hamAd);

  return {
    id: `k${String(sira + 1).padStart(3, "0")}`,
    ad: atanmamis ? "" : hamAd,
    il: parcalar[0] || "",
    rol: parcalar.slice(1).join(" / ") || "",
    gorsel,
    sira,
  };
});

if (kayitlar.length === 0) throw new Error("Hiç kayıt ayrıştırılamadı; sayfa yapısı değişmiş olabilir.");

if (existsSync(hedef)) {
  console.log(`! ${hedef} zaten var. Üzerine yazmak paneldeki düzenlemeleri siler.`);
  console.log("  Bilerek yapıyorsan önce dosyayı sil, sonra bu betiği çalıştır.");
  process.exit(1);
}

mkdirSync(dirname(hedef), { recursive: true });
writeFileSync(hedef, JSON.stringify(kayitlar, null, 2) + "\n", "utf8");

const atanmamisSayi = kayitlar.filter((k) => !k.ad).length;
console.log(`${kayitlar.length} kayıt yazıldı → data/koordinatorler.json`);
console.log(`  il sayısı      : ${new Set(kayitlar.map((k) => k.il)).size}`);
console.log(`  atama bekleyen : ${atanmamisSayi}`);
