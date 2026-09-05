# Portal — dağıtım

Tanıtım sitesi `https://aiotechs.cloud/genctekportal` adresinde yayında.
GençTek platformu (panel) aynı sunucuda ama **ayrı bir uygulama ve ayrı bir
veritabanı**: `https://aiotechs.cloud/genctek`.

## Sunucudaki yerleşim

| | Değer |
|---|---|
| Dizin | `/opt/genctekportal` |
| Servis | `genctekportal.service` (kullanıcı: `genctekportal`) |
| Port | **3011**, yalnızca `127.0.0.1` |
| Node | `/opt/node24/bin/node` (sistem Node'u 16, dokunulmaz) |
| Veritabanı | PostgreSQL · `genctekportal` |
| Ters vekil | Apache · `/usr/local/directadmin/data/users/admin/domains/aiotechs.cloud.cust_httpd` |
| Alt dizin | `NEXT_PUBLIC_BASE_PATH="/genctekportal"` |

Apache blokunda **sıra önemlidir**: `/genctekportal` bloğu `/genctek`
bloğunun ÜSTÜNDE durmalı, yoksa uzun yol kısa olanın içinde eşleşir.

### Çıplak `/genctekportal` eğik çizgili hâline yönlendirilir

Next, basePath çıplak hâldeyken iç yolu **boş** bırakıyor ve ara katmanı hiç
çağırmıyor (ara katman günlüğüyle doğrulandı: `/genctekportal/haberler` için
`pathname="/haberler"` geliyor, çıplak yol için proxy hiç çalışmıyor). Sonuç,
ana sayfanın CSP, HSTS ve çerçeveleme koruması olmadan servis edilmesiydi.
Uygulama tarafında çözülmüyor — `"/"`, `"/:path*"` matcher'ları ve
`next.config` başlıkları denendi, üçü de tutmadı.

Çözüm iki parçalı ve **ikisi birlikte** olmalı:

1. `next.config.ts` · `skipTrailingSlashRedirect: true` — yoksa Next eğik
   çizgiyi 308 ile geri atar ve Apache ile sonsuz döngü oluşur.
2. Apache · çıplak yol yönlendirilir, çıplak `ProxyPass` satırı **kaldırılır**
   (dururken adresi kapıyor ve yönlendirme hiç ateşlenmiyor):

```apache
RedirectMatch 301 ^/genctekportal$ /genctekportal/
ProxyPass /genctekportal/ http://127.0.0.1:3011/genctekportal/
ProxyPassReverse /genctekportal/ http://127.0.0.1:3011/genctekportal/
```

Aynı kalıp `/merveapartmani` için de kullanılıyor. Yalnızca ana sayfa bir
301 alır; alt sayfaların adresi değişmez. **Yayın sırası:** önce uygulama
(ayarı taşıyan sürüm), sonra Apache.

### Apache düzenlemesi tek başına ETKİSİZDİR

`cust_httpd` yalnızca **kaynak** dosyadır. DirectAdmin onu
`/usr/local/directadmin/data/users/admin/httpd.conf` içine birleştirir ve
Apache o üretilmiş dosyayı okur. Kaynağı düzenleyip `apachectl graceful`
demek hiçbir şey değiştirmez — değişiklik sessizce ölü kalır:

```bash
# cust_httpd düzenlendikten SONRA, her seferinde:
echo "action=rewrite&value=httpd" >> /usr/local/directadmin/data/task.queue
/usr/local/directadmin/dataskq d
apachectl configtest && apachectl graceful
```

## Yayın akışı

Depo 20 Ağustos 2026'da kuruldu; öncesinde kod sunucuya elle aktarılıyordu.

```
Yerel makine ──git push──▶ github.com/serhatkagans/genctekportal
                                      │ git fetch + checkout
                                      ▼
                            /opt/genctekportal → derle → servisi yeniden başlat
```

Sunucuda, `root` olarak:

```bash
cd /opt/genctekportal
git fetch origin --tags --force
git checkout -f -B main origin/main      # ya da bir etiket: git checkout -f v1.0.0
chown -R genctekportal:genctekportal /opt/genctekportal
sudo -u genctekportal env PATH=/opt/node24/bin:$PATH npm ci --no-audit --no-fund
sudo -u genctekportal env PATH=/opt/node24/bin:$PATH npx prisma generate
sudo -u genctekportal env PATH=/opt/node24/bin:$PATH npx prisma migrate deploy
sudo -u genctekportal env PATH=/opt/node24/bin:$PATH npm run build
systemctl restart genctekportal
```

`npm ci`'den sonra **`prisma generate` şart**: `npm ci` node_modules'ü baştan
kurduğu için üretilmiş istemci siliniyor ve derleme
`import type { RoleCode } from "@prisma/client"` satırında düşüyor.

## Panel parolası unutulursa

"Parolamı unuttum" akışı **çalışmıyor**: `/parola-sifirla` sayfasının arkasında
bir uç yok ve `SMTP_URL` boş (YAPILACAKLAR.md §3). Sayfa bunu artık açıkça
söylüyor ve yöneticiye yönlendiriyor.

Parolayı sunucuda değiştirmek (`root` olarak):

```bash
cd /opt/genctekportal
sudo -u genctekportal env PATH=/opt/node24/bin:$PATH   PAROLA='en az 12 karakter' npm run parola -- yonetici@ornek.gov.tr
```

`PAROLA` verilmezse rastgele üretilir ve **bir kez** ekrana yazılır. Parola
argüman olarak geçilmiyor: argümanlar `ps` çıktısında ve kabuk geçmişinde
görünür.

Betik tek satıra dokunur — `npm run db:seed` ile karıştırmayın, o il/faaliyet/
katılımcı verisi de tohumlar ve **canlıda çalıştırılmaz**. Parola değişince
hesabın açık oturumları iptal edilir (oturum doğrulaması parolaya değil
`revokedAt`'e bakar) ve denetim kaydına `PAROLA_DEGISTIRILDI` satırı düşer.
Hesap yoksa yenisi AÇILMAZ; yeni hesap panelden açılır.

## KVKK saklama temizliği (günlük görev)

Saklama süresi (`retentionUntil`) dolan başvurular otomatik silinmiyor;
`scripts/kvkk-temizlik.mjs` bunu yapar. Başvuru kaydını, notlarını, ek
kayıtlarını, eklerin `Media` satırlarını ve `veri/basvuru-ekleri/<id>`
klasörünü siler; denetim günlüğüne `KVKK_SAKLAMA_SILME` satırı bırakır.

Bayraksız çağrı **hiçbir şey silmez**, yalnızca ne silineceğini yazar:

```bash
sudo -u genctekportal env PATH=/opt/node24/bin:$PATH npm run kvkk:temizle
```

Sunucuda günlük çalışması için iki dosya (`root` olarak):

```ini
# /etc/systemd/system/genctekportal-kvkk.service
[Unit]
Description=Genctek portal KVKK saklama temizligi
After=network.target

[Service]
Type=oneshot
User=genctekportal
WorkingDirectory=/opt/genctekportal
Environment=PATH=/opt/node24/bin:/usr/bin:/bin
ExecStart=/opt/node24/bin/node scripts/kvkk-temizlik.mjs --uygula
```

```ini
# /etc/systemd/system/genctekportal-kvkk.timer
[Unit]
Description=Genctek portal KVKK temizligini her gun calistir

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
systemctl daemon-reload
systemctl enable --now genctekportal-kvkk.timer
systemctl list-timers genctekportal-kvkk.timer   # sıradaki çalışma
journalctl -u genctekportal-kvkk.service         # ne silindiği
```

`Persistent=true` önemli: sunucu 03:30'da kapalıysa görev açılışta telafi
edilir, yoksa süresi dolmuş kayıt bir gün fazladan durur.

## Sürümler

Yayımlanan her durum `vBÜYÜK.KÜÇÜK.YAMA` biçiminde etiketlenir ve ne
getirdiği `SURUMLER.md`'ye yazılır. Numaranın hangi bölümünün ne zaman
arttığı o dosyanın başındadır. İlk etiket **v1.0.0**, 28 Ağustos 2026: yeni
bir işin değil, o gün canlıda duran sitenin başlangıç noktası.

Yerelde sürüm kesmek:

```bash
# 1. Değişiklikler commit'lendikten sonra SURUMLER.md · "Yayımlanmamış"
#    başlığının altına ne değiştiği yazılır.
npm run surum yama      # ya da: kucuk / buyuk / 1.4.2
git push --follow-tags
```

Betik numarayı `package.json` ve `package-lock.json`'da yükseltir, notu
tarihiyle sürüme çevirir, tek commit atar ve etiketi oluşturur. **İtmez** —
yayına alma ayrı bir karardır. Kirli ağaçta ya da not yazılmamışsa çalışmaz:
etiket, içinde ne olduğu yazılı olmayan bir işarete dönüşmesin.

Sunucuda hangi sürümün çalıştığı:

```bash
git -C /opt/genctekportal describe --tags
```

Çıktı `v1.0.0` ise sunucu tam o etikette; `v1.0.0-3-g5bcd468` ise etiketten
üç commit ileride, yani etiketsiz bir `main` üzerinde. İkisi de olağan —
biri yayımlanmış sürüm, diğeri henüz sürüme bağlanmamış bir yama.

Geri almak, etiket varken `git checkout -f v1.0.0` ile aynı derleme
adımlarını tekrarlamaktır. Veritabanı göçleri geri alınmaz: `prisma migrate
deploy` ileri yönlüdür, eski koda dönmek şemayı geri döndürmez.

## İçerik dosyaları depoda değil

`data/*.json` (haberler, koordinatörler, yönlendirmeler) **yönetim
panelinden yazılıyor**, yani canlı içeriğin tek sahibi sunucudur. Bu yüzden
21 Ağustos 2026'da `.gitignore`'a alındılar.

Öncesinde depoda izleniyorlardı ve bu sessiz bir veri kaybı kapısıydı:
dağıtımdaki `git checkout -f`, panelden yapılmış her düzenlemeyi depodaki
eski anlık görüntüye geri alırdı. Kayıp yaşanmadan fark edildi.

Depoda yalnızca **başlangıç kopyaları** duruyor:

```
data-ornek/haberler.json
data-ornek/koordinatorler.json
data-ornek/temalar.json
```

Yeni bir makinede kurulum betiği (`baslat.bat`) `node scripts/veri-hazirla.mjs`
çağırır; bu betik yalnızca **eksik** dosyaları örnekten oluşturur, var olana
dokunmaz.

**Temalar artık dosyada değil.** 21 Ağustos 2026'da `"Theme"` tablosuna
taşındılar; `data/temalar.json` yalnızca göçün kaynağı olarak duruyor.
Tabloyu boş bulan yeni bir kurulumda bir kereliğine:

```bash
npm run goc:temalar
```

Betik tablo doluysa hiçbir şey yapmaz — ikinci çalıştırma panelden yapılan
düzenlemeleri dosyadaki eski hâle döndürürdü.

**Hakkında sayfaları da tabloda.** 4 Eylül 2026'da kartlar ve üç sayfanın
gövdesi kodun içinden `"Page"` tablosuna (`section = 'hakkinda'`) taşındı.
Göçün kaynağı `data-ornek/hakkinda.json`; migration uygulandıktan sonra bir
kereliğine:

```bash
npm run goc:hakkinda
```

**Bu adım atlanırsa ana sayfadaki kart ızgarası ve üst menüdeki "Hakkında"
listesi boş çıkar** — kartların tek kaynağı artık tablo.

**Zirveler de tabloda.** Aynı gün iki GençTek Zirvesi'nin içeriği de `"Page"`
tablosuna (`section = 'zirve'`) taşındı. Kaynak `data-ornek/zirveler.json`;
bir kereliğine:

```bash
npm run goc:zirveler
```

Atlanırsa `/zirve` ve `/2-genctek-zirvesi-2026` 404 döner ve üst menüdeki
"GençTek Zirvesi" listesi boş kalır.

**Yardımlaşma grupları da tabloda.** Çalışma Grupları sayfasının altındaki dört
kart `"Page"` tablosuna (`section = 'yardimlasma'`) taşındı. Kaynak
`data-ornek/yardimlasma.json`; bir kereliğine:

```bash
npm run goc:yardimlasma
```

Atlanırsa `/temalar` sayfasının alt bölümü boş kalır.

**Temel etkinlik programları da tabloda.** On dokuz program `"Page"` tablosuna
(`section = 'temel-etkinlik'` ve `'grup-etkinligi'`) taşındı. Kaynak
`data-ornek/temel-etkinlikler.json`; bir kereliğine:

```bash
npm run goc:etkinlikler
```

Atlanırsa `/hakkinda/temel-etkinlikler` sayfası boş kalır ve program
sayfaları 404 döner.

Göç betiklerinin hepsi aynı kuralla çalışır: bölümde kayıt varsa hiçbir şey yapmaz,
yani ikinci kez çalıştırmak zararsızdır.

Sunucuda `data/` klasörü artık `git checkout -f`'ten etkilenmez — tıpkı
aşağıdaki medya klasörleri gibi. Yedeklemek isteyen:

```bash
rsync -az genctek:/opt/genctekportal/data ./data-yedek/
```

## Medya depoda değil

`public/wordpress` (~805 MB), `public/temalar` (~175 MB) ve `public/video`
(~200 MB, zirve tanıtım videosu) `.gitignore`'da.
WordPress'ten aktarılan bu dosyalar sunucuda duruyor ve dağıtım onlara
dokunmuyor — `git checkout -f` yalnızca izlenen dosyaları değiştirir.

Depoyu başka bir makineye klonlayan kişi bu klasörleri sunucudan ayrıca
kopyalamalıdır:

```bash
rsync -az genctek:/opt/genctekportal/public/wordpress public/
rsync -az genctek:/opt/genctekportal/public/temalar   public/
rsync -az genctek:/opt/genctekportal/public/video     public/
```

## Platform bağlantısı

Ana sayfadaki ve `/etkinlikler` sayfasındaki etkinlikler portalda **tutulmaz**;
platformun herkese açık ucundan okunur:

```
GENCTEK_APP_URL="https://aiotechs.cloud/genctek"
```

Bu değişken `/opt/genctekportal/.env` içinde. Boş bırakılırsa portal çökmez,
etkinlik bölümü boş durumunu basar (bkz. `lib/genctek-etkinlik.ts`).

Kartların "başvur" bağlantısı platformun GİRİŞ ekranına, `?nereye=` ile gider:
ziyaretçi girişten sonra tıkladığı etkinlikte açılır. Yol öneksizdir
(`/panel/etkinlikler/12`) — öneki hem `GENCTEK_APP_URL` hem de platformun kendi
`redirect()`'i ekler.

## Alt dizin kurulumunun tuzağı: görseller

`next/image` yalnızca etiketin `src`'sine basePath ekler, optimizasyon ucunun
`url=` parametresine **dokunmaz**. Bu yüzden bileşene verilen yol
`gorselYolu()`'ndan geçmelidir. Geçmezse yerelde (basePath boş) sorun görünmez,
canlıda optimizasyon 400 döner: *"The requested resource isn't a valid image"*.
