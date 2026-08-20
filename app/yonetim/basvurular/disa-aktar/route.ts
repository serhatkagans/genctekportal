import { NextResponse } from "next/server";
import { basvurulariOku, cevaplariCoz, DURUM_ETIKETLERI } from "@/lib/forms/basvuru";
import { rowsToCsv } from "@/lib/forms/csv";
import { erisimLogla } from "@/lib/yetki/log";
import { basvuruYetkisi } from "../actions";

export const dynamic = "force-dynamic";

export async function GET() {
  // Dışa aktarma tüm kişisel veriyi açık hâliyle dışarı çıkarır; yazma yetkisi şart.
  const { kullanici, yazabilir } = await basvuruYetkisi();
  if (!yazabilir) return NextResponse.json({ hata: "Yetkisiz." }, { status: 403 });

  const sonuc = await basvurulariOku();
  if (!sonuc.bagli) return NextResponse.json({ hata: sonuc.hata }, { status: 503 });

  const satirlar = sonuc.basvurular.map((b) => {
    const c = cevaplariCoz(b.answers);
    return {
      Referans: b.reference,
      Durum: DURUM_ETIKETLERI[b.status] ?? b.status,
      "Gönderim tarihi": b.submittedAt.toISOString(),
      "Başvuran türü": c.applicantType === "STUDENT" ? "Öğrenci" : "Danışman öğretmen",
      "Ad soyad": c.applicantType === "STUDENT" ? c.studentName : c.teacherName,
      Telefon: c.applicantType === "STUDENT" ? c.studentPhone : c.teacherPhone,
      "E-posta": c.applicantType === "STUDENT" ? c.studentEmail : c.teacherEmail,
      "Okul / kurum": c.institution,
      İl: b.provinceName ?? c.province,
      İlçe: c.district,
      "Çalışma açıklaması": c.workDescription,
      Notlar: c.notes,
      "Rıza sürümü": b.consentVersion,
      "Saklama bitişi": b.retentionUntil.toISOString().slice(0, 10),
    };
  });

  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "BASVURU_DISA_AKTARMA",
    hedefTip: "BASVURU",
    hedefId: "toplu",
    detay: `${satirlar.length} başvuru CSV olarak indirildi`,
  });

  const dosyaAdi = `basvurular-${new Date().toISOString().slice(0, 10)}.csv`;
  // BOM: Excel'in UTF-8'i doğru okuması için gerekli, yoksa Türkçe harfler bozuluyor.
  return new NextResponse("﻿" + rowsToCsv(satirlar), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dosyaAdi}"`,
      "Cache-Control": "no-store",
    },
  });
}
