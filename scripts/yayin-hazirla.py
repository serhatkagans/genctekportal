"""
YAYIN HAZIRLAMA — PDF'i sayfa çevrilebilir okuyucu için görsellere böler
(23 Kasım 2026 · istek: "üst menüye flip page tarzı bir şey ... yayınlar olsun").

Kullanım (yerelde çalışır, sunucuda Python yok):

    python -I scripts/yayin-hazirla.py <pdf> <kisa-ad> <dil> --baslik "Yayının adı"

    python -I scripts/yayin-hazirla.py gorseller/aom_gbe.pdf genctek-ekosistemi tr --baslik "..."
    python -I scripts/yayin-hazirla.py "gorseller/GENCTEK Youth Tech Ecosystem (2).pdf" genctek-ekosistemi en --baslik "..."

Gereken: PyMuPDF (`pip install pymupdf`) ve Pillow.

ÇIKTI public/yayinlar/<kisa-ad>/ ALTINDA:
    yayin.json          — başlıklar, diller, sayfa ölçüleri ve sayfa metinleri
    <dil>/s001.webp ... — okuyucunun gösterdiği sayfalar (1400 px genişlik)
    <dil>/k001.webp ... — alttaki şeritte küçük önizlemeler
    <dil>/<kisa-ad>-<dil>.pdf — "PDF'i indir" bağlantısının hedefi

NEDEN TARAYICIDA PDF AÇILMIYOR: asıl dosya 19 MB. Her ziyaretçiye tamamını
indirtmek yerine yalnızca baktığı sayfa ve iki yanındakiler yükleniyor.

AYNI YAYININ İKİNCİ DİLİ eklenirken yayin.json'daki öbür dil korunur; aynı
dil yeniden hazırlanırsa yalnızca o dilin klasörü baştan yazılır.

public/yayinlar DEPODA DEĞİL (bkz. .gitignore): çıktı sunucuya scp ile gider
ve portal yeniden başlatılır — `next start` public/ listesini açılışta çıkarıyor.
"""

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

SAYFA_GENISLIGI = 1400
ONIZLEME_GENISLIGI = 220
KISA_AD = re.compile(r"^[a-z0-9][a-z0-9-]*$")
DILLER = {"tr", "en"}


def sayfayi_ciz(sayfa: "fitz.Page", genislik: int) -> Image.Image:
    olcek = genislik / sayfa.rect.width
    piksel = sayfa.get_pixmap(matrix=fitz.Matrix(olcek, olcek), alpha=False)
    return Image.frombytes("RGB", (piksel.width, piksel.height), piksel.samples)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", type=Path)
    ap.add_argument("kisa_ad")
    ap.add_argument("dil")
    ap.add_argument("--baslik", required=True)
    ap.add_argument("--kok", type=Path, default=Path(__file__).resolve().parent.parent)
    a = ap.parse_args()

    if not KISA_AD.match(a.kisa_ad):
        sys.exit("Kısa ad yalnızca küçük harf, rakam ve tire içerebilir (ör. genctek-ekosistemi).")
    if a.dil not in DILLER:
        sys.exit(f"Dil şunlardan biri olmalı: {', '.join(sorted(DILLER))}")

    yayin_klasoru = a.kok / "public" / "yayinlar" / a.kisa_ad
    dil_klasoru = yayin_klasoru / a.dil
    if dil_klasoru.exists():
        shutil.rmtree(dil_klasoru)
    dil_klasoru.mkdir(parents=True)

    belge = fitz.open(a.pdf)
    ilk = belge[0].rect
    metinler: list[str] = []
    for i, sayfa in enumerate(belge, start=1):
        gorsel = sayfayi_ciz(sayfa, SAYFA_GENISLIGI)
        gorsel.save(dil_klasoru / f"s{i:03}.webp", "WEBP", quality=82, method=6)
        kucuk = gorsel.resize(
            (ONIZLEME_GENISLIGI, round(gorsel.height * ONIZLEME_GENISLIGI / gorsel.width)),
            Image.LANCZOS,
        )
        kucuk.save(dil_klasoru / f"k{i:03}.webp", "WEBP", quality=70, method=6)
        metinler.append(re.sub(r"\s+", " ", sayfa.get_text()).strip())
        print(f"\r{a.dil}: {i}/{belge.page_count}", end="", flush=True)
    print()

    pdf_adi = f"{a.kisa_ad}-{a.dil}.pdf"
    shutil.copyfile(a.pdf, dil_klasoru / pdf_adi)

    manifest_yolu = yayin_klasoru / "yayin.json"
    manifest = json.loads(manifest_yolu.read_text("utf-8")) if manifest_yolu.exists() else {}
    manifest.setdefault("diller", {})[a.dil] = {
        "baslik": a.baslik,
        "sayfaSayisi": belge.page_count,
        # Oran için: okuyucu sayfayı bu en/boy oranıyla çizer.
        "genislik": round(ilk.width),
        "yukseklik": round(ilk.height),
        "pdf": pdf_adi,
        "metinler": metinler,
    }
    manifest_yolu.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), "utf-8")

    boyut = sum(f.stat().st_size for f in dil_klasoru.iterdir()) / 1e6
    print(f"Hazır: {dil_klasoru} ({boyut:.1f} MB, PDF dahil)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
