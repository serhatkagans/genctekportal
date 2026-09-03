-- Koordinatörler data/koordinatorler.json'dan "Coordinator" tablosuna taşınıyor.

/* Dosyadaki dört rol etiketinin şemada üç karşılığı vardı; "İl Yöneticisi"
   (6 kayıt) hiçbirine denk gelmiyordu. Postgres 12'den beri ADD VALUE bir
   işlem içinde çalışabiliyor, yeter ki değer aynı işlemde kullanılmasın —
   kullanan göç betiği ayrı bir bağlantıda koşuyor. */
ALTER TYPE "CoordinatorRole" ADD VALUE 'PROVINCE_MANAGER';

/* Altı kaydın rol alanı dosyada boş. Zorunlu bırakmak, olmayan bir bilgiyi
   uydurup hepsini rastgele bir role yazmak demekti; haberlerdeki authorId ile
   aynı gerekçe. Boş rol panelde de boş görünmeye devam eder. */
ALTER TABLE "Coordinator" ALTER COLUMN "role" DROP NOT NULL;

/* Fotoğraf dosyada düz bir yol ("/wordpress/media/...png"); şemadaki
   photoMediaId bir "Media" satırı bekliyor, taşınan kayıtların öyle bir
   kaydı yok. Temalardaki image, haberlerdeki coverImage ile aynı durum. */
ALTER TABLE "Coordinator" ADD COLUMN "photo" TEXT NOT NULL DEFAULT '';
