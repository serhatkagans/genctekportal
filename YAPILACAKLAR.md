# Yapılacaklar

Bu dosya projedeki bilinen eksikleri ve hataları toplar. Her madde koda bakılarak
doğrulanmıştır; parantez içindeki yollar ilgili dosyalardır.

Son güncelleme: 3 Eylül 2026

---

## 1. Bilinen hatalar

Bunlar çalışan bir şeyi bozuyor; sırayı buradan başlatmak mantıklı.

- [x] **Oturum 30 dakikada düşüyor, kullanımdan bağımsız.** (3 Eylül 2026)
  Geçerli her istek artık `idleExpiresAt` ve `lastSeenAt` alanlarını tazeliyor
  (`prisma.session.touch`). Yazma `TAZELEME_ARALIGI_MS` = 1 dakika ile
  seyreltiliyor; yeni bitiş `LEAST(..., "expiresAt")` ile 12 saatlik mutlak
  tavana kırpılıyor ve koşullar SQL'in içinde, iptal edilmiş oturum
  dirilmiyor. (`lib/auth/oturum.ts`, `lib/security/session.ts`, `lib/db.ts`)

- [ ] **Hydration uyuşmazlığı.** Tarayıcı konsolunda tekrar tekrar
  "Hydration failed because the server rendered text didn't match the client"
  çıkıyor. Muhtemel sebep: tema seçicinin `localStorage`'dan okuyup React
  hydrate olmadan `<html>` üzerine `data-theme` yazan satır içi betiği.
  İşlevi bozmuyor ama React ağacı istemcide yeniden kuruluyor.
  (`app/layout.tsx`, `components/TemaSecici.tsx`)

- [ ] **`notFound()` 404 yerine 200 dönüyor.** Silinmiş bir haberin/temanın
  adresine gidildiğinde 404 sayfası görünüyor ama HTTP durumu 200. Arama
  motorları sayfayı var sayar. Streaming + `force-dynamic` birleşiminden
  kaynaklanıyor.
  (`app/haberler/[slug]/page.tsx`, `app/temalar/[slug]/page.tsx`)

- [ ] **Ağ adresinden giriş yapılamıyor.** Oturum çerezi `__Host-` önekli
  olduğu için `Secure` zorunlu; `http://172.20.10.2:3010` üzerinden tarayıcı
  çerezi reddediyor. Yalnızca `localhost` veya HTTPS ile giriş mümkün.
  Başka cihazdan test edilecekse HTTPS gerekiyor.
  (`lib/security/session.ts`)

---

## 2. Bağlanmamış yönetim ekranları

Şemada modelleri hazır, ekranlar hâlâ "bağlı değil" uyarısı gösteriyor.

- [ ] **Kullanıcılar** — `User` / `UserRole` / `Invitation`. Kullanıcı listesi,
  rol atama, davet gönderme, hesap kilidi açma. Şu an tek hesap var ve o da
  yalnızca `npm run db:seed` ile oluşuyor.
  (`app/yonetim/kullanicilar/page.tsx`)

- [ ] **Denetim kaydı** — `AuditLog`. Tablo doluyor (belge üretimi, başvuru
  açma, durum değişikliği, CSV indirme hepsi yazılıyor) ama görüntüleyecek
  ekran yok. Filtre + kullanıcıya/hedefe göre arama gerekiyor.
  (`app/yonetim/denetim/page.tsx`, yazan taraf `lib/yetki/log.ts`)

- [ ] **Ayarlar** — `GlobalSetting`. Site geneli ayarlar için model var,
  kullanılmıyor.
  (`app/yonetim/ayarlar/page.tsx`)

- [ ] **Belge kitaplığı** — `Document`. Yayımlanan PDF/dokümanların yönetimi.
  Faaliyet belgeleriyle karıştırılmasın; bu ayrı bir kütüphane.
  (`app/yonetim/belgeler/page.tsx`)

---

## 3. Kimlik doğrulama akışları

Giriş ve çıkış çalışıyor. Geri kalanı statik sayfa olarak duruyor.

- [ ] **Parola sıfırlama.** `/parola-sifirla` işlevsiz bir sayfa. `PasswordReset`
  tablosu hazır ama e-posta gönderimi gerekiyor — `.env` içindeki `SMTP_URL` boş.
  Yazılırken PAROLA YAZAN DAL `oturumlariKapat()` ÇAĞIRMALI ve
  `passwordChangedAt`'i tazelemeli: oturum doğrulaması parolaya değil
  `revokedAt`'e bakıyor, yoksa parola değişse de eski çerez geçerli kalır.
  Mekanizma hazır, çağrılması yeter.
  (`app/parola-sifirla/page.tsx`, `lib/yonetim/kullanici.ts`, `lib/auth/oturum.ts`)

- [ ] **MFA / TOTP.** `lib/security/totp.ts` yazılmış ve test ediliyor, `/mfa` ve
  `/mfa/kurtarma` ekranları duruyor, `User` tablosunda `totpSecretEncrypted`,
  `mfaEnabled`, `recoveryCodeHashes` alanları var — ama giriş akışına bağlı değil.
  (`app/mfa/page.tsx`, `app/mfa/kurtarma/page.tsx`, `lib/auth/giris.ts`)

- [ ] **Davet ile hesap açma.** `/davet/[token]` statik. `Invitation` tablosu
  hazır. Giriş ekranı "Hesaplar yalnızca sistem yöneticisi davetiyle oluşturulur"
  diyor ama davet gönderme/kabul etme yok.
  (`app/davet/[token]/page.tsx`)

- [ ] **Oturum yönetimi ekranı.** `/hesabim/oturumlar` statik. `Session` tablosu
  cihaz ve IP özeti tutuyor; kullanıcı kendi oturumlarını görüp iptal edebilmeli.
  (`app/hesabim/oturumlar/page.tsx`)

- [ ] **CSRF belirteci doğrulanmıyor.** Oturum açarken `csrfHash` üretilip
  saklanıyor ama hiçbir yerde kontrol edilmiyor. Next.js sunucu eylemleri kendi
  origin kontrolünü yapıyor, yani şu an açık bir zafiyet yok; ama alan boş yere
  duruyor — ya kullanılmalı ya kaldırılmalı.
  (`lib/security/session.ts`, `lib/auth/giris.ts`)

---

## 4. KVKK ve kişisel veri

- [x] **Saklama süresi otomatik uygulanmıyor.** (3 Eylül 2026)
  `scripts/kvkk-temizlik.mjs` süresi dolan başvuruyu, notlarını, eklerini,
  `Media` satırlarını ve diskteki dosyalarını siliyor; denetim günlüğüne
  `KVKK_SAKLAMA_SILME` yazıyor. Bayraksız çağrı kuru çalıştırma, silmek için
  `--uygula`. Sunucuda günlük systemd timer ile çalışır — kurulum adımları
  DAGITIM.md'de. **Timer sunucuda henüz kurulmadı.**
  (`scripts/kvkk-temizlik.mjs`, `lib/forms/basvuru.ts`)

- [ ] **Yalnızca telefon ve e-posta şifreli.** Ad, kurum, il ve çalışma
  açıklaması listeleme/filtreleme için açık duruyor. Bunlar da kişisel veri;
  ekranda maskeleniyor ama veritabanında açık. Kapsam genişletilecekse arama
  stratejisi de değişmeli.
  (`lib/forms/basvuru.ts`, `lib/security/veri-sifreleme.ts`)

- [ ] **Anahtar rotasyonu yok.** `DATA_ENCRYPTION_KEY` değişirse eski kayıtlar
  çözülemez; ekran "çözülemedi" yazar. Sürüm öneki (`enc:v1:`) hazır, çok
  anahtarlı çözme eklenebilir.
  (`lib/security/veri-sifreleme.ts`)

- [ ] **Ek dosyalar virüs taranmıyor.** `SubmissionAttachment.scanResult` alanı
  var, kullanılmıyor. Dosyalar `veri/basvuru-ekleri/` altında, web'den
  servis edilmiyor ve yalnızca yetkili uçtan indiriliyor — ama tarama yok.

---

## 5. Form ve başvuru

- [ ] **Form alanları kodda sabit.** `/katilim` formunun alanları
  `lib/validation/participation.ts` içinde. Panelden alan ekleme/çıkarma,
  alan türleri ve sürümleme yok; `FormVersion.schema` şu an yalnızca
  "alanlar şu dosyada" notunu tutuyor.

- [ ] **İlçe eşleşmiyor.** `District` tablosu boş olduğu için `Submission.districtId`
  hep null; ilçe adı yalnızca cevaplar içinde metin olarak duruyor. İl-ilçe
  listesi yüklenirse form da açılır listeye çevrilebilir.
  (`scripts/seed-veritabani.mjs`)

- [ ] **Açılış/kapanış tarihi uygulanmıyor.** Formlar ekranından `opensAt` ve
  `closesAt` kaydediliyor ama `/katilim` ve `POST /api/basvurular` bunlara
  bakmıyor; form her zaman açık.
  (`app/api/basvurular/route.ts`, `app/katilim/page.tsx`)

---

## 6. Etkinlik ve belge akışı

- [ ] **Katılımcı yönetimi ekranı yok.** Belge yalnızca `SECILDI` durumundaki
  katılımcılar için üretiliyor, ama katılımcı ekleyip durumunu değiştirecek bir
  ekran yok — kayıtlar sadece `npm run db:seed` ile geliyor. Belge akışının en
  büyük eksiği bu.
  (`Participant`, `ActivityParticipation` modelleri hazır)

- [ ] **Etkinlik–tema bağı editörde gösterilmiyor.** `Event.themeId`'nin
  baktığı `Theme` tablosu artık dolu (temalar 21 Ağustos 2026'da taşındı), yani
  engel kalmadı; etkinlik editörüne tema seçimi eklenmeli.
  (`app/yonetim/etkinlikler/[id]`, `lib/tema.ts`)

- [ ] **Tema slug'ı değişince program içeriği kopuyor.** `lib/theme-programs.ts`
  içerikleri slug ile eşleşiyor ve kodda duruyor. Editörde uyarı yazılı ama
  otomatik taşıma yok.

---

## 7. Medya

- [ ] **Dosya silme yok.** Medya kütüphanesi listeliyor ve yüklüyor ama silme
  işlemi yok. Silmeden önce dosyanın nerelerde kullanıldığı da kontrol edilmeli.
  (`app/yonetim/medya/page.tsx`, `lib/medya.ts`)

- [ ] **Görsel boyutlandırma yok.** Yüklenen dosya olduğu gibi saklanıyor;
  küçük resim/responsive sürüm üretilmiyor. `Media.variants` alanı bunun için
  ayrılmış, kullanılmıyor.

- [ ] **Nesne depolama bağlanmadı.** `.env` içindeki `OBJECT_STORAGE_ENDPOINT` ve
  `OBJECT_STORAGE_BUCKET` boş; her şey yerel diskte. Tek sunucudan fazlasına
  çıkılırsa gerekli.

---

## 8. Altyapı

- [ ] **PostgreSQL servis olarak kayıtlı değil.** Windows'ta elle başlatılıyor,
  bilgisayar yeniden başlayınca kapanıyor. Başlatma komutu:
  ```
  & "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" -D "C:\Users\HP\pgdata17" -l "C:\Users\HP\pgdata17\server.log" start
  ```
  Servis olarak kaydetmek yönetici izni gerektiriyor.
  Not: cluster `--locale=C` ile kuruldu, çünkü Türkçe sistem yerel ayarında
  `initdb` "Turkish_Türkiye.1254" adındaki `ü` yüzünden hata veriyor.

- [ ] **Oran sınırı bellekte.** `checkRateLimit` süreç içi bir `Map` kullanıyor;
  sunucu yeniden başlayınca sıfırlanıyor ve birden fazla örnek çalıştırılırsa
  paylaşılmıyor. Giriş denemesi sayacı veritabanında olduğu için hesap kilidi
  bundan etkilenmiyor.
  (`lib/security/rate-limit.ts`)

- [ ] **E-posta gönderimi yok.** `SMTP_URL` boş. Davet, parola sıfırlama ve
  başvuru bildirimleri bunu bekliyor.

- [ ] **Testler dar kapsamlı.** 29 test var ama hepsi saf fonksiyonlar
  (doğrulama, biçim dönüştürme, parola/oturum yardımcıları). Veritabanına dokunan
  hiçbir şey test edilmiyor; sunucu eylemleri ve ekranlar için test yok.

---

## 9. Küçük işler

- [ ] `data/haberler.json` ve `data/koordinatorler.json` hâlâ dosya tabanlı;
  eşzamanlı iki kayıt birbirini ezebilir. Temalar için yapılan göç (`lib/tema.ts`,
  `scripts/goc-temalar.mjs`) bunların da deseni; sırada `haberler` var.

- [ ] Haber editöründe önizleme yok — düz metnin nasıl görüneceği ancak
  kaydedince görülüyor.

- [ ] Koordinatör listesinde sayfalama/arama yok; 101 kayıt tek sayfada.

- [ ] `/yonetim` genel bakış ekranındaki bazı kutular hâlâ
  `lib/admin-data.ts` içindeki sabit örnek veriden besleniyor.

---

## Tamamlananlar

Referans olsun diye; bunlar bu projede yapıldı ve çalışır durumda.

- PostgreSQL 17 kurulumu, `genctek` veritabanı, eksik baseline migration'ın
  üretilmesi, `npm run db:seed` ile 81 il + örnek veri
- `proxy.ts` içindeki geçersiz `runtime` alanının kaldırılması (Next 16 hatası)
- Hero panelinin yeniden tasarımı ve kırmızı temada kırmızı-üstüne-kırmızı
  okunmazlığının giderilmesi
- Haber editörü: normal yazım / HTML çift biçim, gövde içi görsel ekleme
- Görsel yükleme altyapısı: `/api/yonetim/medya`, kütüphaneden seçme,
  sürükle-bırak, haber + tema + koordinatör ekranlarında ortak alan
- Tema ekleme/düzenleme/silme; 21 Ağustos 2026'da `data/temalar.json`'dan
  PostgreSQL `"Theme"` tablosuna taşındı (`scripts/goc-temalar.mjs`)
- Etkinlik ekleme/düzenleme/silme + zaman damgası kayması düzeltmesi
- Giriş/çıkış, hesap kilidi, oran sınırı, `AuthEvent` denetim kaydı
- Başvuruların veritabanına yazılması (öncesinde bellekte tutulup kayboluyordu),
  maskeleme, rol bazlı açma, denetim kaydı, CSV dışa aktarma, yetkili ek indirme
- Formlar ekranı: saklama süresi, rıza metni ve sürümü, açılış/kapanış tarihi
