import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Yonlendirme = { id: string; kaynak: string; hedef: string; kod: 301 | 302 };

const DOSYA = path.join(process.cwd(), "data", "yonlendirmeler.json");

function normalizeYol(deger: string) {
  const temiz = deger.trim();
  if (!temiz) return "";
  return temiz.startsWith("/") || /^https?:\/\//.test(temiz) ? temiz : `/${temiz}`;
}

export async function yonlendirmeleriOku(): Promise<Yonlendirme[]> {
  try {
    return JSON.parse(await readFile(DOSYA, "utf8")) as Yonlendirme[];
  } catch (hata) {
    if ((hata as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw hata;
  }
}

async function yaz(kayitlar: Yonlendirme[]) {
  await mkdir(path.dirname(DOSYA), { recursive: true });
  await writeFile(DOSYA, JSON.stringify(kayitlar, null, 2) + "\n", "utf8");
}

export async function yonlendirmeEkle(kaynak: string, hedef: string, kod: 301 | 302) {
  const k = normalizeYol(kaynak);
  const h = normalizeYol(hedef);
  if (!k || !h || k === h) return;
  const kayitlar = await yonlendirmeleriOku();
  // Aynı kaynak iki kez tanımlanırsa hangisinin kazandığı belirsiz olur; üzerine yaz.
  await yaz([...kayitlar.filter((y) => y.kaynak !== k), { id: randomUUID(), kaynak: k, hedef: h, kod }]);
}

export async function yonlendirmeSil(id: string) {
  const kayitlar = await yonlendirmeleriOku();
  await yaz(kayitlar.filter((y) => y.id !== id));
}
