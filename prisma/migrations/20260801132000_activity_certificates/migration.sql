CREATE TYPE "ActivityParticipationStatus" AS ENUM ('BASVURDU', 'SECILDI', 'REDDEDILDI');

ALTER TABLE "Event"
  ADD COLUMN "organizerName" TEXT,
  ADD COLUMN "organizerUnit" TEXT;

CREATE TABLE "Participant" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "surname" TEXT NOT NULL,
  "className" TEXT,
  "branch" TEXT,
  "institution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityParticipation" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "participantId" INTEGER NOT NULL,
  "status" "ActivityParticipationStatus" NOT NULL DEFAULT 'BASVURDU',
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityParticipation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Participant_surname_name_idx" ON "Participant"("surname", "name");
CREATE INDEX "ActivityParticipation_eventId_status_idx" ON "ActivityParticipation"("eventId", "status");
CREATE INDEX "ActivityParticipation_participantId_idx" ON "ActivityParticipation"("participantId");
CREATE UNIQUE INDEX "ActivityParticipation_eventId_participantId_key" ON "ActivityParticipation"("eventId", "participantId");

ALTER TABLE "ActivityParticipation"
  ADD CONSTRAINT "ActivityParticipation_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityParticipation"
  ADD CONSTRAINT "ActivityParticipation_participantId_fkey"
  FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
