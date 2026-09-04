import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ZirveSayfasi } from "@/components/zirve-sayfasi";
import { zirveBul, zirveVeDigerleri } from "@/lib/zirve";

/**
 * PANELDEN AÇILAN ZİRVELERİN SAYFASI (4 Eylül 2026).
 *
 * İlk iki zirve kök dizinde kendi tarihsel adresinde duruyor ("/zirve",
 * "/2-genctek-zirvesi-2026"); yeni bir zirve eklendiğinde kök dizini her yıl
 * bir kısa adresle daha doldurmak yerine `/zirve/<slug>` kullanılıyor. Adres
 * yapısı böylece "zirveler burada" diyor ve eski bağlantılar da kırılmıyor.
 *
 * TARİHSEL ADRESLİ KAYITLAR BURADAN GÖSTERİLMEZ: `/zirve/zirve` gibi ikinci
 * bir adres aynı içeriği iki yerde yayımlar (arama motoru için çift kayıt).
 * Kaydın kendi yolu farklıysa oraya 308 ile gidiliyor.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const zirve = await zirveBul((await params).slug);
  return zirve ? { title: `${zirve.ad} (${zirve.yil}) · GençTek`, description: zirve.ozet } : {};
}

export default async function ZirveAltSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { zirve, digerleri } = await zirveVeDigerleri(slug);
  if (!zirve || !zirve.yayinda) notFound();
  if (zirve.yol !== `/zirve/${slug}`) redirect(zirve.yol);
  return <ZirveSayfasi zirve={zirve} digerleri={digerleri} />;
}
