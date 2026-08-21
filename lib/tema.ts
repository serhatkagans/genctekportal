import { randomUUID } from "node:crypto";
import { sql } from "./db";
import { gorselYolu } from "./ortam";

// Temalar önce lib/content.ts içinde sabit diziydi, sonra panelden düzenlenebilmesi
// için data/temalar.json'a taşındı; 21 Ağustos 2026'da "Theme" tablosuna geçti.
// Dışarıya açılan beş fonksiyonun imzası dosya sürümüyle aynı bırakıldı, çağıran
// ekranların hiçbiri değişmedi.
export type Tema = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  focus: string[];
  outcomes: string[];
};

// Görsel seçilmeden tema oluşturulabiliyor; next/image boş src ile patladığı için
// her okuma noktasının bu yedeğe düşmesi gerekiyor.
export const TEMA_YEDEK_GORSELI = "/Genc.png";

// Depolanan yol site köküne göre ("/temalar/espor.jpg"); alt dizin kurulumunda
// önüne uygulama eki gelmeli. next/image bu eki kendiliğinden koymuyor —
// iyileştirici dosyayı kökte arayıp "received null" ile düşüyor.
export function temaGorseli(tema: Pick<Tema, "image">) {
  return gorselYolu(tema.image.trim() || TEMA_YEDEK_GORSELI);
}

// Tabloda "description" JSONB; içeriği düz metin olduğu için okurken tipi
// daraltıyoruz. Blok tabanlı gövdeye geçilirse ayrışma noktası burası.
type TemaSatiri = {
  slug: string;
  name: string;
  summary: string;
  description: unknown;
  image: string;
  focus: string[];
  outcomes: string[];
};

function satirdanTema(satir: TemaSatiri): Tema {
  return {
    slug: satir.slug,
    name: satir.name,
    shortDescription: satir.summary,
    description: typeof satir.description === "string" ? satir.description : "",
    image: satir.image,
    focus: satir.focus,
    outcomes: satir.outcomes,
  };
}

// Sıra "order" sütununda: dosya sürümünde temaların JSON dizisindeki yeri anlamlıydı,
// göçte o sıra sütuna yazıldı ve panelden eklenen kayıtlar sona ekleniyor.
export async function temalariOku(): Promise<Tema[]> {
  const satirlar = await sql<TemaSatiri[]>`
    SELECT slug, name, summary, description, image, focus, outcomes
    FROM "Theme"
    ORDER BY "order", "createdAt"
  `;
  return satirlar.map(satirdanTema);
}

export async function temaBul(slug: string) {
  const [satir] = await sql<TemaSatiri[]>`
    SELECT slug, name, summary, description, image, focus, outcomes
    FROM "Theme"
    WHERE slug = ${slug}
    LIMIT 1
  `;
  return satir ? satirdanTema(satir) : undefined;
}

export type TemaGirdi = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  focus: string;
  outcomes: string;
};

function sluglastir(deger: string) {
  const harita: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u" };
  return deger
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (h) => harita[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function benzersizSlug(istenen: string, hariçSlug?: string) {
  const temel = sluglastir(istenen) || "tema";
  const dolular = await sql<{ slug: string }[]>`
    SELECT slug FROM "Theme"
    WHERE (slug = ${temel} OR slug LIKE ${temel + "-%"})
      AND slug <> ${hariçSlug ?? ""}
  `;
  const alinmis = new Set(dolular.map((s) => s.slug));
  let aday = temel;
  let sayac = 2;
  while (alinmis.has(aday)) aday = `${temel}-${sayac++}`;
  return aday;
}

// Odak ve çıktı listeleri editörde satır satır giriliyor.
function satirlaraBol(deger: string) {
  return deger.split("\n").map((s) => s.trim()).filter(Boolean);
}

function govdeCoz(girdi: TemaGirdi, slug: string): Tema {
  return {
    slug,
    name: girdi.name.trim(),
    shortDescription: girdi.shortDescription.trim(),
    description: girdi.description.trim(),
    image: girdi.image.trim(),
    focus: satirlaraBol(girdi.focus),
    outcomes: satirlaraBol(girdi.outcomes),
  };
}

export async function temaEkle(girdi: TemaGirdi) {
  const slug = await benzersizSlug(girdi.slug || girdi.name);
  const yeni = govdeCoz(girdi, slug);
  await sql`
    INSERT INTO "Theme" (id, slug, name, summary, description, image, focus, outcomes, "order", "updatedAt")
    VALUES (
      ${randomUUID()}, ${yeni.slug}, ${yeni.name}, ${yeni.shortDescription},
      ${sql.json(yeni.description)}, ${yeni.image}, ${yeni.focus}, ${yeni.outcomes},
      (SELECT COALESCE(MAX("order"), -1) + 1 FROM "Theme"),
      CURRENT_TIMESTAMP
    )
  `;
  return yeni;
}

export async function temaGuncelle(mevcutSlug: string, girdi: TemaGirdi) {
  const slug = await benzersizSlug(girdi.slug || girdi.name, mevcutSlug);
  const guncel = govdeCoz(girdi, slug);
  const [satir] = await sql<{ slug: string }[]>`
    UPDATE "Theme" SET
      slug = ${guncel.slug},
      name = ${guncel.name},
      summary = ${guncel.shortDescription},
      description = ${sql.json(guncel.description)},
      image = ${guncel.image},
      focus = ${guncel.focus},
      outcomes = ${guncel.outcomes},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE slug = ${mevcutSlug}
    RETURNING slug
  `;
  if (!satir) throw new Error(`Tema bulunamadı: ${mevcutSlug}`);
  return guncel;
}

export async function temaSil(slug: string) {
  await sql`DELETE FROM "Theme" WHERE slug = ${slug}`;
}
