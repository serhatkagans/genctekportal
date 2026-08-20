import postgres from "postgres";
import { randomUUID } from "node:crypto";

const globalForSql = globalThis as unknown as { genctekSql?: ReturnType<typeof postgres> };
const baglantiYolu = process.env.DATABASE_URL ?? "postgresql://gecersiz:gecersiz@127.0.0.1:5432/gecersiz";

// Sürücü bağlantıyı ilk sorguya kadar açmaz; böylece Next build aşaması veritabanına bağımlı olmaz.
const sql = globalForSql.genctekSql ?? postgres(baglantiYolu, { max: 10, idle_timeout: 20 });
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
        userId: string;
        userName: string;
        provinceCode: string | null;
      }[]>`
        SELECT s.id, s."revokedAt", s."idleExpiresAt", s."expiresAt",
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
        user: {
          id: kayit.userId,
          name: kayit.userName,
          provinceCode: kayit.provinceCode,
          roles: roller,
        },
      };
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
