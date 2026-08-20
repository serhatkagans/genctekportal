import { sql } from "@/lib/db";
import type { Role } from "@/lib/auth/rbac";

/**
 * KULLANICI YÖNETİMİ (20 Ağustos 2026 · istek: "yonetim/kullanicilar buradaki
 * kullanıcılar sayfasını … yapmamışsın").
 *
 * Ekran şimdiye kadar "henüz bağlı değil" diyen bir yer tutucuydu. Veritabanı
 * bağlandığına göre gerçek veriyi gösteriyor.
 *
 * OKUMA GENİŞ, YAZMA DAR. Listede kişinin durumu, rolleri, ili, son girişi ve
 * açık oturum sayısı var; değiştirilebilen ise yalnızca üç şey: rol, durum ve
 * açık oturumların kapatılması. Parola sıfırlama ve davet gönderme burada YOK,
 * çünkü ikisi de e-posta gerektiriyor (SMTP_URL boş) ve panelden "gönderdim"
 * deyip hiçbir şey göndermemek, hiç yapmamaktan kötüdür.
 *
 * PAROLA ALANLARI HİÇ OKUNMAZ: `passwordHash`, `totpSecretEncrypted` ve
 * kurtarma kodları sorguya girmiyor. Ekranda gösterilmeyecek bir sırrı
 * uygulamanın belleğine taşımanın hiçbir faydası yok.
 */

export type KullaniciDurumu = "INVITED" | "ACTIVE" | "LOCKED" | "DISABLED";

export const DURUM_ETIKETLERI: Record<KullaniciDurumu, string> = {
  INVITED: "Davet edildi",
  ACTIVE: "Aktif",
  LOCKED: "Kilitli",
  DISABLED: "Kapalı",
};

export const ROL_ETIKETLERI: Record<Role, string> = {
  SYSTEM_ADMIN: "Sistem yöneticisi",
  CONTENT_MANAGER: "İçerik yöneticisi",
  EDITOR: "Editör",
  PUBLISHER: "Yayıncı",
  FORM_REVIEWER: "Form değerlendirici",
  AUDITOR: "Denetçi",
};

export const ROLLER = Object.keys(ROL_ETIKETLERI) as Role[];

export type YonetimKullanicisi = {
  id: string;
  ad: string;
  eposta: string;
  durum: KullaniciDurumu;
  ilAdi: string | null;
  mfaAcik: boolean;
  sonGiris: Date | null;
  kilitliBitis: Date | null;
  roller: Role[];
  acikOturum: number;
};

/*
 * Veritabanı kapalıyken ekran ÇÖKMEZ, "bağlanamadım" der: geliştirme
 * makinelerinde Postgres kurulu olmayabiliyor ve boş liste ile kopuk bağlantı
 * birbirine karıştırılmamalı (aynı desen lib/faaliyet/yonetim.ts'te).
 */
export type KullaniciListesi =
  | { bagli: true; kullanicilar: YonetimKullanicisi[] }
  | { bagli: false; hata: string };

export async function yonetimKullanicilari(): Promise<KullaniciListesi> {
  try {
    const satirlar = await sql<
      (Omit<YonetimKullanicisi, "roller"> & { roller: Role[] | null })[]
    >`
      SELECT u.id, u.name AS ad, u.email AS eposta, u.status::text AS durum,
             p.name AS "ilAdi", u."mfaEnabled" AS "mfaAcik",
             u."lastLoginAt" AS "sonGiris", u."lockedUntil" AS "kilitliBitis",
             array_remove(array_agg(DISTINCT r.role::text), NULL) AS roller,
             COUNT(DISTINCT s.id) FILTER (
               WHERE s."revokedAt" IS NULL AND s."expiresAt" > now()
             )::int AS "acikOturum"
      FROM "User" u
      LEFT JOIN "Province" p ON p.code = u."provinceCode"
      LEFT JOIN "UserRole" r ON r."userId" = u.id
      LEFT JOIN "Session" s ON s."userId" = u.id
      GROUP BY u.id, p.name
      ORDER BY u.name
    `;
    return {
      bagli: true,
      kullanicilar: satirlar.map((satir) => ({
        ...satir,
        roller: satir.roller ?? [],
      })),
    };
  } catch (hata) {
    return {
      bagli: false,
      hata: hata instanceof Error ? hata.message : "Bilinmeyen bağlantı hatası.",
    };
  }
}

/** Tek kişinin adı — denetim kaydının okunabilir olması için. */
export async function kullaniciAdi(id: string): Promise<string> {
  const [kayit] = await sql<{ ad: string }[]>`
    SELECT name AS ad FROM "User" WHERE id = ${id} LIMIT 1
  `;
  return kayit?.ad ?? id;
}

export async function rolEkle(kullaniciId: string, rol: Role) {
  // ON CONFLICT: aynı rol iki kez eklenmeye çalışılırsa sessizce geçilir.
  // Tekillik kısıtı (userId, role) zaten var; hata fırlatmak, kullanıcının
  // çift tıklamasını arızaya çevirirdi.
  await sql`
    INSERT INTO "UserRole" (id, "userId", role)
    VALUES (gen_random_uuid()::text, ${kullaniciId}, ${rol}::"RoleCode")
    ON CONFLICT ("userId", role) DO NOTHING
  `;
}

export async function rolCikar(kullaniciId: string, rol: Role) {
  await sql`
    DELETE FROM "UserRole"
    WHERE "userId" = ${kullaniciId} AND role = ${rol}::"RoleCode"
  `;
}

/**
 * Sistemde kaç aktif sistem yöneticisi var?
 *
 * Son yöneticiyi kapatmayı ya da rolünü almayı ENGELLEMEK için: paneli
 * yönetebilen kimse kalmazsa geri dönüşün tek yolu veritabanına elle
 * müdahale olurdu.
 */
export async function aktifYoneticiSayisi(): Promise<number> {
  const [satir] = await sql<{ adet: number }[]>`
    SELECT COUNT(DISTINCT u.id)::int AS adet
    FROM "User" u
    JOIN "UserRole" r ON r."userId" = u.id
    WHERE r.role = 'SYSTEM_ADMIN' AND u.status = 'ACTIVE'
  `;
  return satir?.adet ?? 0;
}

export async function yoneticiMi(kullaniciId: string): Promise<boolean> {
  const [satir] = await sql<{ var: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM "UserRole"
      WHERE "userId" = ${kullaniciId} AND role = 'SYSTEM_ADMIN'
    ) AS var
  `;
  return satir?.var ?? false;
}

/**
 * Durum değişimi.
 *
 * KAPATMA OTURUMLARI DA KAPATIR: yalnızca `status` yazılsaydı, kapatılan kişi
 * elindeki çerezle panelde gezmeye devam ederdi — oturum doğrulaması kaydın
 * durumuna bakmıyor (bkz. lib/auth/oturum.ts).
 *
 * KİLİT AÇMA: `LOCKED` durumu arka arkaya başarısız girişten doğar ve
 * `lockedUntil` ile yürür. Aktife çekerken sayaç ve kilit süresi de
 * sıfırlanmazsa kişi girer girmez yeniden kilitlenirdi.
 */
export async function durumDegistir(kullaniciId: string, durum: KullaniciDurumu) {
  await sql`
    UPDATE "User"
    SET status = ${durum}::"UserStatus",
        "failedLoginCount" = CASE WHEN ${durum} = 'ACTIVE' THEN 0 ELSE "failedLoginCount" END,
        "lockedUntil" = CASE WHEN ${durum} = 'ACTIVE' THEN NULL ELSE "lockedUntil" END,
        "updatedAt" = now()
    WHERE id = ${kullaniciId}
  `;
  if (durum === "DISABLED" || durum === "LOCKED") {
    await oturumlariKapat(kullaniciId);
  }
}

/** Kişinin açık oturumlarını iptal eder; çerez elde kalsa da geçersizdir. */
export async function oturumlariKapat(kullaniciId: string): Promise<number> {
  const satirlar = await sql<{ id: string }[]>`
    UPDATE "Session"
    SET "revokedAt" = now()
    WHERE "userId" = ${kullaniciId} AND "revokedAt" IS NULL
    RETURNING id
  `;
  return satirlar.length;
}
