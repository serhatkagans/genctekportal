-- Temalar data/temalar.json'dan veritabanına taşınıyor. Dosyadaki üç alanın
-- tabloda karşılığı yoktu; description JSONB'ye gömmek yerine sütun açıldı ki
-- veri sorgulanabilir ve tipli kalsın.
ALTER TABLE "Theme"
  ADD COLUMN "image" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "focus" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "outcomes" TEXT[] NOT NULL DEFAULT '{}';

-- Dosyada eğitim-öğretim yılı hiç tutulmuyordu; taşınan kayıtların insert'i
-- patlamasın diye varsayılan veriliyor.
ALTER TABLE "Theme" ALTER COLUMN "academicYear" SET DEFAULT '';
