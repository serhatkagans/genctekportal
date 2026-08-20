import { sql } from "@/lib/db";

/**
 * DENETİM KAYDI (20 Ağustos 2026 · istek: "denetim kaydını … yapmamışsın").
 *
 * `AuditLog` tablosu ve yazma yardımcısı (lib/yetki/log.ts) vardı ama okuyan
 * bir ekran yoktu: kayıt tutuluyor, kimse bakamıyordu. Bu dosya o eksiği
 * kapatıyor.
 *
 * SALT OKUNUR. Buradan silme ya da düzeltme yolu YOKTUR ve eklenmemelidir:
 * düzeltilebilen bir denetim kaydı, denetim kaydı değildir. Yanlış bir satır
 * varsa cevabı onu silmek değil, düzeltmeyi yapan işlemin kendi kaydını
 * bırakmasıdır.
 *
 * AKTÖR SİLİNSE DE KAYIT KALIR: `actorId` şemada `onDelete: SetNull`, yani
 * kullanıcı silindiğinde satır kaybolmaz, yalnızca kime ait olduğu boşalır.
 * Ekran bu durumda "(silinmiş kullanıcı)" yazıyor — boş bir hücre, kaydın
 * bozuk olduğu izlenimi verirdi.
 */

export type DenetimKaydi = {
  id: string;
  islem: string;
  hedefTip: string;
  hedefId: string | null;
  detay: string | null;
  aktorAdi: string | null;
  tarih: Date;
};

export type DenetimSonucu =
  | {
      bagli: true;
      kayitlar: DenetimKaydi[];
      toplam: number;
      islemler: string[];
      sayfa: number;
      sonSayfa: number;
    }
  | { bagli: false; hata: string };

export const SAYFA_BOYU = 50;

export type DenetimFiltresi = {
  islem?: string | null;
  arama?: string | null;
  sayfa?: number;
};

export async function denetimKayitlari(
  filtre: DenetimFiltresi = {},
): Promise<DenetimSonucu> {
  const sayfa = Math.max(1, filtre.sayfa ?? 1);
  const islem = filtre.islem?.trim() || null;
  const arama = filtre.arama?.trim() || null;

  try {
    /*
     * Filtreler SQL'e parametre olarak giriyor ve "boşsa hepsi" mantığı
     * sorgunun içinde kuruluyor. Koşulları JavaScript'te birleştirip metne
     * gömmek, arama kutusuna yazılan metni sorguya karıştırma riski demekti.
     */
    const [sayim] = await sql<{ toplam: number }[]>`
      SELECT COUNT(*)::int AS toplam
      FROM "AuditLog" a
      LEFT JOIN "User" u ON u.id = a."actorId"
      WHERE (${islem}::text IS NULL OR a.action = ${islem})
        AND (${arama}::text IS NULL OR
             a."targetType" ILIKE ${"%" + (arama ?? "") + "%"} OR
             a."targetId" ILIKE ${"%" + (arama ?? "") + "%"} OR
             u.name ILIKE ${"%" + (arama ?? "") + "%"} OR
             a.metadata->>'detay' ILIKE ${"%" + (arama ?? "") + "%"})
    `;
    const toplam = sayim?.toplam ?? 0;
    const sonSayfa = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));
    const gecerliSayfa = Math.min(sayfa, sonSayfa);

    const kayitlar = await sql<DenetimKaydi[]>`
      SELECT a.id, a.action AS islem, a."targetType" AS "hedefTip",
             a."targetId" AS "hedefId", a.metadata->>'detay' AS detay,
             u.name AS "aktorAdi", a."createdAt" AS tarih
      FROM "AuditLog" a
      LEFT JOIN "User" u ON u.id = a."actorId"
      WHERE (${islem}::text IS NULL OR a.action = ${islem})
        AND (${arama}::text IS NULL OR
             a."targetType" ILIKE ${"%" + (arama ?? "") + "%"} OR
             a."targetId" ILIKE ${"%" + (arama ?? "") + "%"} OR
             u.name ILIKE ${"%" + (arama ?? "") + "%"} OR
             a.metadata->>'detay' ILIKE ${"%" + (arama ?? "") + "%"})
      ORDER BY a."createdAt" DESC
      LIMIT ${SAYFA_BOYU} OFFSET ${(gecerliSayfa - 1) * SAYFA_BOYU}
    `;

    // Süzgeç listesi VERİDEN geliyor, sabit bir listeden değil: yeni bir işlem
    // türü eklendiğinde süzgeçte kendiliğinden görünür.
    const islemler = await sql<{ islem: string }[]>`
      SELECT DISTINCT action AS islem FROM "AuditLog" ORDER BY 1
    `;

    return {
      bagli: true,
      kayitlar,
      toplam,
      islemler: islemler.map((satir) => satir.islem),
      sayfa: gecerliSayfa,
      sonSayfa,
    };
  } catch (hata) {
    return {
      bagli: false,
      hata: hata instanceof Error ? hata.message : "Bilinmeyen bağlantı hatası.",
    };
  }
}
