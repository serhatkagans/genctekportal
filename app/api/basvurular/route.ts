import { NextRequest, NextResponse } from "next/server";
import { participationSchema } from "@/lib/validation/participation";
import { createReference, hashToken } from "@/lib/security/tokens";
import { ipOzeti, istemciIp } from "@/lib/security/istemci-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { basvuruKaydet } from "@/lib/forms/basvuru";

export const runtime = "nodejs";
const ACCEPTED = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest){
  const ip = istemciIp(request.headers) ?? "local";
  const limit = await checkRateLimit(`participation:${hashToken(ip)}`, {limit:5,windowMs:15*60_000});
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
    if(attachment.size>8*1024*1024) return NextResponse.json({message:"Dosya en fazla 8 MB olabilir.",errors:{attachment:["Dosya boyutu sınırı aşıldı."]}},{status:400});
    if(!ACCEPTED.has(attachment.type)) return NextResponse.json({message:"Yalnızca PDF, JPG, PNG veya WebP yükleyebilirsiniz.",errors:{attachment:["Dosya türü kabul edilmiyor."]}},{status:400});
    ek={ad:attachment.name,tur:attachment.type,boyut:attachment.size,icerik:Buffer.from(await attachment.arrayBuffer())};
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
