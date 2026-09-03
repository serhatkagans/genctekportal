// Yerel geliştirme veritabanını çalışır hale getirir: 81 il, bir sistem yöneticisi
// hesabı ve belge akışının ihtiyaç duyduğu faaliyet/katılımcı kayıtları.
// Tekrar çalıştırılabilir — var olan kayıtları günceller, kopya üretmez.
//
//   node scripts/seed-veritabani.mjs
//
// İsteğe bağlı: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD ile hesap bilgisi verilebilir.

import { existsSync } from "node:fs";
import { randomUUID, createHash, randomBytes } from "node:crypto";
import postgres from "postgres";
import argon2 from "argon2";

if (existsSync(".env")) process.loadEnvFile(".env");

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

const sql = postgres(baglantiYolu, { max: 4 });

const ILLER = [
  ["01", "Adana"], ["02", "Adıyaman"], ["03", "Afyonkarahisar"], ["04", "Ağrı"],
  ["05", "Amasya"], ["06", "Ankara"], ["07", "Antalya"], ["08", "Artvin"],
  ["09", "Aydın"], ["10", "Balıkesir"], ["11", "Bilecik"], ["12", "Bingöl"],
  ["13", "Bitlis"], ["14", "Bolu"], ["15", "Burdur"], ["16", "Bursa"],
  ["17", "Çanakkale"], ["18", "Çankırı"], ["19", "Çorum"], ["20", "Denizli"],
  ["21", "Diyarbakır"], ["22", "Edirne"], ["23", "Elazığ"], ["24", "Erzincan"],
  ["25", "Erzurum"], ["26", "Eskişehir"], ["27", "Gaziantep"], ["28", "Giresun"],
  ["29", "Gümüşhane"], ["30", "Hakkâri"], ["31", "Hatay"], ["32", "Isparta"],
  ["33", "Mersin"], ["34", "İstanbul"], ["35", "İzmir"], ["36", "Kars"],
  ["37", "Kastamonu"], ["38", "Kayseri"], ["39", "Kırklareli"], ["40", "Kırşehir"],
  ["41", "Kocaeli"], ["42", "Konya"], ["43", "Kütahya"], ["44", "Malatya"],
  ["45", "Manisa"], ["46", "Kahramanmaraş"], ["47", "Mardin"], ["48", "Muğla"],
  ["49", "Muş"], ["50", "Nevşehir"], ["51", "Niğde"], ["52", "Ordu"],
  ["53", "Rize"], ["54", "Sakarya"], ["55", "Samsun"], ["56", "Siirt"],
  ["57", "Sinop"], ["58", "Sivas"], ["59", "Tekirdağ"], ["60", "Tokat"],
  ["61", "Trabzon"], ["62", "Tunceli"], ["63", "Şanlıurfa"], ["64", "Uşak"],
  ["65", "Van"], ["66", "Yozgat"], ["67", "Zonguldak"], ["68", "Aksaray"],
  ["69", "Bayburt"], ["70", "Karaman"], ["71", "Kırıkkale"], ["72", "Batman"],
  ["73", "Şırnak"], ["74", "Bartın"], ["75", "Ardahan"], ["76", "Iğdır"],
  ["77", "Yalova"], ["78", "Karabük"], ["79", "Kilis"], ["80", "Osmaniye"],
  ["81", "Düzce"],
];

const FAALIYETLER = [
  {
    slug: "egitijam-2026-ankara",
    title: "EğitiJAM 2026 — Ankara Oyun Tasarımı Kampı",
    summary: "48 saatte fikirden oynanabilir prototipe: takım kurma, tasarım ve sunum.",
    eventType: "Kamp",
    startsAt: "2026-04-13T09:00:00",
    endsAt: "2026-04-14T18:00:00",
    venue: "Ankara Bilim Merkezi",
    provinceCode: "06",
    organizerName: "Selin Yılmaz",
    organizerUnit: "Ankara İl Millî Eğitim Müdürlüğü",
  },
  {
    slug: "yapay-zeka-atolyesi-istanbul",
    title: "Yapay Zekâ Atölyesi — İstanbul",
    summary: "Model eğitme, veri etiği ve öğrenci projelerinde uygulama örnekleri.",
    eventType: "Atölye",
    startsAt: "2026-03-07T10:00:00",
    endsAt: "2026-03-07T17:00:00",
    venue: "İstanbul Teknik Üniversitesi",
    provinceCode: "34",
    organizerName: "Can Demir",
    organizerUnit: "İstanbul İl Millî Eğitim Müdürlüğü",
  },
  {
    slug: "siber-guvenlik-yarismasi-izmir",
    title: "Siber Güvenlik Yarışması — İzmir Bölge Elemesi",
    summary: "Bayrak yakalama formatında takım yarışması ve ödül töreni.",
    eventType: "Yarışma",
    startsAt: "2026-05-22T09:30:00",
    endsAt: "2026-05-22T19:00:00",
    venue: "İzmir Bilim ve Sanat Merkezi",
    provinceCode: "35",
    organizerName: "Ece Kaya",
    organizerUnit: "İzmir İl Millî Eğitim Müdürlüğü",
  },
  {
    slug: "acik-kaynak-bulusmasi-bursa",
    title: "Açık Kaynak Buluşması — Bursa",
    summary: "Öğrenci projelerinin açık kaynağa taşınması, lisanslar ve katkı akışı.",
    eventType: "Buluşma",
    startsAt: "2026-11-14T10:00:00",
    endsAt: "2026-11-14T16:30:00",
    venue: "Bursa Bilim ve Teknoloji Merkezi",
    provinceCode: "16",
    organizerName: "Deniz Acar",
    organizerUnit: "Bursa İl Millî Eğitim Müdürlüğü",
  },
];

const KATILIMCILAR = [
  ["Zeynep", "Aydın", "11-A", "Bilişim Teknolojileri", "Ankara Fen Lisesi"],
  ["Mert", "Korkmaz", "10-C", "Bilişim Teknolojileri", "Ankara Fen Lisesi"],
  ["Elif", "Şahin", "12-B", "Matematik", "Ankara Atatürk Anadolu Lisesi"],
  ["Yusuf", "Aslan", "9-D", "Bilişim Teknolojileri", "Çankaya Anadolu Lisesi"],
  ["Defne", "Polat", "11-A", "Görsel Sanatlar", "Ankara Güzel Sanatlar Lisesi"],
  ["Kaan", "Erdoğan", "12-A", "Bilişim Teknolojileri", "İstanbul Erkek Lisesi"],
  ["Nisa", "Doğan", "10-B", "Fizik", "Kadıköy Anadolu Lisesi"],
  ["Emir", "Yıldız", "11-C", "Bilişim Teknolojileri", "Beşiktaş Atatürk Anadolu Lisesi"],
  ["Ada", "Çelik", "12-D", "Bilişim Teknolojileri", "İzmir Fen Lisesi"],
  ["Poyraz", "Arslan", "11-B", "Matematik", "Bornova Anadolu Lisesi"],
  ["Duru", "Kaya", "10-A", "Bilişim Teknolojileri", "Karşıyaka Anadolu Lisesi"],
  ["Ömer", "Tekin", "12-C", "Kimya", "İzmir Atatürk Lisesi"],
  ["Bora", "Şimşek", "11-B", "Bilişim Teknolojileri", "Bursa Anadolu Lisesi"],
  ["Ela", "Yavuz", "10-D", "Matematik", "Nilüfer Anadolu Lisesi"],
  ["Tuna", "Özkan", "12-A", "Bilişim Teknolojileri", "Bursa Fen Lisesi"],
];

// Faaliyet indeksine göre katılımcı dağılımı ve durumları.
const KATILIM_PLANI = [
  { faaliyet: 0, katilimci: [0, 1, 2, 3, 4], durum: ["SECILDI", "SECILDI", "SECILDI", "SECILDI", "BASVURDU"] },
  { faaliyet: 1, katilimci: [5, 6, 7], durum: ["SECILDI", "SECILDI", "REDDEDILDI"] },
  { faaliyet: 2, katilimci: [8, 9, 10, 11], durum: ["SECILDI", "SECILDI", "SECILDI", "BASVURDU"] },
  // Yaklaşan etkinlik: başvurular açık, seçim henüz yapılmadı.
  { faaliyet: 3, katilimci: [12, 13, 14], durum: ["SECILDI", "BASVURDU", "BASVURDU"] },
];

async function illeriEkle() {
  await sql`
    INSERT INTO "Province" (code, name)
    VALUES ${sql(ILLER.map(([kod, ad]) => [kod, ad]))}
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
  `;
  return ILLER.length;
}

async function yoneticiEkle() {
  const eposta = process.env.SEED_ADMIN_EMAIL ?? "yonetici@genctek.local";
  const parola = process.env.SEED_ADMIN_PASSWORD ?? "GencTekYerel2026!";
  const parolaOzeti = await argon2.hash(parola, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 3,
    parallelism: 1,
  });

  const [kullanici] = await sql`
    INSERT INTO "User" (id, email, name, "passwordHash", status, "provinceCode", "passwordChangedAt", "updatedAt")
    VALUES (${randomUUID()}, ${eposta}, ${"Sistem Yöneticisi"}, ${parolaOzeti}, 'ACTIVE', NULL,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (email) DO UPDATE
      SET "passwordHash" = EXCLUDED."passwordHash",
          status = 'ACTIVE',
          "passwordChangedAt" = CURRENT_TIMESTAMP,
          "updatedAt" = CURRENT_TIMESTAMP
    RETURNING id
  `;

  /* PAROLA DEĞİŞTİ, ESKİ OTURUMLAR DÜŞSÜN: bu betik var olan hesabın
     parolasını döndürüyor (ON CONFLICT dalı). Oturumlar iptal edilmezse
     elinde eski çerez olan biri, parola artık onun bilmediği bir değer
     olmasına rağmen panelde gezmeye devam ederdi — oturum doğrulaması
     parolaya değil kaydın revokedAt alanına bakıyor (lib/auth/oturum.ts).
     Aynı gerekçe scripts/test-hesaplari.mjs ve lib/yonetim/kullanici.ts ·
     oturumlariKapat içinde de yazılı. */
  await sql`
    UPDATE "Session" SET "revokedAt" = CURRENT_TIMESTAMP
    WHERE "userId" = ${kullanici.id} AND "revokedAt" IS NULL
  `;

  await sql`
    INSERT INTO "UserRole" (id, "userId", role)
    VALUES (${randomUUID()}, ${kullanici.id}, 'SYSTEM_ADMIN')
    ON CONFLICT ("userId", role) DO NOTHING
  `;

  return { id: kullanici.id, eposta, parola };
}

// Giriş formu bu projede henüz sunucuya bağlı değil; panele bakabilmek için
// doğrudan kullanılabilir bir oturum üretiliyor.
async function oturumEkle(kullaniciId) {
  const jeton = randomBytes(32).toString("base64url");
  const jetonOzeti = createHash("sha256").update(jeton, "utf8").digest("hex");
  const csrfOzeti = createHash("sha256").update(randomBytes(32).toString("base64url"), "utf8").digest("hex");

  await sql`DELETE FROM "Session" WHERE "userId" = ${kullaniciId}`;
  await sql`
    INSERT INTO "Session" (id, "userId", "csrfHash", "idleExpiresAt", "expiresAt")
    VALUES (${jetonOzeti}, ${kullaniciId}, ${csrfOzeti},
            CURRENT_TIMESTAMP + INTERVAL '12 hours',
            CURRENT_TIMESTAMP + INTERVAL '12 hours')
  `;
  return jeton;
}

async function faaliyetleriEkle() {
  const kimlikler = [];
  for (const faaliyet of FAALIYETLER) {
    const [kayit] = await sql`
      INSERT INTO "Event" (id, title, slug, summary, description, "eventType", status,
                           "startsAt", "endsAt", venue, "provinceCode",
                           "organizerName", "organizerUnit", "publishedAt", "updatedAt")
      VALUES (${randomUUID()}, ${faaliyet.title}, ${faaliyet.slug}, ${faaliyet.summary},
              ${sql.json({ bloklar: [] })}, ${faaliyet.eventType}, 'PUBLISHED',
              ${faaliyet.startsAt}::text::timestamp, ${faaliyet.endsAt}::text::timestamp,
              ${faaliyet.venue}, ${faaliyet.provinceCode},
              ${faaliyet.organizerName}, ${faaliyet.organizerUnit},
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            "startsAt" = EXCLUDED."startsAt",
            "endsAt" = EXCLUDED."endsAt",
            venue = EXCLUDED.venue,
            "provinceCode" = EXCLUDED."provinceCode",
            "organizerName" = EXCLUDED."organizerName",
            "organizerUnit" = EXCLUDED."organizerUnit",
            "updatedAt" = CURRENT_TIMESTAMP
      RETURNING id
    `;
    kimlikler.push(kayit.id);
  }
  return kimlikler;
}

async function katilimcilariEkle() {
  const kimlikler = [];
  for (const [ad, soyad, sinif, dal, kurum] of KATILIMCILAR) {
    const [mevcut] = await sql`
      SELECT id FROM "Participant"
      WHERE name = ${ad} AND surname = ${soyad} AND institution = ${kurum}
      LIMIT 1
    `;
    if (mevcut) {
      kimlikler.push(mevcut.id);
      continue;
    }
    const [kayit] = await sql`
      INSERT INTO "Participant" (name, surname, "className", branch, institution, "updatedAt")
      VALUES (${ad}, ${soyad}, ${sinif}, ${dal}, ${kurum}, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    kimlikler.push(kayit.id);
  }
  return kimlikler;
}

async function katilimlariEkle(faaliyetKimlikleri, katilimciKimlikleri) {
  let sayi = 0;
  for (const plan of KATILIM_PLANI) {
    const faaliyetId = faaliyetKimlikleri[plan.faaliyet];
    for (const [sira, katilimciSirasi] of plan.katilimci.entries()) {
      await sql`
        INSERT INTO "ActivityParticipation" (id, "eventId", "participantId", status)
        VALUES (${randomUUID()}, ${faaliyetId}, ${katilimciKimlikleri[katilimciSirasi]},
                ${plan.durum[sira]})
        ON CONFLICT ("eventId", "participantId") DO UPDATE SET status = EXCLUDED.status
      `;
      sayi += 1;
    }
  }
  return sayi;
}

try {
  const ilSayisi = await illeriEkle();
  const yonetici = await yoneticiEkle();
  const jeton = await oturumEkle(yonetici.id);
  const faaliyetKimlikleri = await faaliyetleriEkle();
  const katilimciKimlikleri = await katilimcilariEkle();
  const katilimSayisi = await katilimlariEkle(faaliyetKimlikleri, katilimciKimlikleri);

  console.log(`İl                : ${ilSayisi}`);
  console.log(`Faaliyet          : ${faaliyetKimlikleri.length}`);
  console.log(`Katılımcı         : ${katilimciKimlikleri.length}`);
  console.log(`Katılım kaydı     : ${katilimSayisi}`);
  console.log("");
  console.log(`Yönetici e-posta  : ${yonetici.eposta}`);
  console.log(`Yönetici parola   : ${yonetici.parola}`);
  console.log("");
  console.log("Panele bakmak için tarayıcı konsolunda şu çerezi tanımlayın:");
  console.log(`  document.cookie = "__Host-genctek_session=${jeton}; path=/; secure"`);
} catch (hata) {
  console.error(hata);
  process.exitCode = 1;
} finally {
  await sql.end();
}
