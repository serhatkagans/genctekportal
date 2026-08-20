import { sql } from "@/lib/db";

export type YayinDurumu =
  | "DRAFT" | "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export const DURUM_ETIKETLERI: Record<YayinDurumu, string> = {
  DRAFT: "Taslak",
  IN_REVIEW: "İncelemede",
  APPROVED: "Onaylandı",
  SCHEDULED: "Zamanlanmış",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşiv",
};

export type YonetimFaaliyeti = {
  id: string;
  title: string;
  eventType: string;
  status: YayinDurumu;
  startsAt: Date;
  endsAt: Date | null;
  venue: string | null;
  provinceName: string | null;
  secilmis: number;
  basvuran: number;
};

// Veritabanı kapalıyken ekran çökmemeli: sayfa bunu ayırt edip bağlantı
// uyarısı gösteriyor, boş liste ile karıştırmıyor.
export type FaaliyetListesi =
  | { bagli: true; faaliyetler: YonetimFaaliyeti[] }
  | { bagli: false; hata: string };

export type Il = { code: string; name: string };

export async function illeriOku(): Promise<Il[]> {
  try {
    return await sql<Il[]>`SELECT code, name FROM "Province" ORDER BY code`;
  } catch {
    return [];
  }
}

export type FaaliyetKaydi = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  aciklama: string;
  eventType: string;
  status: YayinDurumu;
  // datetime-local biçiminde metin: "2026-04-13T09:00"
  startsAt: string;
  endsAt: string | null;
  venue: string | null;
  onlineUrl: string | null;
  registrationUrl: string | null;
  capacity: number | null;
  provinceCode: string | null;
  organizerName: string | null;
  organizerUnit: string | null;
};

// Tarihler metin olarak okunuyor: sürücü naive timestamp'i sunucunun yerel
// saatine göre Date'e çeviriyor, bu da düzenleme formunda kayma yaratıyordu.
// "YYYY-MM-DDTHH:MM" datetime-local girdisinin beklediği biçimin ta kendisi.
export async function faaliyetBul(id: string): Promise<FaaliyetKaydi | null> {
  const [kayit] = await sql<FaaliyetKaydi[]>`
    SELECT id, title, slug, summary,
           COALESCE(description->>'metin', '') AS aciklama,
           "eventType", status::text AS status,
           to_char("startsAt", 'YYYY-MM-DD"T"HH24:MI') AS "startsAt",
           to_char("endsAt", 'YYYY-MM-DD"T"HH24:MI') AS "endsAt",
           venue, "onlineUrl", "registrationUrl", capacity, "provinceCode",
           "organizerName", "organizerUnit"
    FROM "Event" WHERE id = ${id} LIMIT 1
  `;
  return kayit ?? null;
}

export type FaaliyetGirdi = {
  title: string;
  slug: string;
  summary: string;
  aciklama: string;
  eventType: string;
  status: YayinDurumu;
  startsAt: string;
  endsAt: string;
  venue: string;
  onlineUrl: string;
  registrationUrl: string;
  capacity: string;
  provinceCode: string;
  organizerName: string;
  organizerUnit: string;
};

function sluglastir(deger: string) {
  const harita: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u" };
  return deger
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (h) => harita[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Event.slug benzersiz; çakışırsa sonuna sayı eklenir, aksi halde INSERT patlar.
async function benzersizSlug(istenen: string, hariçId?: string) {
  const temel = sluglastir(istenen) || "etkinlik";
  const mevcutlar = await sql<{ slug: string }[]>`
    SELECT slug FROM "Event" WHERE slug LIKE ${`${temel}%`} AND (${hariçId ?? null}::text IS NULL OR id <> ${hariçId ?? null})
  `;
  const kume = new Set(mevcutlar.map((s) => s.slug));
  let aday = temel;
  let sayac = 2;
  while (kume.has(aday)) aday = `${temel}-${sayac++}`;
  return aday;
}

function bosaNull(deger: string) {
  const t = deger.trim();
  return t === "" ? null : t;
}

function sayiyaCevir(deger: string) {
  const t = deger.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export async function faaliyetEkle(girdi: FaaliyetGirdi) {
  const slug = await benzersizSlug(girdi.slug || girdi.title);
  const [kayit] = await sql<{ id: string }[]>`
    INSERT INTO "Event" (id, title, slug, summary, description, "eventType", status,
                         "startsAt", "endsAt", venue, "onlineUrl", "registrationUrl",
                         capacity, "provinceCode", "organizerName", "organizerUnit",
                         "publishedAt", "updatedAt")
    VALUES (gen_random_uuid()::text, ${girdi.title.trim()}, ${slug}, ${girdi.summary.trim()},
            ${sql.json({ metin: girdi.aciklama })}, ${girdi.eventType.trim() || "Etkinlik"},
            ${girdi.status}::"PublishStatus",
            ${girdi.startsAt}::text::timestamp, ${bosaNull(girdi.endsAt)}::text::timestamp,
            ${bosaNull(girdi.venue)}, ${bosaNull(girdi.onlineUrl)}, ${bosaNull(girdi.registrationUrl)},
            ${sayiyaCevir(girdi.capacity)}, ${bosaNull(girdi.provinceCode)},
            ${bosaNull(girdi.organizerName)}, ${bosaNull(girdi.organizerUnit)},
            ${girdi.status === "PUBLISHED" ? sql`CURRENT_TIMESTAMP` : null}, CURRENT_TIMESTAMP)
    RETURNING id
  `;
  return kayit;
}

export async function faaliyetGuncelle(id: string, girdi: FaaliyetGirdi) {
  const slug = await benzersizSlug(girdi.slug || girdi.title, id);
  await sql`
    UPDATE "Event" SET
      title = ${girdi.title.trim()},
      slug = ${slug},
      summary = ${girdi.summary.trim()},
      description = ${sql.json({ metin: girdi.aciklama })},
      "eventType" = ${girdi.eventType.trim() || "Etkinlik"},
      status = ${girdi.status}::"PublishStatus",
      "startsAt" = ${girdi.startsAt}::text::timestamp,
      "endsAt" = ${bosaNull(girdi.endsAt)}::text::timestamp,
      venue = ${bosaNull(girdi.venue)},
      "onlineUrl" = ${bosaNull(girdi.onlineUrl)},
      "registrationUrl" = ${bosaNull(girdi.registrationUrl)},
      capacity = ${sayiyaCevir(girdi.capacity)},
      "provinceCode" = ${bosaNull(girdi.provinceCode)},
      "organizerName" = ${bosaNull(girdi.organizerName)},
      "organizerUnit" = ${bosaNull(girdi.organizerUnit)},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
  return { id, slug };
}

// Katılım kayıtları ON DELETE CASCADE ile birlikte silinir; ekranda uyarılıyor.
export async function faaliyetSil(id: string) {
  await sql`DELETE FROM "Event" WHERE id = ${id}`;
}

export async function yonetimFaaliyetleri(): Promise<FaaliyetListesi> {
  try {
    const satirlar = await sql<YonetimFaaliyeti[]>`
      SELECT e.id, e.title, e."eventType", e.status::text AS status,
             e."startsAt", e."endsAt", e.venue,
             p.name AS "provinceName",
             COUNT(ap.id) FILTER (WHERE ap.status = 'SECILDI')::int AS "secilmis",
             COUNT(ap.id)::int AS "basvuran"
      FROM "Event" e
      LEFT JOIN "Province" p ON p.code = e."provinceCode"
      LEFT JOIN "ActivityParticipation" ap ON ap."eventId" = e.id
      GROUP BY e.id, p.name
      ORDER BY e."startsAt" DESC
    `;
    return { bagli: true, faaliyetler: satirlar };
  } catch (hata) {
    return { bagli: false, hata: hata instanceof Error ? hata.message : "Bilinmeyen bağlantı hatası." };
  }
}
