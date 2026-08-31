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
