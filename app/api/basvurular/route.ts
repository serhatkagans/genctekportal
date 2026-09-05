import { NextRequest, NextResponse } from "next/server";
import { participationSchema } from "@/lib/validation/participation";
import { createReference } from "@/lib/security/tokens";
import { ipOzeti, istemciIp } from "@/lib/security/istemci-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { basvuruKaydet } from "@/lib/forms/basvuru";
import { istekKokeniGecerliMi } from "@/lib/security/koken";
import { dosyaImzasiUyuyorMu } from "@/lib/security/dosya-imzasi";
import { siteAdresi } from "@/lib/ortam";

export const runtime = "nodejs";
const ACCEPTED = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const EN_BUYUK_EK = 8 * 1024 * 1024;

export async function POST(request: NextRequest){
  /*
   * KÖKEN KONTROLÜ EN BAŞTA (3 Eylül 2026 · dış güvenlik incelemesi). Route
   * handler'lar Next'in sunucu eylemlerine uyguladığı CSRF kontrolünün dışında;
   * gerekçe ve bu kontrolün sınırı lib/security/koken.ts başlığında.
   *
   * Hız sınırından da ÖNCE: reddedilecek bir istek başkasının kotasını
   * yememeli.
   */
  if(!istekKokeniGecerliMi(request.headers, siteAdresi()).gecerliMi){
    return NextResponse.json({message:"İstek reddedildi."},{status:403});
  }

  /*
   * GÖVDE BOYUTU formData()'DAN ÖNCE. `formData()` çok parçalı gövdeyi belleğe
   * alıyor ve 8 MB kontrolü ondan SONRA çalışıyordu — yani sınır, belleğe
   * alınmayı hiç engellemiyordu. Uç kimlik istemiyor, dolayısıyla bunu herkes
   * tetikleyebilirdi; sunucuda GençTek'in üç kopyası da aynı belleği
   * paylaşıyor. Content-Length istemciden gelir ve yalanlanabilir; gerçek
   * kontrol aşağıda duruyor, bu yalnızca ucuz bir ön eleme.
   */
  const bildirilenBoyut = Number(request.headers.get("content-length") ?? 0);
  if(bildirilenBoyut > EN_BUYUK_EK * 2){
    return NextResponse.json({message:"Gönderilen dosya çok büyük."},{status:413});
  }

  const ip = istemciIp(request.headers) ?? "local";
  /* Anahtar `ipOzeti` ile üretiliyor, düz sha256 ile değil (5 Eylül 2026 ·
     güvenlik incelemesi): hız sınırı anahtarları "RateLimit" tablosunda
     SAKLANIYOR ve IPv4'ün 2^32 değerinin tümünün düz özeti dakikalar içinde
     çıkarılabilir — yani anahtar, pencere boyunca ziyaretçinin gerçek
     adresini geri veriyordu. Gerekçenin tamamı lib/security/istemci-ip.ts'te. */
  const limit = await checkRateLimit(`participation:${ipOzeti(ip)}`, {limit:5,windowMs:15*60_000});
  if(!limit.allowed) return NextResponse.json({message:"Çok fazla gönderim yapıldı. Lütfen daha sonra tekrar deneyin."},{status:429,headers:{"Retry-After":String(Math.ceil(limit.retryAfterMs/1000))}});
  const form = await request.formData();
  const raw = Object.fromEntries([...form.entries()].filter(([,value])=>typeof value==="string"));
  const parsed = participationSchema.safeParse(raw);
  if(!parsed.success){
    const errors = parsed.error.flatten();
    return NextResponse.json({message:"Formdaki alanları kontrol edin.",errors:errors.fieldErrors},{status:400});
  }
  if(Date.now()-parsed.data.startedAt<2500) return NextResponse.json({message:"Form çok hızlı gönderildi. Lütfen yeniden deneyin."},{status:400});
  const attachment=form.get("attachment");
  let ek: {ad:string;tur:string;boyut:number;icerik:Buffer}|undefined;
  if(attachment instanceof File && attachment.size>0){
    if(attachment.size>EN_BUYUK_EK) return NextResponse.json({message:"Dosya en fazla 8 MB olabilir.",errors:{attachment:["Dosya boyutu sınırı aşıldı."]}},{status:400});
    if(!ACCEPTED.has(attachment.type)) return NextResponse.json({message:"Yalnızca PDF, JPG, PNG veya WebP yükleyebilirsiniz.",errors:{attachment:["Dosya türü kabul edilmiyor."]}},{status:400});
    // İçerik bildirilen türle uyuşmalı: attachment.type istemcinin yazdığı bir
    // dizedir (bkz. lib/security/dosya-imzasi.ts). Baytlar bir kez okunuyor.
    const icerik=Buffer.from(await attachment.arrayBuffer());
    const imza=dosyaImzasiUyuyorMu(icerik,attachment.type);
    if(!imza.olurMu) return NextResponse.json({message:"Dosya içeriği türüyle uyuşmuyor.",errors:{attachment:[imza.neden??"Dosya doğrulanamadı."]}},{status:400});
    ek={ad:attachment.name,tur:attachment.type,boyut:attachment.size,icerik};
  }

  const reference=createReference();
  // Kayıt yazılamazsa başarılı yanıt dönmemeli: başvuran referans numarasıyla
  // ayrılıp kaydın kaybolduğunu asla öğrenemezdi.
  try{
    await basvuruKaydet({reference,cevaplar:parsed.data,ipOzeti:ipOzeti(ip),ek});
  }catch(hata){
    console.error("Başvuru kaydedilemedi:",hata);
    return NextResponse.json({message:"Başvurunuz şu anda kaydedilemedi. Lütfen daha sonra tekrar deneyin."},{status:503});
  }
  return NextResponse.json({reference,message:"Başvurunuz alındı."},{status:201});
}
