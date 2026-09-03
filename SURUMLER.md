# Sürümler

Portalın yayımlanmış sürümleri. Numaralandırma `BÜYÜK.KÜÇÜK.YAMA`:

| Bölüm | Ne zaman artar |
|---|---|
| **BÜYÜK** | Sitenin yapısı değişir: adresler taşınır, bir bölüm kalkar, dağıtım adımları farklılaşır. Yayımlamadan önce bu dosyadaki notun okunması gerekir. |
| **KÜÇÜK** | Yeni sayfa, yeni bölüm, gözle görülür bir davranış değişikliği. |
| **YAMA** | Hata düzeltmesi, metin/görsel rötuşu, iç düzenleme. Ziyaretçi yeni bir şey görmez. |

Yayımlama akışı ve etiketlerin sunucuda nasıl kullanıldığı **DAGITIM.md ·
"Sürümler"** başlığındadır. Yeni sürüm `node scripts/surum-yayinla.mjs` ile
kesilir; betik aşağıdaki **Yayımlanmamış** başlığını tarihiyle birlikte sürüme
çevirir, bu yüzden her değişiklik önce oraya bir satır olarak yazılır.

---

## Yayımlanmamış

<!-- Buraya yazılan maddeler bir sonraki sürümün notu olur. -->

- **Oturum artık kullanımdayken düşmüyor.** Boşta kalma sayacı yalnızca girişte
  yazılıyordu; panelde kesintisiz çalışan kullanıcı 30 dakika sonra çıkışa
  düşüyordu. Geçerli her istek sayacı sıfırlıyor. Yazma dakikada bire
  seyreltildi ve yeni bitiş 12 saatlik mutlak süreye kırpılıyor — kayan pencere
  oturumu sonsuza uzatmıyor. İptal edilmiş oturum tazelenmiyor
  (`lib/auth/oturum.ts`, `lib/db.ts`, `lib/security/session.ts`).
- **KVKK saklama süresi artık uygulanıyor.** `npm run kvkk:temizle` süresi dolan
  başvuruyu, notlarını, eklerini, eklerin medya kayıtlarını ve diskteki
  dosyalarını siliyor; denetim günlüğüne satır bırakıyor. Bayraksız çağrı hiçbir
  şey silmez, yalnızca raporlar; silmek için `--uygula`. Sunucuda günlük systemd
  timer ile çalışır, kurulum adımları DAGITIM.md'de
  (`scripts/kvkk-temizlik.mjs`).
- `npm run test:load` ile yerel yük testi ve genişletilmiş güvenlik testleri
  depoya alındı (`scripts/yuk-testi.mjs`, `tests/guvenlik-kapsamli.test.ts`).

---

## v2.0.2 — 3 Eylül 2026

- **Hız sınırı artık `X-Forwarded-For` ile atlatılamıyor.** Başlık ilk
  öğesinden okunuyordu; Apache o başlığı ezmeyip sonuna eklediği için ilk öğe
  istemcinin yazdığı değerdi. Giriş ve başvuru sınırları başlık döndürülerek
  aşılabiliyor, denetim kayıtlarına uydurma IP özeti yazılıyordu. Okuma son
  öğeye çevrildi (`lib/security/istemci-ip.ts`).
- `npm run db:seed` var olan hesabın parolasını döndürürken açık oturumları da
  iptal ediyor. Eskiden yeni parola yazılıyor ama elinde eski çerez olan biri
  panelde gezmeye devam ediyordu.

---

## v2.0.1 — 3 Eylül 2026

- **Yayımlanmamış haber siteye sızamaz.** Kamuya açık haber sorguları artık
  `status = 'PUBLISHED'` koşulunu uyguluyor. Bugün tabloya yalnızca yayımlanmış
  haber yazıldığı için görünen bir değişiklik yok; taslak ya da zamanlanmış
  yayın eklendiği gün açık kapıyı kapatıyor. Panel taslakları görmeye devam
  ediyor (`lib/haber.ts`, `app/yonetim`).
- Site haritasının ana sayfa satırı 301 yerine doğrudan kanonik adresi veriyor;
  kök girdi eğik çizgili yazılıyor (`app/sitemap.ts`).
- `fast-uri` güvenlik uyarısı (yüksek) kapatıldı. Paket yalnızca yerel
  geliştirme zincirinden geliyordu, üretimdeki uygulamada yok.
- `next dev`'in ürettiği `AGENTS.md`/`CLAUDE.md` izlemeye alındı; izlenmedikçe
  her dev çalıştırması ağacı kirletiyor ve sürüm betiğini durduruyordu.

---

## v2.0.0 — 3 Eylül 2026

- **İçerik veritabanına taşındı.** Haberler, koordinatörler ve yönlendirmeler
  artık `data/*.json` dosyalarında değil PostgreSQL'de. Dosyalar yedeklenmiyordu
  ve panelden yapılan iki eşzamanlı düzenleme birbirini eziyordu. Kurulum artık
  `prisma migrate deploy` ve bir kereliğine `npm run goc:haberler` /
  `goc:koordinatorler` gerektiriyor; ayrıntı DAGITIM.md'de.
- Koordinatör listesindeki bir yazım hatası göçte düzeldi: Artvin "Artin"
  yazılıyordu. İSTANBUL, TOKAT ve Hakkari de doğru yazımlarına çevrildi.
- **Olmayan adresler artık 404 dönüyor.** Eskiden "sayfa burada değil" ekranı
  200 ile veriliyordu; arama motorları onu geçerli içerik sayıp indeksliyor,
  yayından kaldırılan sayfa kaldırıldığını bildiremiyordu.
- **Ana sayfa güvenlik başlıklarını alıyor.** Alt sayfalar CSP, HSTS ve
  çerçeveleme korumasını alırken ana sayfa hiçbirini almıyordu. Çözüm iki
  parçalı ve İKİSİ BİRLİKTE uygulanmalı: `next.config.ts` ·
  `skipTrailingSlashRedirect` ve Apache'de çıplak `/genctekportal` yolunun
  eğik çizgili hâline yönlendirilmesi. Biri diğeri olmadan sonsuz döngü olur;
  yayın sırası ve DirectAdmin yenileme adımı DAGITIM.md'de.
  Ziyaretçi açısından tek fark: ana sayfa adresi `/genctekportal/` hâline
  yönleniyor, alt sayfaların adresi değişmedi.
- **Haber sayfaları hızlandı.** Haber listesi her istekte bütün gövdeleri
  yeniden işliyordu; iş bir kez göçte yapılıp saklandı. Ölçüm: `/haberler`
  24 → 68 istek/sn, ana sayfa 21 → 46, haber detayı 84.
- Giriş ve başvuru formundaki deneme sınırı artık veritabanında tutuluyor.
  Eskiden süreç belleğindeydi: her yayın sonrası sıfırlanıyordu ve uygulama
  çok sürece çıkarılsaydı sınır fiilen süreç sayısı kadar katlanacaktı.
- `sanitize-html` yamalı sürüme çekildi (2.17.6 → 2.17.7). Kayıtlı açık bu
  yapılandırmada sömürülebilir değildi (SVG etiketleri kapalı), yine de kapatıldı.

- Logolar sayfasına "Renk kodları" kartı eklendi (PDF); "GençTek logo" kartı
  artık tek bir PNG yerine logo arşivini (RAR) indiriyor.
- Logolar sayfasındaki "İndirilebilir · Marka öğeleri" ara başlığı kaldırıldı;
  kartlar doğrudan sayfa başlığının altında. GençTek logo kartı da diğerleriyle
  aynı biçimde: önizleme görseli yok, indirme bağlantısı duruyor.

- Temel etkinlikler listesinde Hack The Idea, Akran Öğretimi, Dijital Yürüyüş
  STEM ve Hatalarından Ders Çıkar kartları artık kendi kapak fotoğraflarıyla
  çıkıyor; Misafir Öğretmenlik/Öğrencilik kapağı yenisiyle değişti.
- "GençTek Nedir?" sayfasında koordinatörlüğün adı YEĞİTEK Ar-Ge ve Ekosistem
  Daire Başkanlığı Genç Bilişim Ekosistemi Koordinatörlüğü olarak güncellendi.
- Aynı sayfaya ETKİM bölümü eklendi: tanıtım metni, GençTek tanıtım videosu ve
  ETKİM videosu.

- Hakkında ve GençTek Zirvesi açılır menülerindeki bağlantılar artık menü
  kapanmadan tıklamayı tamamlıyor; alt sayfalara geçiş yeniden çalışıyor.
- Ziyaretçi sayfalarındaki paragraf ve madde metinleri iki yana yaslandı; temel
  etkinlik detaylarında üst başlık ile gövde aynı sütunda hizalandı.
- WordPress'in `[…]` ile yarım bıraktığı haber özetleri tam paragraf sonunda
  tamamlanıyor; sonraki içe aktarımlarda da kesik özet üretilmiyor.
- Çalışma grupları sayfası, veritabanının geçici olarak bağlantıyı sıfırlaması
  durumunda hata ekranı yerine depodaki son sağlam tema listesini gösteriyor.

- **Güvenlik: il koordinatörü ekleme/düzenleme/silme eylemleri yetki kontrolüne
  bağlandı.** Üç sunucu eylemi de kontrolsüzdü; sayfayı koruyan layout sunucu
  eylemlerini kapsamıyor.
- **İçerik güvenliği politikası (CSP) genişletildi**: varsayılan olarak yalnızca
  kendi kaynağımız; gömü olarak yalnızca YouTube, form gönderimi yalnızca kendi
  köküne. Çerçeveleme koruması `SAMEORIGIN` yerine `DENY`.
- Bağımlılıklardaki sekiz yüksek seviyeli güvenlik açığı kapatıldı (Next 16.3.4,
  sharp 0.35.4, postcss 8.5.23, nanoid 3.3.18; prisma zinciri `overrides` ile).
  `package.json`'daki `"latest"` sürümler gerçek aralıklara sabitlendi.

- **Zirve ve haber sayfalarındaki fotoğraflar kayan galeriye alındı.** Alt alta
  dizilmek yerine kendiliğinden akan yatay bir şeritte duruyorlar; sol ve sağ
  oklarla elle de gezilebiliyor, imleç üzerindeyken ya da bir düğmeye
  basıldığında akış duruyor.
- Haber gövdelerinin sonunda, arşivden gelen boş satır yığınları kısıldı: metin
  ile "Önceki/Sonraki Haber" bağlantıları arasındaki yarım ekranlık boşluk
  kalktı. Bilinçli tek satır atlamaları duruyor.
- Ana sayfadaki haber şeridinin kaydırma düğmeleri ok simgesine dönüştü,
  denetim çubuğu tek bir kapsül hâlinde toplandı.
- Temel etkinlik sayfalarının altındaki önceki/sonraki bağlantıları
  haberlerdekinden daha dar ve kısa; tek komşu varken satırı kaplamıyor.
- Alt bilgideki ETKİM bağlantısı `etkim.gov.tr` olarak düzeltildi.
- Temel GençTek Etkinlikleri sayfasından "Çalışma Grubu Etkinlikleri" bölümü
  tamamen kaldırıldı (başlık ve kartlar). EĞİTİJAM, Capture The Flag, Mobil
  Uygulama Geliştirme Yarışması, Teknik Gezi, Master Tek ve E-Ticaret
  Ideathonu sayfaları adreslerinde durmaya devam ediyor.
- Temel GençTek Etkinlikleri kartlarının kapakları yenilendi: Genç Gölge, Sahne
  Senin, G2S, Sınır Ötesi, Öğrenci Forumu, Oyunun e Hâli, Tek Maraton, Misafir
  Öğretmenlik/Öğrencilik ve GençTek Zirvesi.
- 1. GençTek Zirvesi (2025) sayfasına on iki fotoğraf ve tanıtım videosu eklendi.
- **EğitiJAM ayrı bir çalışma grubu kartı oldu.** Oyun Tasarımı sayfasının
  altında duran maraton programı ve arşiv yazısı artık kendi kartının
  sayfasında; Oyun Tasarımı'nda yalnızca grubun tanıtım metni kaldı.
- Temel etkinlik sayfalarındaki fotoğraflar kaldırıldı; görseller listedeki
  kartlarda duruyor.
- 2. GençTek Zirvesi sayfasının fotoğraf galerisine on beş yeni kare eklendi.
- EğitiJAM arşiv içeriği (maraton ve finalistler) Oyun Tasarımı çalışma grubu
  sayfasından Oyun Tasarımı yardımlaşma grubunun sayfasına taşındı; çalışma
  grubu sayfasında yalnızca tanıtım metni kaldı.
- **Çalışma grupları sayfasına "Yardımlaşma Grupları" bölümü eklendi**: MEB
  Robot Yarışması, TEKNOFEST, TÜBİTAK ve Oyun Tasarımı. Her birinin kendi
  sayfası var; tanıtım metinleri gelene kadar sayfa metnin hazırlandığını
  söylüyor. EğitiJAM programı, çalışma grubu sayfasından Oyun Tasarımı
  yardımlaşma grubunun sayfasına taşındı.
- Çalışma grubu sayfalarında yalnızca gövde metni kalıyor: kapak görseli,
  "Keşfet, dene, birlikte üret." başlığı, odak alanları ve üretim çıktıları
  listeleri ile arşiv fotoğrafları kaldırıldı. Görseller listedeki kartlarda
  duruyor.
- Etkinlikler sayfasının üst yazısı değişti, "Süren ve yaklaşan etkinlikler"
  başlığı kalktı ve sayfanın altına ana sayfadaki ekosisteme giriş şeridi
  eklendi.
- Alt bilgide logoların altındaki yazılar kaldırıldı, logolar kurum sitelerine
  bağlandı ve e-posta adresi KVKK bağlantısının yanına taşındı.
- "İl Koordinatörleri" başlığı "İl GençTek Koordinatörleri" oldu.
- Temel GençTek Etkinlikleri sayfasındaki açıklama kaldırıldı, üst etiket
  "Ekosistem etkinlikleri" oldu; etkinlik sayfalarına haberlerdeki gibi önceki
  ve sonraki etkinlik bağlantıları eklendi, görseller de haberlerdeki gibi tek
  sütunda ve kırpılmadan basılıyor.
- "GençTek nedir" sayfasının başlığı "Genç Bilişim Ekosistemi" olarak kısaldı.
- Ana sayfadaki haber şeridine sola/sağa kaydırma düğmeleri eklendi; şerit
  artık gerçek bir kaydırma kutusu olduğu için kaçan haber geri getirilebiliyor
  ve dokunmatik ekranda parmakla da kaydırılıyor.
- Üst menüdeki "Hakkında" tıklandığında ana sayfadaki kart bölümüne iniyor.
- Haber gövdelerinde görsellerin altındaki açıklama satırları kaldırıldı; metin
  ekran okuyucular için `alt` olarak duruyor.
- Yapay Zekâ çalışma grubunun kapak görseli yenilendi.
- Haber detay sayfalarının altına önceki ve sonraki habere geçiş bağlantıları
  eklendi.
- Haber sayfalarında başlık, kapak, metin ve fotoğraflar tek sütun genişliğine
  alındı; kapak görselinin gövdede tekrarı kaldırıldı ve WordPress'ten küçük
  kopyasıyla gelen galeri görselleri tam boy sürümüyle basılıyor.
- 2. GençTek Zirvesi sayfasına katılım sayılarının şeridi ve zirve programının
  başlıklı bölümleri (oturumlar ve alanlar) eklendi; giriş metni yenilendi.
- Oyun Tasarımı - EğitiJAM çalışma grubunun kapak görseli yenilendi ve web için
  küçültüldü; mobil menüdeki Hakkında bağlantıları açılır bir alt menüye alınarak
  taşma ve renk uyumsuzluğu giderildi.
- Çalışma grubu detay sayfalarındaki kapak görselleri kare yerine 16:9 yatay
  oranda gösteriliyor.
- Çalışma grubu detay sayfalarında kalan “tema” ifadeleri “çalışma grubu”
  olarak güncellendi.
- Robotik, Siber Güvenlik, Mobil Programlama, Eğitim Teknolojileri, GençX ve
  Havacılık Sistemleri çalışma gruplarının kapak görselleri eklendi.

- **Çalışma grupları sayfasının başlığı** "Teknoloji temaları" → **Çalışma
  Grupları** (`/temalar`, adres değişmedi). Web Programlama grubuna görsel
  bağlandı — dosya `public/temalar` altında ve depoda değil, sunucuya ayrıca
  kopyalanır.
- Alt bilgide YEĞİTEK logosu büyütüldü, iletişim satırı markanın altına çekildi.

- **Çalışma grubu listesi YEĞİTEK'in 15 başlığıyla eşitlendi.** Adı tutan
  sekiz grubun metni yenilendi (adresleri, görselleri korunarak), yedi yeni
  grup eklendi (Bilgisayar Olimpiyatları, Web Programlama, Robotik, Siber
  Güvenlik, Mobil Programlama, Eğitim Teknolojileri, GençX), listede olmayan
  sekiz grup silindi. Betik: `scripts/calisma-gruplarini-yenile.mjs`
  (`--uygula` ile yazar) — **içerik veritabanında olduğu için sunucuda da
  çalıştırılmalı**.
- **Hedefler sayfası GençTek Yapılanma oldu** (`/hakkinda/amaclar`, adres
  değişmedi): dört maddelik hedef listesi yerine ekosistemi oluşturan on iki
  başlık ve üstünde yapılanma şeması.
- **2. GençTek Zirvesi sayfası yenilendi:** beş yeni fotoğraf (sıra dosya
  adlarındaki numaraya göre), tanıtım videosu ve başlık üstünde "13-14 Nisan
  2026 / Ankara". Video `public/video` altında ve depoda değil — bkz.
  DAGITIM.md · "Medya depoda değil".
- **Alt bilgi yeniden düzenlendi:** en üstte yan yana üç kurum (YEĞİTEK
  logosu ve altında kurum satırı · GençTek · ETKİM logosu), yalnızca adlardan
  oluşan şerit ve "© 2026 GençTek" satırı kalktı, en altta KVKK ve Gizlilik.
- **"Temel GençTek etkinlikleri" üst menüden kalktı**, sayfası ve Hakkında
  kartı yerinde duruyor.
- `/hakkinda/genctek-nedir` başlığındaki "Sektörün Yeni Lideri" → **"Sektörün
  Yeni Liderleri"**.

- **Hakkında liste sayfası kalktı.** Altı kart artık ana sayfada, haberlerin
  altında duruyor. `/hakkinda` kalıcı olarak `/#hakkinda` çapasına
  yönlendiriliyor; alt sayfalar (`/hakkinda/amaclar`, `/hakkinda/logolar` …)
  yerinde.
- **Üst menüye Hakkında açılır menüsü.** Başlıklar ve adresler
  `lib/hakkinda.ts`'ten geliyor, yani kartlarla tek kaynaktan besleniyor.
  Başlıklar doğrudan **kendi sayfalarına** gidiyor. Menünün kendi başlığı ana
  sayfadaki kart bölümüne (`/#hakkinda`) iniyor; bu çapa düz `<a>`, çünkü
  `next/link` adres zaten ana sayfayken yalnızca karma değiştiğinde her zaman
  kaydırmıyordu.
- **Temel GençTek etkinliklerinin ayrı sayfaları geri geldi:**
  `/hakkinda/temel-etkinlikler/<slug>`. Program listesi sayfa dosyasından
  `lib/temel-etkinlik.ts`'e taşındı — liste kartları ve detay sayfaları aynı
  kaynaktan basılıyor, adresler site haritasına da giriyor.
- Kart başlıkları düzeltildi (“Logolar ve roll-up'lar” → **GençTek
  Kurumsal**, “Hedefler” → **GençTek Hedefleri**); alt bilgideki
  “Keşfet” ve “Katılım” sütunları kaldırıldı, iletişim
  bölümüne YEĞİTEK satırı eklendi.

---

## v1.1.0 — 28 Ağustos 2026

- Ana sayfa panelindeki sayı şeridine **il sayısı** eklendi: ekosistemin kaç
  ilde olduğu, öğrencisi ya da danışmanı bulunan farklı il sayısından
  hesaplanıyor. Kaynak platformun `/api/acik-istatistik` ucu; şerit altı
  sütuna çıktı, 720px altında 3+3 iki sıraya iniyor.

---

## v1.0.0 — 28 Ağustos 2026

Etiketlenen ilk sürüm. Portal Ağustos 2026'dan beri yayında; bu numara yeni
bir işin değil, **var olan canlı sitenin** başlangıç noktasıdır. Öncesindeki
geçmiş git günlüğünde duruyor.

O günkü durum, kabaca:

- Tanıtım sitesi `aiotechs.cloud/genctekportal` adresinde, alt dizin
  kurulumuyla (`NEXT_PUBLIC_BASE_PATH`).
- Haberler, temalar (çalışma grupları), il koordinatörleri, Hakkında ve
  Temel GençTek etkinlikleri sayfaları.
- Etkinlikler ve ana sayfadaki sayılar GençTek platformunun herkese açık
  ucundan okunuyor; uç kapalıysa portal çökmüyor, o bölüm boş kalıyor.
- İçerik yönetim panelinden yazılıyor; `data/*.json` ve medya klasörleri
  depoda değil, canlı içeriğin sahibi sunucu.
- Güvenlik başlıkları (HSTS, CSP, X-Frame-Options) middleware'de.
