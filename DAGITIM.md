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
git fetch origin main && git checkout -f -B main origin/main
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

## İçerik dosyaları depoda değil

`data/*.json` (haberler, koordinatörler, temalar, yönlendirmeler) **yönetim
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

Sunucuda `data/` klasörü artık `git checkout -f`'ten etkilenmez — tıpkı
aşağıdaki medya klasörleri gibi. Yedeklemek isteyen:

```bash
rsync -az genctek:/opt/genctekportal/data ./data-yedek/
```

## Medya depoda değil

`public/wordpress` (~805 MB) ve `public/temalar` (~175 MB) `.gitignore`'da.
WordPress'ten aktarılan bu dosyalar sunucuda duruyor ve dağıtım onlara
dokunmuyor — `git checkout -f` yalnızca izlenen dosyaları değiştirir.

Depoyu başka bir makineye klonlayan kişi bu iki klasörü sunucudan ayrıca
kopyalamalıdır:

```bash
rsync -az genctek:/opt/genctekportal/public/wordpress public/
rsync -az genctek:/opt/genctekportal/public/temalar   public/
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
