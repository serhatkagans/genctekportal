-- Hakkında kartları ve sayfaları lib/hakkinda.ts'teki sabit diziden "Page"
-- tablosuna taşınıyor. Tablo şemada baştan beri vardı ama boştu.
--
-- Kartın alanları (özet, simge, sıra) JSONB gövdeye gömülmedi: sıralama ve
-- listeleme sorgusu bunları okuyor, tipli ve indekslenebilir kalmaları gerek.
ALTER TABLE "Page"
  ADD COLUMN "section"   TEXT    NOT NULL DEFAULT 'hakkinda',
  ADD COLUMN "order"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "iconName"  TEXT    NOT NULL DEFAULT 'badge',
  ADD COLUMN "summary"   TEXT    NOT NULL DEFAULT '',
  ADD COLUMN "pageTitle" TEXT    NOT NULL DEFAULT '',
  ADD COLUMN "eyebrow"   TEXT    NOT NULL DEFAULT '',
  ADD COLUMN "lede"      TEXT    NOT NULL DEFAULT '',
  ADD COLUMN "linkUrl"   TEXT    NOT NULL DEFAULT '',
  ADD COLUMN "layout"    TEXT    NOT NULL DEFAULT 'tek';

-- Kart ızgarası ve üst menü her istekte bu sırayla okuyor.
CREATE INDEX "Page_section_order_idx" ON "Page"("section", "order");
