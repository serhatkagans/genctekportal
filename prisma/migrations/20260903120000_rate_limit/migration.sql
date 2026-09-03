-- Hız sınırı sayaçları süreç içi bir Map'te tutuluyordu. Tek Node süreci varken
-- bu yeterliydi; portalı çok sürece çıkarmanın önkoşulu sayacın paylaşılması,
-- yoksa dört süreç girişteki beş deneme sınırını fiilen yirmiye çıkarır.
CREATE TABLE "RateLimit" (
  "key"          TEXT      NOT NULL,
  "count"        INTEGER   NOT NULL,
  "resetAt"      TIMESTAMP NOT NULL,
  "blockedUntil" TIMESTAMP,

  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- Süresi dolmuş satırların toplanması için; anahtar kümesi saldırı altında
-- (her ip+eposta çifti ayrı satır) sınırsız büyüyebilir.
CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit" ("resetAt");
