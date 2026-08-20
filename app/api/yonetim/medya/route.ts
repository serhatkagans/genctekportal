import { NextResponse } from "next/server";
import { gorselKaydet, medyaDosyalari } from "@/lib/medya";
import { yonetimErisimiVarMi } from "@/lib/yetki/yonetim-erisimi";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await yonetimErisimiVarMi()) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }
  const dosyalar = (await medyaDosyalari()).filter((d) => d.gorselMi);
  return NextResponse.json({ dosyalar });
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
