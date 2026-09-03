import { NextResponse } from "next/server";
import { gorselKaydet, medyaSayfasi, type MedyaKaynagi } from "@/lib/medya";
import { icerikYonetebilirMi, yonetimErisimiVarMi } from "@/lib/yetki/yonetim-erisimi";
import { siteAdresi } from "@/lib/ortam";
import { istekKokeniGecerliMi } from "@/lib/security/koken";
import { EN_BUYUK_BOYUT } from "@/lib/medya";

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
  /*
   * KÖKEN KONTROLÜ İLK SIRADA. Route handler'lar Next'in sunucu eylemlerine
   * uyguladığı CSRF kontrolünün dışında (gerekçe: lib/security/koken.ts) ve bu
   * uç yönetici oturumuyla yazma yapıyor.
   */
  const koken = istekKokeniGecerliMi(istek.headers, siteAdresi());
  if (!koken.gecerliMi) {
    return NextResponse.json({ hata: "İstek reddedildi." }, { status: 403 });
  }

  /*
   * ROL KONTROLÜ, YALNIZCA OTURUM DEĞİL (3 Eylül 2026 · dış güvenlik
   * incelemesi). Burada `yonetimErisimiVarMi` vardı; o yalnızca "geçerli
   * oturum var mı" diye sorar, yani salt-okuma rolleri de — AUDITOR'ün tek
   * yetkisi `audit.read` — medya yükleyebiliyordu. Yükleme bir İÇERİK yazma
   * işidir; kapısı da içerik kapısı olmalı.
   *
   * GET'te zayıf kapı bilerek duruyor: medya listesini görmek okuma işidir ve
   * denetçinin görebilmesi doğru.
   *
   * `yonetimErisimiVarMi` ÇAĞRISI KALDIRILDI, gevşetme değil: bu fonksiyon
   * zaten geçerli oturum şart koşuyor (oturum yoksa rol de yok). İki kapıyı
   * üst üste bırakmak, hangisinin karar verdiğini belirsizleştirirdi.
   */
  if (!await icerikYonetebilirMi()) {
    return NextResponse.json({ hata: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  /*
   * GÖVDE BOYUTU formData()'DAN ÖNCE. `formData()` çok parçalı gövdeyi
   * BELLEĞE alır; boyut kontrolü ondan sonra yapıldığında 8 MB sınırı,
   * belleğe alınmayı hiç engellemiyordu. Sunucuda GençTek'in üç kopyası ve bu
   * portal aynı belleği paylaşıyor, yani tek bir büyük gövde komşuları da
   * etkiler. Content-Length istemciden gelir ve YALANLANABİLİR — bu yüzden
   * gerçek kontrol aşağıda duruyor; buradaki yalnızca dürüst istemcinin
   * gövdesini erkenden kesen ucuz bir ön eleme.
   */
  const bildirilenBoyut = Number(istek.headers.get("content-length") ?? 0);
  if (bildirilenBoyut > EN_BUYUK_BOYUT * 2) {
    return NextResponse.json({ hata: "Dosya çok büyük." }, { status: 413 });
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
