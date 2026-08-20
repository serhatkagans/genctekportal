import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "@/lib/db";
import { coz, sifrele } from "@/lib/security/veri-sifreleme";
import type { ParticipationInput } from "@/lib/validation/participation";

// Ekler kişisel veri içerir; public/ altına konulamaz, oradan herkes indirebilirdi.
// Bu klasör web'den servis edilmez, indirme yetkili bir uçtan yapılır.
const EK_KLASORU = path.join(process.cwd(), "veri", "basvuru-ekleri");

export const KATILIM_FORMU_SLUG = "katilim";

// Doğrudan iletişim bilgileri veritabanında şifreli durur. Ad, kurum, il ve
// çalışma açıklaması listeleme/filtreleme için açık kalır — bunlar da kişisel
// veridir, o yüzden ekranda maskelenir ve açılması denetim kaydına yazılır.
const SIFRELI_ALANLAR = ["studentPhone", "studentEmail", "teacherPhone", "teacherEmail"] as const;

export type BasvuruDurumu =
  | "NEW" | "IN_REVIEW" | "WAITING_INFORMATION" | "APPROVED" | "REJECTED" | "ARCHIVED";

export const DURUM_ETIKETLERI: Record<BasvuruDurumu, string> = {
  NEW: "Yeni",
  IN_REVIEW: "İncelemede",
  WAITING_INFORMATION: "Bilgi bekleniyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
  ARCHIVED: "Arşiv",
};

export type BasvuruCevaplari = Record<string, string>;

export type BasvuruOzeti = {
  id: string;
  reference: string;
  status: BasvuruDurumu;
  submittedAt: Date;
  retentionUntil: Date;
  provinceCode: string | null;
  provinceName: string | null;
  consentVersion: string;
  answers: BasvuruCevaplari;
  ekSayisi: number;
  notSayisi: number;
};

export type FormAyarlari = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  retentionDays: number;
  opensAt: Date | null;
  closesAt: Date | null;
  versionId: string;
  version: number;
  consentVersion: string;
  consentText: string;
  basvuruSayisi: number;
};

function ozetle(hata: unknown) {
  return hata instanceof Error ? hata.message : "Bilinmeyen veritabanı hatası.";
}

/* ---------------------------------------------------------------- tanım --- */

// Katılım formu koda gömülü olduğu için tanımı ilk gönderimde kendiliğinden
// oluşturulur; panelden ayarları (saklama süresi, rıza metni) değiştirilebilir.
const VARSAYILAN_RIZA = `GençTek katılım başvurusu kapsamında paylaştığınız kimlik ve iletişim bilgileri, `
  + `başvurunuzun değerlendirilmesi amacıyla işlenir. Verileriniz saklama süresi sonunda silinir.`;

export async function katilimFormunuHazirla() {
  const [mevcut] = await sql<{ id: string; versionId: string; consentVersion: string }[]>`
    SELECT f.id, v.id AS "versionId", v."consentVersion"
    FROM "FormDefinition" f
    JOIN "FormVersion" v ON v."formId" = f.id
    WHERE f.slug = ${KATILIM_FORMU_SLUG}
    ORDER BY v.version DESC
    LIMIT 1
  `;
  if (mevcut) return mevcut;

  const formId = randomUUID();
  const versionId = randomUUID();
  await sql`
    INSERT INTO "FormDefinition" (id, name, slug, status, "retentionDays", "updatedAt")
    VALUES (${formId}, ${"GençTek Katılım Formu"}, ${KATILIM_FORMU_SLUG}, 'PUBLISHED', 730, CURRENT_TIMESTAMP)
  `;
  await sql`
    INSERT INTO "FormVersion" (id, "formId", version, schema, "consentVersion", "consentText", "publishedAt")
    VALUES (${versionId}, ${formId}, 1,
            ${sql.json({ kaynak: "lib/validation/participation.ts" })},
            ${"1.0"}, ${VARSAYILAN_RIZA}, CURRENT_TIMESTAMP)
  `;
  return { id: formId, versionId, consentVersion: "1.0" };
}

export async function formAyarlari(): Promise<FormAyarlari | null> {
  const [kayit] = await sql<FormAyarlari[]>`
    SELECT f.id, f.name, f.slug, f.status::text AS status, f."retentionDays",
           f."opensAt", f."closesAt",
           v.id AS "versionId", v.version, v."consentVersion", v."consentText",
           (SELECT count(*)::int FROM "Submission" s WHERE s."formId" = f.id) AS "basvuruSayisi"
    FROM "FormDefinition" f
    JOIN "FormVersion" v ON v."formId" = f.id
    WHERE f.slug = ${KATILIM_FORMU_SLUG}
    ORDER BY v.version DESC
    LIMIT 1
  `;
  return kayit ?? null;
}

export async function formAyarlariniKaydet(girdi: {
  formId: string;
  versionId: string;
  name: string;
  status: string;
  retentionDays: number;
  opensAt: string;
  closesAt: string;
  consentText: string;
  consentVersion: string;
}) {
  await sql`
    UPDATE "FormDefinition" SET
      name = ${girdi.name.trim()},
      status = ${girdi.status}::"FormStatus",
      "retentionDays" = ${girdi.retentionDays},
      "opensAt" = ${girdi.opensAt.trim() || null}::text::timestamp,
      "closesAt" = ${girdi.closesAt.trim() || null}::text::timestamp,
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${girdi.formId}
  `;
  await sql`
    UPDATE "FormVersion" SET "consentText" = ${girdi.consentText.trim()},
                             "consentVersion" = ${girdi.consentVersion.trim() || "1.0"}
    WHERE id = ${girdi.versionId}
  `;
}

/* ------------------------------------------------------------- yazma ----- */

export type EkDosya = { ad: string; tur: string; boyut: number; icerik: Buffer };

export async function basvuruKaydet(girdi: {
  reference: string;
  cevaplar: ParticipationInput;
  ipOzeti: string | null;
  ek?: EkDosya;
}) {
  const form = await katilimFormunuHazirla();

  const [ayar] = await sql<{ retentionDays: number }[]>`
    SELECT "retentionDays" FROM "FormDefinition" WHERE id = ${form.id}
  `;
  const saklamaGunu = ayar?.retentionDays ?? 730;

  // startedAt ve website (bot tuzağı) saklanmaz; işleme amacıyla ilgisiz.
  const { startedAt: _startedAt, website: _website, ...kalan } = girdi.cevaplar;
  const cevaplar: BasvuruCevaplari = {};
  for (const [alan, deger] of Object.entries(kalan)) {
    const metin = String(deger ?? "");
    cevaplar[alan] = (SIFRELI_ALANLAR as readonly string[]).includes(alan) && metin
      ? sifrele(metin)
      : metin;
  }

  const [il] = await sql<{ code: string }[]>`
    SELECT code FROM "Province" WHERE lower(name) = ${girdi.cevaplar.province.trim().toLocaleLowerCase("tr-TR")} LIMIT 1
  `;

  const basvuruId = randomUUID();
  await sql`
    INSERT INTO "Submission" (id, reference, "formId", "formVersionId", "consentVersion",
                              answers, status, "provinceCode", "ipHash", "retentionUntil", "updatedAt")
    VALUES (${basvuruId}, ${girdi.reference}, ${form.id}, ${form.versionId}, ${form.consentVersion},
            ${sql.json(cevaplar)}, 'NEW', ${il?.code ?? null}, ${girdi.ipOzeti},
            CURRENT_TIMESTAMP + make_interval(days => ${saklamaGunu}), CURRENT_TIMESTAMP)
  `;

  if (girdi.ek) await ekKaydet(basvuruId, girdi.ek);
  return basvuruId;
}

async function ekKaydet(basvuruId: string, ek: EkDosya) {
  const ozet = createHash("sha256").update(ek.icerik).digest("hex");
  const uzanti = path.extname(ek.ad).slice(0, 10) || "";
  const depoAnahtari = `${basvuruId}/${randomUUID()}${uzanti}`;
  const hedef = path.join(EK_KLASORU, depoAnahtari);

  await mkdir(path.dirname(hedef), { recursive: true });
  await writeFile(hedef, ek.icerik);

  const medyaId = randomUUID();
  await sql`
    INSERT INTO "Media" (id, "storageKey", "originalName", "mimeType", size, checksum, status, "updatedAt")
    VALUES (${medyaId}, ${depoAnahtari}, ${ek.ad}, ${ek.tur}, ${ek.boyut}, ${ozet}, 'READY', CURRENT_TIMESTAMP)
  `;
  await sql`
    INSERT INTO "SubmissionAttachment" (id, "submissionId", "mediaId")
    VALUES (${randomUUID()}, ${basvuruId}, ${medyaId})
  `;
}

export function ekDosyaYolu(depoAnahtari: string) {
  // Depo anahtarı veritabanından gelir ama yine de klasör dışına çıkılamamalı.
  const hedef = path.resolve(EK_KLASORU, depoAnahtari);
  if (!hedef.startsWith(path.resolve(EK_KLASORU) + path.sep)) return null;
  return hedef;
}

/* ------------------------------------------------------------- okuma ----- */

export type BasvuruListesi =
  | { bagli: true; basvurular: BasvuruOzeti[]; durumSayilari: Record<string, number> }
  | { bagli: false; hata: string };

export async function basvurulariOku(suzgec: { durum?: string; arama?: string } = {}): Promise<BasvuruListesi> {
  try {
    const durumKosulu = suzgec.durum && suzgec.durum in DURUM_ETIKETLERI
      ? sql`AND s.status = ${suzgec.durum}::"SubmissionStatus"`
      : sql``;
    const aramaKosulu = suzgec.arama?.trim()
      ? sql`AND (s.reference ILIKE ${`%${suzgec.arama.trim()}%`} OR s.answers::text ILIKE ${`%${suzgec.arama.trim()}%`})`
      : sql``;

    const basvurular = await sql<BasvuruOzeti[]>`
      SELECT s.id, s.reference, s.status::text AS status, s."submittedAt", s."retentionUntil",
             s."provinceCode", p.name AS "provinceName", s."consentVersion", s.answers,
             (SELECT count(*)::int FROM "SubmissionAttachment" a WHERE a."submissionId" = s.id) AS "ekSayisi",
             (SELECT count(*)::int FROM "SubmissionNote" n WHERE n."submissionId" = s.id) AS "notSayisi"
      FROM "Submission" s
      LEFT JOIN "Province" p ON p.code = s."provinceCode"
      WHERE true ${durumKosulu} ${aramaKosulu}
      ORDER BY s."submittedAt" DESC
      LIMIT 500
    `;

    const sayimlar = await sql<{ status: string; adet: number }[]>`
      SELECT status::text AS status, count(*)::int AS adet FROM "Submission" GROUP BY status
    `;
    const durumSayilari = Object.fromEntries(sayimlar.map((s) => [s.status, s.adet]));
    return { bagli: true, basvurular, durumSayilari };
  } catch (hata) {
    return { bagli: false, hata: ozetle(hata) };
  }
}

export type BasvuruNotu = { id: string; body: string; createdAt: Date; yazar: string };
export type BasvuruEki = { id: string; mediaId: string; ad: string; tur: string; boyut: number };

export async function basvuruBul(referans: string) {
  const [basvuru] = await sql<BasvuruOzeti[]>`
    SELECT s.id, s.reference, s.status::text AS status, s."submittedAt", s."retentionUntil",
           s."provinceCode", p.name AS "provinceName", s."consentVersion", s.answers,
           0 AS "ekSayisi", 0 AS "notSayisi"
    FROM "Submission" s
    LEFT JOIN "Province" p ON p.code = s."provinceCode"
    WHERE s.reference = ${referans} LIMIT 1
  `;
  if (!basvuru) return null;

  const notlar = await sql<BasvuruNotu[]>`
    SELECT n.id, n.body, n."createdAt", u.name AS yazar
    FROM "SubmissionNote" n JOIN "User" u ON u.id = n."authorId"
    WHERE n."submissionId" = ${basvuru.id} ORDER BY n."createdAt" DESC
  `;
  const ekler = await sql<BasvuruEki[]>`
    SELECT a.id, m.id AS "mediaId", m."originalName" AS ad, m."mimeType" AS tur, m.size AS boyut
    FROM "SubmissionAttachment" a JOIN "Media" m ON m.id = a."mediaId"
    WHERE a."submissionId" = ${basvuru.id}
  `;
  return { ...basvuru, notlar, ekler };
}

export async function durumDegistir(basvuruId: string, durum: BasvuruDurumu) {
  await sql`
    UPDATE "Submission" SET status = ${durum}::"SubmissionStatus", "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${basvuruId}
  `;
}

export async function notEkle(basvuruId: string, yazarId: string, govde: string) {
  await sql`
    INSERT INTO "SubmissionNote" (id, "submissionId", "authorId", body)
    VALUES (${randomUUID()}, ${basvuruId}, ${yazarId}, ${govde.trim()})
  `;
}

/* --------------------------------------------------------- gösterim ------ */

// Maskeleme her zaman uygulanır; açık değer yalnızca yetkili kullanıcı "Aç"
// dediğinde ve denetim kaydı yazıldıktan sonra döner.
export function epostaMaskele(deger: string) {
  const [ad, alan] = deger.split("@");
  return alan ? `${ad.slice(0, 2)}***@${alan}` : "***";
}

export function telefonMaskele(deger: string) {
  return deger.replace(/\d(?=\d{2})/g, "*");
}

export function cevabiGoster(alan: string, ham: string, acikMi: boolean): string {
  if (!ham) return "—";
  const sifreliAlan = (SIFRELI_ALANLAR as readonly string[]).includes(alan);
  const deger = sifreliAlan ? coz(ham) : ham;
  if (deger === null) return "çözülemedi";
  if (acikMi) return deger;
  if (alan.toLowerCase().includes("email")) return epostaMaskele(deger);
  if (alan.toLowerCase().includes("phone")) return telefonMaskele(deger);
  return deger;
}

export function cevaplariCoz(cevaplar: BasvuruCevaplari): BasvuruCevaplari {
  const sonuc: BasvuruCevaplari = {};
  for (const [alan, deger] of Object.entries(cevaplar)) {
    sonuc[alan] = (SIFRELI_ALANLAR as readonly string[]).includes(alan)
      ? (coz(deger) ?? "çözülemedi")
      : deger;
  }
  return sonuc;
}
