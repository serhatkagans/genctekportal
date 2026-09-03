import postgres from "postgres";
import { randomUUID } from "node:crypto";

const globalForSql = globalThis as unknown as { genctekSql?: ReturnType<typeof postgres> };
const baglantiYolu = process.env.DATABASE_URL ?? "postgresql://gecersiz:gecersiz@127.0.0.1:5432/gecersiz";

/*
 * SAAT DİLİMİ ÇEVİRİSİ ELLE YAPILIYOR (21 Ağustos 2026).
 *
 * Şemadaki zaman sütunları "timestamp without time zone" ve içlerine hep
 * CURRENT_TIMESTAMP yazılıyor; sunucunun TimeZone ayarı Etc/GMT0 olduğu için
 * saklanan değer UTC. Ama postgres.js saat dilimi taşımayan bir metni
 * `new Date("2026-08-20 22:33:14")` ile çözüyor — bu, JS'te YEREL saat demek.
 * Türkiye'de (UTC+3) her okunan zaman 3 saat geçmişe kayıyordu.
 *
 * Görünen arıza giriş döngüsüydü: yeni açılan oturumun idleExpiresAt'i
 * "şimdi + 30 dakika" yazılıyor, geri okunurken 3 saat geriye kayıp "şimdi -
 * 150 dakika" oluyor ve lib/auth/oturum.ts oturumu daha doğduğu anda süresi
 * dolmuş sayıyordu. Giriş çerezi koyup /yonetim'e yolluyor, /yonetim oturumu
 * geçersiz bulup /giris'e geri atıyordu.
 *
 * Çözüm okuma tarafında: 1114 (timestamp) oid'i için çözümleyici değiştirilip
 * metin UTC kabul ediliyor. 1184 (timestamptz) dokunulmadan kalıyor, o zaten
 * doğru. Yazma tarafı da etkilenmiyor: `to` yalnızca sql.typed ile çağrılınca
 * devreye girer, kodda naive sütuna JS Date parametresi geçen yer yok.
 */
const zamanTipleri = {
  naiveTimestamp: {
    to: 1114,
    from: [1114],
    serialize: (deger: Date | string) =>
      deger instanceof Date ? deger.toISOString().replace("T", " ").replace("Z", "") : deger,
    parse: (metin: string) => new Date(`${metin}Z`),
  },
};

/*
 * HAVUZ SINIRI YERELDE DAHA DÜŞÜK (21 Ağustos 2026).
 *
 * Yereldeki veritabanı `prisma dev` ile açılan sunucu ve DOKUZUNCU eşzamanlı
 * bağlantıda çöküyor: sekize kadar sorunsuz, dokuzda açık tüm bağlantılar
 * "read ECONNRESET" ile sıfırlanıyor ve sunucu bir daha kendine gelmiyor —
 * portu dinlemeye devam ettiği için ayakta görünüyor. `max: 10` ile bir yönetim
 * sayfasının paralel sorguları bu tavana değebiliyordu; belirti,
 * dagitim/yerel-baslat.ps1'de "yarı ölü veritabanı" diye anlatılan durum.
 *
 * Üretimdeki Postgres'te böyle bir tavan yok, orada sınır 10 kalıyor.
 * Gerekirse DB_HAVUZ_SINIRI ile elle verilebilir.
 */
const havuzSiniri =
  Number(process.env.DB_HAVUZ_SINIRI) || (process.env.NODE_ENV === "production" ? 10 : 5);

// Sürücü bağlantıyı ilk sorguya kadar açmaz; böylece Next build aşaması veritabanına bağımlı olmaz.
const sql =
  globalForSql.genctekSql ??
  postgres(baglantiYolu, { max: havuzSiniri, idle_timeout: 20, types: zamanTipleri });
if (process.env.NODE_ENV !== "production") globalForSql.genctekSql = sql;

// Aşağıdaki prisma kabuğu yalnızca belge akışının ihtiyaç duyduğu birkaç sorguyu
// taşıyor; onun dışındaki ekranlar sql'i doğrudan kullanır.
export { sql };

type Rol = "SYSTEM_ADMIN" | "CONTENT_MANAGER" | "EDITOR" | "PUBLISHER" | "FORM_REVIEWER" | "AUDITOR";

export const prisma = {
  session: {
    async findUnique({ where }: { where: { id: string }; include?: unknown }) {
      const [kayit] = await sql<{
        id: string;
        revokedAt: Date | null;
        idleExpiresAt: Date;
        expiresAt: Date;
        lastSeenAt: Date;
        userId: string;
        userName: string;
        provinceCode: string | null;
      }[]>`
        SELECT s.id, s."revokedAt", s."idleExpiresAt", s."expiresAt", s."lastSeenAt",
               u.id AS "userId", u.name AS "userName", u."provinceCode"
        FROM "Session" s
        JOIN "User" u ON u.id = s."userId"
        WHERE s.id = ${where.id}
        LIMIT 1
      `;
      if (!kayit) return null;
      const roller = await sql<{ role: Rol }[]>`
        SELECT role FROM "UserRole" WHERE "userId" = ${kayit.userId}
      `;
      return {
        id: kayit.id,
        revokedAt: kayit.revokedAt,
        idleExpiresAt: kayit.idleExpiresAt,
        expiresAt: kayit.expiresAt,
        lastSeenAt: kayit.lastSeenAt,
        user: {
          id: kayit.userId,
          name: kayit.userName,
          provinceCode: kayit.provinceCode,
          roles: roller,
        },
      };
    },

    /*
     * KAYAN OTURUM. Boşta kalma sayacı yalnızca girişte yazılıyordu; kullanıcı
     * panelde kesintisiz çalışsa bile 30 dakika sonra çıkışa düşüyordu.
     *
     * Tazeleme koşullu bir UPDATE: oturum hâlâ geçerliyse (iptal edilmemiş, iki
     * süre de dolmamış) ve son görülmenin üstünden aralık geçmişse yazıyor.
     * Koşullar SQL'in içinde çünkü okuma ile yazma arasında oturum iptal
     * edilmiş olabilir — ölmüş oturumu diriltmemeli.
     *
     * Yeni bitiş LEAST ile mutlak süreye kırpılıyor: 12 saatlik tavan kayan
     * pencereyle aşılabilir olsaydı oturum sonsuza kadar uzardı.
     */
    async touch({ id, idleMs, araMs }: { id: string; idleMs: number; araMs: number }) {
      await sql`
        UPDATE "Session" SET
          "idleExpiresAt" = LEAST("expiresAt", CURRENT_TIMESTAMP + make_interval(secs => ${idleMs / 1000})),
          "lastSeenAt" = CURRENT_TIMESTAMP
        WHERE id = ${id}
          AND "revokedAt" IS NULL
          AND "idleExpiresAt" > CURRENT_TIMESTAMP
          AND "expiresAt" > CURRENT_TIMESTAMP
          AND "lastSeenAt" < CURRENT_TIMESTAMP - make_interval(secs => ${araMs / 1000})
      `;
    },
  },
  event: {
    async findFirst({ where }: { where: { id: string; provinceCode?: string } }) {
      const ilKosulu = where.provinceCode
        ? sql`AND "provinceCode" = ${where.provinceCode}`
        : sql``;
      const [faaliyet] = await sql<{
        id: string;
        title: string;
        startsAt: Date;
        provinceCode: string | null;
        organizerName: string | null;
        organizerUnit: string | null;
      }[]>`
        SELECT id, title, "startsAt", "provinceCode", "organizerName", "organizerUnit"
        FROM "Event"
        WHERE id = ${where.id} ${ilKosulu}
        LIMIT 1
      `;
      return faaliyet ?? null;
    },
    async findMany({ where }: { where: { provinceCode?: string }; orderBy?: unknown; select?: unknown }) {
      const ilKosulu = where.provinceCode
        ? sql`WHERE e."provinceCode" = ${where.provinceCode}`
        : sql``;
      const faaliyetler = await sql<{
        id: string;
        title: string;
        startsAt: Date;
        provinceName: string | null;
        selectedCount: number;
      }[]>`
        SELECT e.id, e.title, e."startsAt", p.name AS "provinceName",
               COUNT(ap.id)::int AS "selectedCount"
        FROM "Event" e
        LEFT JOIN "Province" p ON p.code = e."provinceCode"
        LEFT JOIN "ActivityParticipation" ap
          ON ap."eventId" = e.id AND ap.status = 'SECILDI'
        ${ilKosulu}
        GROUP BY e.id, p.name
        ORDER BY e."startsAt" DESC
      `;
      return faaliyetler.map((faaliyet) => ({
        id: faaliyet.id,
        title: faaliyet.title,
        startsAt: faaliyet.startsAt,
        province: faaliyet.provinceName ? { name: faaliyet.provinceName } : null,
        _count: { participations: faaliyet.selectedCount },
      }));
    },
  },
  activityParticipation: {
    async findMany({ where, orderBy }: {
      where: { eventId: string; status: "SECILDI"; participantId?: { in: number[] } };
      orderBy?: { appliedAt: "asc" };
      select?: unknown;
    }) {
      if (where.participantId && where.participantId.in.length === 0) return [];
      const kimlikKosulu = where.participantId
        ? sql`AND ap."participantId" IN ${sql(where.participantId.in)}`
        : sql``;
      const siralama = orderBy ? sql`ap."appliedAt" ASC` : sql`k.name ASC, k.surname ASC`;
      const kayitlar = await sql<{
        participantId: number;
        name: string;
        surname: string;
        className: string | null;
        branch: string | null;
        institution: string | null;
      }[]>`
        SELECT ap."participantId", k.name, k.surname, k."className", k.branch, k.institution
        FROM "ActivityParticipation" ap
        JOIN "Participant" k ON k.id = ap."participantId"
        WHERE ap."eventId" = ${where.eventId}
          AND ap.status = ${where.status}
          ${kimlikKosulu}
        ORDER BY ${siralama}
      `;
      return kayitlar.map((kayit) => ({
        participantId: kayit.participantId,
        participant: {
          id: kayit.participantId,
          name: kayit.name,
          surname: kayit.surname,
          className: kayit.className,
          branch: kayit.branch,
          institution: kayit.institution,
        },
      }));
    },
  },
  auditLog: {
    async create({ data }: {
      data: {
        actorId: string;
        action: string;
        targetType: string;
        targetId: string;
        metadata: { detay: string };
      };
    }) {
      const [kayit] = await sql<{ id: string }[]>`
        INSERT INTO "AuditLog" (id, "actorId", action, "targetType", "targetId", metadata, "createdAt")
        VALUES (${randomUUID()}, ${data.actorId}, ${data.action}, ${data.targetType},
                ${data.targetId}, ${sql.json(data.metadata)}, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      return kayit;
    },
  },
};
