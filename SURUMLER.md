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

- Çalışma grubu detay sayfalarındaki kapak görselleri kare yerine 16:9 yatay
  oranda gösteriliyor.

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
