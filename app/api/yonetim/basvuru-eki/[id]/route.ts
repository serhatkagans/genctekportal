import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ekDosyaYolu } from "@/lib/forms/basvuru";
import { erisimLogla } from "@/lib/yetki/log";
import { basvuruYetkisi } from "@/app/yonetim/basvurular/actions";

export const dynamic = "force-dynamic";

// Ekler public/ altında değil; buradan yalnızca yetkili kullanıcı indirebilir
// ve her indirme denetim kaydına yazılır.
export async function GET(_istek: Request, { params }: { params: Promise<{ id: string }> }) {
  const { yetkili, kullanici } = await basvuruYetkisi();
  if (!yetkili) return NextResponse.json({ hata: "Yetkisiz." }, { status: 403 });

  const { id } = await params;
  const [ek] = await sql<{ storageKey: string; originalName: string; mimeType: string; submissionId: string }[]>`
    SELECT m."storageKey", m."originalName", m."mimeType", a."submissionId"
    FROM "Media" m
    JOIN "SubmissionAttachment" a ON a."mediaId" = m.id
    WHERE m.id = ${id} LIMIT 1
  `;
  if (!ek) return NextResponse.json({ hata: "Ek bulunamadı." }, { status: 404 });

  const yol = ekDosyaYolu(ek.storageKey);
  if (!yol) return NextResponse.json({ hata: "Geçersiz dosya yolu." }, { status: 400 });

  let icerik: Buffer;
  try {
    icerik = await readFile(yol);
  } catch {
    return NextResponse.json({ hata: "Dosya diskte bulunamadı." }, { status: 404 });
  }

  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "BASVURU_EK_INDIRME",
    hedefTip: "BASVURU",
    hedefId: ek.submissionId,
    detay: `${ek.originalName} indirildi`,
  });

  return new NextResponse(new Uint8Array(icerik), {
    headers: {
      "Content-Type": ek.mimeType,
      // inline değil attachment: tarayıcıda çalıştırılmasın.
      "Content-Disposition": `attachment; filename="${encodeURIComponent(ek.originalName)}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
