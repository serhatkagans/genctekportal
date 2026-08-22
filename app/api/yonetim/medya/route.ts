import { NextResponse } from "next/server";
import { gorselKaydet, medyaSayfasi, type MedyaKaynagi } from "@/lib/medya";
import { yonetimErisimiVarMi } from "@/lib/yetki/yonetim-erisimi";

export const dynamic = "force-dynamic";

const SAYFA_ADEDI = 60;

export async function GET(istek: Request) {
  if (!await yonetimErisimiVarMi()) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const parametre = new URL(istek.url).searchParams;
  const istenen = parametre.get("kaynak");
  const kaynak: MedyaKaynagi | "hepsi" =
    istenen === "yuklenen" || istenen === "ice-aktarilan" ? istenen : "hepsi";
  const atla = Math.max(0, Number(parametre.get("atla")) || 0);

  const { dosyalar, toplam } = await medyaSayfasi({
    arama: parametre.get("arama") ?? "",
    kaynak,
    yalnizGorsel: true,
    atla,
    adet: SAYFA_ADEDI,
  });

  return NextResponse.json({ dosyalar, toplam, dahaVar: atla + dosyalar.length < toplam });
}

export async function POST(istek: Request) {
  if (!await yonetimErisimiVarMi()) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const form = await istek.formData();
  const dosya = form.get("dosya");
  if (!(dosya instanceof File)) {
    return NextResponse.json({ hata: "Dosya gönderilmedi." }, { status: 400 });
  }

  const sonuc = await gorselKaydet(dosya);
  if (!sonuc.tamam) {
    return NextResponse.json({ hata: sonuc.hata }, { status: 400 });
  }
  return NextResponse.json({ dosya: sonuc.dosya }, { status: 201 });
}
