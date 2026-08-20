// wordpress-posts.json içe aktarım çıktısıdır ve import:site her çalıştığında
// yeniden üretilir. Panelden düzenlenen haberler oraya yazılamaz — bu betik
// haberleri bir kereliğine düzenlenebilir depoya taşır.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hedef = resolve(kok, "data/haberler.json");

if (existsSync(hedef)) {
  console.log(`! ${hedef} zaten var. Üzerine yazmak paneldeki düzenlemeleri siler.`);
  console.log("  Bilerek yapıyorsan önce dosyayı sil, sonra bu betiği çalıştır.");
  process.exit(1);
}

const kaynak = JSON.parse(readFileSync(resolve(kok, "lib/generated/wordpress-posts.json"), "utf8"));
if (!Array.isArray(kaynak) || kaynak.length === 0) throw new Error("wordpress-posts.json boş veya okunamadı.");

// En yeni önce; panelde ve sitede aynı sıra kullanılır.
const haberler = [...kaynak].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

mkdirSync(dirname(hedef), { recursive: true });
writeFileSync(hedef, JSON.stringify(haberler, null, 2) + "\n", "utf8");

console.log(`${haberler.length} haber yazıldı → data/haberler.json`);
console.log(`  en yeni : ${haberler[0].title}`);
console.log(`  en eski : ${haberler[haberler.length - 1].title}`);
