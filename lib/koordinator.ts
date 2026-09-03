import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import koordinatorYedegi from "@/data-ornek/koordinatorler.json";

// Koordinatörler data/koordinatorler.json'dan 3 Eylül 2026'da "Coordinator"
// tablosuna geçti. Dışa açılan her şeyin imzası dosya sürümüyle aynı bırakıldı;
// panel ve genel sayfa değişmedi.
export type Koordinator = {
  id: string;
  ad: string;
  il: string;
  rol: string;
  gorsel: string;
  sira: number;
};

export const ROLLER = [
  "İl Koordinatörü",
  "İl Yöneticisi",
  "Yeğitek İl Yöneticisi",
  "Komisyon Üyesi",
] as const;

export const VARSAYILAN_GORSEL = "/wordpress/media/genctek-1-9f875b56c3d924e4.png";

/* Panelde rol serbest metin bir açılır listeden seçiliyor, tabloda ise enum.
   Çeviri tek yerde; iki yönü de burada durmalı ki biri değişince diğeri
   unutulmasın. Boş rol dosyada altı kayıtta vardı ve tabloda NULL olarak
   duruyor — uydurulmuş bir rol yazmak veriyi bozmak olurdu. */
const ROL_ETIKETI: Record<string, string> = {
  PROVINCE_COORDINATOR: "İl Koordinatörü",
  PROVINCE_MANAGER: "İl Yöneticisi",
  YEGITEK_PROVINCE_MANAGER: "Yeğitek İl Yöneticisi",
  COMMISSION_MEMBER: "Komisyon Üyesi",
};

const ROL_KODU: Record<string, string> = Object.fromEntries(
  Object.entries(ROL_ETIKETI).map(([kod, etiket]) => [etiket, kod]),
);

function rolKodu(etiket: string) {
  return ROL_KODU[etiket.trim()] ?? null;
}

type KoordinatorSatiri = {
  id: string;
  name: string;
  il: string;
  role: string | null;
  photo: string;
  order: number;
};

function satirdanKoordinator(satir: KoordinatorSatiri): Koordinator {
  return {
    id: satir.id,
    ad: satir.name,
    il: satir.il,
    rol: satir.role ? ROL_ETIKETI[satir.role] ?? "" : "",
    gorsel: satir.photo,
    sira: satir.order,
  };
}

/* Yedek anlık görüntü, temalar ve haberlerdekiyle aynı gerekçe: bağlantı geçici
   olarak düştüğünde kamu sayfasını hata ekranına çevirme. Şema ve sorgu hataları
   gizlenmeden yukarı iletilir. */
let yedekBellek: Koordinator[] | null = null;

function yedekKoordinatorler(): Koordinator[] {
  yedekBellek ??= (koordinatorYedegi as Koordinator[]).slice().sort((a, b) => a.sira - b.sira);
  return yedekBellek;
}

function geciciBaglantiHatasi(hata: unknown) {
  const kod = typeof hata === "object" && hata !== null && "code" in hata
    ? String((hata as { code?: unknown }).code ?? "")
    : "";
  const mesaj = hata instanceof Error ? hata.message : String(hata);
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE"].includes(kod)
    || /ECONNRESET|ECONNREFUSED|connection terminated|connection closed/i.test(mesaj);
}

// İl, tabloda iki harflik kod; ekranlarda il ADI bekleniyor, o yüzden okumada
// "Province" ile birleştiriliyor.
export async function koordinatorleriOku(): Promise<Koordinator[]> {
  try {
    const satirlar = await sql<KoordinatorSatiri[]>`
      SELECT k.id, k.name, p.name AS il, k.role::text, k.photo, k."order"
      FROM "Coordinator" k
      JOIN "Province" p ON p.code = k."provinceCode"
      ORDER BY k."order", k.name
    `;
    return satirlar.map(satirdanKoordinator);
  } catch (hata) {
    if (!geciciBaglantiHatasi(hata)) throw hata;
    return yedekKoordinatorler();
  }
}

type Girdi = { ad: string; il: string; rol: string; gorsel: string };

/* İl adı panelden metin olarak geliyor; tabloda kod tutuluyor. Eşleşme büyük
   küçük harfe ve şapkaya takılmasın diye Postgres'te unaccent yerine basit bir
   karşılaştırma: Türkçe'ye özgü harfleri de kapsayacak şekilde normalleştirip
   karşılaştırıyoruz. Göç betiğindeki eşleştirmenin aynısı. */
async function ilKodu(ilAdi: string) {
  const [satir] = await sql<{ code: string }[]>`
    SELECT code FROM "Province"
    WHERE lower(translate(name, 'ÂÎÛâîû', 'AIUaiu')) = lower(translate(${ilAdi.trim()}, 'ÂÎÛâîû', 'AIUaiu'))
    LIMIT 1
  `;
  if (!satir) throw new Error(`İl bulunamadı: ${ilAdi}`);
  return satir.code;
}

export async function koordinatorEkle(girdi: Girdi): Promise<Koordinator> {
  const kod = await ilKodu(girdi.il);
  // il, RETURNING'e parametre olarak sokulmuyor: girdinin kendisi zaten elde.
  const [satir] = await sql<Omit<KoordinatorSatiri, "il">[]>`
    INSERT INTO "Coordinator" (id, name, "provinceCode", role, photo, "order", "updatedAt")
    VALUES (
      ${randomUUID()}, ${girdi.ad.trim()}, ${kod},
      ${rolKodu(girdi.rol)}::"CoordinatorRole",
      ${girdi.gorsel.trim() || VARSAYILAN_GORSEL},
      (SELECT COALESCE(MAX("order"), -1) + 1 FROM "Coordinator"),
      CURRENT_TIMESTAMP
    )
    RETURNING id, name, role::text, photo, "order"
  `;
  return satirdanKoordinator({ ...satir, il: girdi.il.trim() });
}

export async function koordinatorGuncelle(id: string, girdi: Girdi) {
  const kod = await ilKodu(girdi.il);
  const [satir] = await sql<{ id: string }[]>`
    UPDATE "Coordinator" SET
      name = ${girdi.ad.trim()},
      "provinceCode" = ${kod},
      role = ${rolKodu(girdi.rol)}::"CoordinatorRole",
      photo = ${girdi.gorsel.trim() || VARSAYILAN_GORSEL},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id
  `;
  if (!satir) throw new Error(`Koordinatör bulunamadı: ${id}`);
}

export async function koordinatorSil(id: string) {
  await sql`DELETE FROM "Coordinator" WHERE id = ${id}`;
}

// Genel sayfa il adına göre sıralanır; aynı ilde koordinatör önce, üyeler sonra.
export function ileGoreSirala(kayitlar: Koordinator[]) {
  const agirlik = (rol: string) => (rol.includes("Koordinatör") ? 0 : rol.includes("Yönetici") ? 1 : 2);
  return [...kayitlar].sort(
    (a, b) => a.il.localeCompare(b.il, "tr") || agirlik(a.rol) - agirlik(b.rol) || a.ad.localeCompare(b.ad, "tr"),
  );
}
