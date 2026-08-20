// data/ klasörünü ilk kurulumda doldurur: data-ornek/ içindeki başlangıç
// dosyalarından EKSİK OLANLARI kopyalar.
//
//   node scripts/veri-hazirla.mjs
//
// VAR OLAN DOSYAYA DOKUNMAZ, bu betiğin tek kuralı budur. data/ altındaki
// dosyalar yönetim panelinden yazılıyor; üzerine kopyalamak, kaydedilmiş
// haberi ya da koordinatör atamasını sessizce geri almak olurdu.
//
// Neden ayrı bir klasör: data/ artık depoda izlenmiyor (bkz. .gitignore ve
// DAGITIM.md). Canlı içeriğin tek sahibi sunucu; depodaki kopyalar yalnızca
// yeni bir makinede boş bir siteyle karşılaşmamak için var.

import { copyFile, mkdir, readdir, access } from "node:fs/promises";
import path from "node:path";

const kok = process.cwd();
const kaynakDizin = path.join(kok, "data-ornek");
const hedefDizin = path.join(kok, "data");

async function varMi(yol) {
  try {
    await access(yol);
    return true;
  } catch {
    return false;
  }
}

if (!await varMi(kaynakDizin)) {
  console.log("data-ornek/ yok, yapacak bir şey kalmadı.");
  process.exit(0);
}

await mkdir(hedefDizin, { recursive: true });

let kopyalanan = 0;
for (const ad of await readdir(kaynakDizin)) {
  if (!ad.endsWith(".json")) continue;
  const hedef = path.join(hedefDizin, ad);
  if (await varMi(hedef)) continue;
  await copyFile(path.join(kaynakDizin, ad), hedef);
  console.log(`data/${ad} örnekten oluşturuldu.`);
  kopyalanan++;
}

if (!kopyalanan) console.log("İçerik dosyaları yerinde.");
