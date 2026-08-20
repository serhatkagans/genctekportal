# Portalın yerel süreçlerini durdurur.
#
# Pencereyi elle kapatmak yerine bunu kullanın: Next.js dev sunucusu kendini
# ayrı bir süreç olarak da çalıştırdığı için pencereyi kapatmak arkada takılı
# bir süreç bırakabiliyor ve bir sonraki başlatma "port zaten kullanımda"
# diyerek düşüyor.

$proje = Split-Path -Parent $PSScriptRoot
Set-Location $proje

$PORT = 3010

Write-Host ""

$idler = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

if ($idler) {
    foreach ($id in $idler) {
        $surec = Get-Process -Id $id -ErrorAction SilentlyContinue
        if ($surec) {
            Write-Host ("  Portal kapatiliyor: PID {0}" -f $id)
            Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host "  Portal zaten kapali."
}

Start-Sleep -Seconds 2

<#
VERİTABANINA DOKUNULMAZ. Portalın veritabanı "prisma dev" ile açılan, portal
kapandıktan sonra da ayakta kalan ayrı bir sunucu ("portal" adlı). Onu burada
durdurmak, aynı sunucuya bağlanan seed/migration betiklerini ve bir sonraki
başlatmayı gereksiz yere yavaşlatırdı; başlatma betiği zaten sunucunun sağlığını
kontrol edip gerekirse kendisi yeniden başlatıyor.
#>

$kalan = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue
Write-Host ""
if ($kalan) {
    Write-Host "  UYARI: port $PORT hala acik:" -ForegroundColor Red
    $kalan | ForEach-Object { Write-Host ("    PID {0}" -f $_.OwningProcess) }
} else {
    Write-Host "  Durduruldu." -ForegroundColor Green
}

Write-Host ""
Write-Host "  Yeniden baslatmak icin: baslat.bat"
Write-Host ""
