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

<!-- Buraya yazılan maddeler bir sonraki sürümün notu olur. Boşsa sürüm
     kesilemez: neyin yayımlandığı yazılı olmayan bir sürüm, olmayan sürümden
     iyi değildir. -->

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
