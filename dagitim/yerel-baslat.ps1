# Portalı yerelde (Windows) başlatır.
#
# baslat.bat bunu çağırır. Mantık .bat içinde değil burada duruyor: cmd'nin
# tırnak/kaçış kuralları çok satırlı PowerShell komutlarını sessizce bozuyor.
# (Aynı desen platform deposunda da var.)

# "Stop" KULLANILMIYOR: PowerShell 5.1'de yerel komutların (npm, node) stderr'e
# yazdığı normal bilgi satırları da hata sayılıp betiği düşürüyor. Hatalar
# açıkça kontrol ediliyor: port dinleniyor mu, sayfa 200 mü.
$ErrorActionPreference = "Continue"

$proje = Split-Path -Parent $PSScriptRoot
Set-Location $proje

$PORT = 3010

# Platformun yerel portu. Portal ETKİNLİKLERİ ORADAN OKUR (bkz.
# lib/genctek-etkinlik.ts); kapalıysa portal yine açılır, yalnızca etkinlik
# bölümü boş durumunu basar. Bu yüzden burada durdurucu bir kontrol değil,
# uyarı var.
$PLATFORM_PORT = 3000

function Dinliyor-Mu([int]$port) {
    $null -ne (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

Write-Host ""
Write-Host "  GencTek Portal baslatiliyor" -ForegroundColor Cyan
Write-Host "  Klasor: $proje"
Write-Host ""

# --- 1. Icerik dosyalari ---------------------------------------------------
#
# data/*.json depoda izlenmiyor (bkz. .gitignore): canli icerigin tek sahibi
# sunucu. Yeni klonlanmis bir makinede klasor bos olur ve site icerigi
# gorunmez; asagidaki betik eksik dosyalari data-ornek/ altindaki baslangic
# kopyalarindan doldurur. VAR OLAN DOSYAYA DOKUNMAZ.
Write-Host "  [1/3] Icerik dosyalari kontrol ediliyor..."
node scripts/veri-hazirla.mjs

# --- 2. Veritabani ---------------------------------------------------------
#
# PORT DINLENIYOR OLMASI YETMEZ (21 Agustos 2026).
#
# Veritabani, "prisma dev" ile acilan yerel bir Postgres sunucusu (.env icindeki
# DATABASE_URL oraya bakar). Bu sunucu yari olu kalabiliyor: portu dinlemeye
# devam ediyor ama gelen her baglantiyi sifirliyor. O halde /yonetim, oturum
# sorgusunda "read ECONNRESET" ile 500 donuyor ve giris ekrani doner durur.
# Bu yuzden kontrol gercek bir sorguyla yapiliyor: scripts/veritabani-hazir.mjs.
$DB_ADI = "portal"

function Veritabani-Hazir-Mi {
    node scripts/veritabani-hazir.mjs *>$null
    return ($LASTEXITCODE -eq 0)
}

Write-Host "  [2/3] Veritabani kontrol ediliyor..."
if (Veritabani-Hazir-Mi) {
    Write-Host "        hazir." -ForegroundColor Green
} else {
    Write-Host "        yanit vermiyor; yeniden baslatiliyor..." -ForegroundColor Yellow
    npx prisma dev stop $DB_ADI *>$null

    # Durdurma yarim kalirsa kilit klasoru geride kaliyor ve yeni sunucu
    # "Lock file is already being held" diyerek hic acilmiyor. Sunucu durdurulmus
    # oldugu icin kilidi silmek guvenli.
    $kilit = Join-Path $env:LOCALAPPDATA "prisma-dev-nodejs\Data\$DB_ADI\.lock"
    if (Test-Path $kilit) { Remove-Item -Recurse -Force $kilit -ErrorAction SilentlyContinue }

    $cikti = npx prisma dev --name $DB_ADI --detach 2>$null
    $adres = ($cikti | Select-String -Pattern "^postgres://" | Select-Object -First 1)

    # Port her acilista ayni kalmayabilir; degistiyse .env guncellenmezse
    # uygulama eski porta baglanmaya calisir.
    if ($adres) {
        $yeni = $adres.ToString().Trim()
        $envYolu = Join-Path $proje ".env"
        $satirlar = Get-Content $envYolu
        $mevcut = ($satirlar | Where-Object { $_ -match "^DATABASE_URL=" }) -replace "^DATABASE_URL=", "" -replace '"', ""
        if ($mevcut -ne $yeni) {
            Write-Host "        port degisti, .env guncelleniyor." -ForegroundColor Yellow
            ($satirlar | ForEach-Object {
                if ($_ -match "^DATABASE_URL=") { "DATABASE_URL=`"$yeni`"" } else { $_ }
            }) | Set-Content $envYolu -Encoding utf8
        }
    }

    if (Veritabani-Hazir-Mi) {
        Write-Host "        hazir." -ForegroundColor Green
    } else {
        Write-Host "        VERITABANI ACILAMADI." -ForegroundColor Red
        Write-Host "        Portal acilir ama /giris ve /yonetim calismaz."
        Write-Host "        Elle deneyin: npx prisma dev --name $DB_ADI --detach"
    }
}

Write-Host ""

# --- 3. Uygulama -----------------------------------------------------------
#
# WEBPACK BAYRAĞI ŞART, keyfi değil (20 Ağustos 2026).
#
# Depodaki Next 16.2.12'de Turbopack bu projede her istekte panikliyor:
# "FATAL: Failed to write app endpoint /page — Next.js package not found".
# Sayfanın HTML'i sunucudan geliyor (curl 200 görür) ama tarayıcının ihtiyaç
# duyduğu JS paketi hiç üretilemiyor; sonuç, kullanıcının gördüğü sonsuz
# yenilenme döngüsü. `--webpack` ile panik yok.
#
# Next sürümü yükseltilip Turbopack düzeldiğinde bu bayrak kaldırılabilir;
# yan projedeki (platform) 16.3.1 sürümünde sorun görülmüyor.
#
# Pencere AÇIK KALMALI; kapatılırsa uygulama durur.
if (Dinliyor-Mu $PORT) {
    Write-Host "  [3/3] Portal zaten calisiyor (port $PORT)."
} else {
    Write-Host "  [3/3] Portal baslatiliyor (webpack)..."
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/k", "npm run dev -- --webpack" `
        -WorkingDirectory $proje

    $bitis = (Get-Date).AddSeconds(90)
    while (-not (Dinliyor-Mu $PORT) -and (Get-Date) -lt $bitis) {
        Start-Sleep -Seconds 2
    }
    if (Dinliyor-Mu $PORT) {
        Write-Host "        hazir." -ForegroundColor Green
    } else {
        Write-Host "        ACILAMADI. Acilan siyah penceredeki hataya bakin." -ForegroundColor Red
    }
}

# --- 4. Gerçekten yanıt veriyor mu -----------------------------------------
# Port dinleniyor olması yetmez: derleme hatası varsa sayfa 500 döner.
$saglikli = $false
try {
    $yanit = Invoke-WebRequest -Uri "http://localhost:$PORT/" -UseBasicParsing -TimeoutSec 40
    $saglikli = ($yanit.StatusCode -eq 200)
} catch {
    $saglikli = $false
}

# --- 5. Platform bağlantısı -------------------------------------------------
if (-not (Dinliyor-Mu $PLATFORM_PORT)) {
    Write-Host ""
    Write-Host "  Not: platform (port $PLATFORM_PORT) kapali." -ForegroundColor Yellow
    Write-Host "  Portal acilir ama 'Takip edilebilecek etkinlikler' bolumu bos gorunur."
    Write-Host "  Platformu baslatmak icin yan klasordeki baslat.bat dosyasini calistirin."
}

Write-Host ""
if ($saglikli) {
    Write-Host "  Hazir: http://localhost:$PORT" -ForegroundColor Green
    Start-Process "http://localhost:$PORT"
} else {
    Write-Host "  Portal ayakta ama ana sayfa yanit vermiyor." -ForegroundColor Yellow
    Write-Host "  Acilan siyah penceredeki derleme hatasina bakin."
}

Write-Host ""
Write-Host "  Uygulama penceresi (npm run dev) KAPATILMAMALI." -ForegroundColor Yellow
Write-Host "  Durdurmak icin: durdur.bat"
Write-Host ""
