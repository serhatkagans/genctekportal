import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ZirveSayfasi } from "@/components/zirve-sayfasi";
import { zirveBul, zirveVeDigerleri } from "@/lib/zirve";

/*
 * 2. GENÇTEK ZİRVESİ (2026) — TARİHSEL ADRES. Kayıt tabloda
 * `slug = "2-genctek-zirvesi-2026"`; gerekçesi için bkz. app/zirve/page.tsx.
 */
export const dynamic = "force-dynamic";

const SLUG = "2-genctek-zirvesi-2026";

export async function generateMetadata(): Promise<Metadata> {
  const zirve = await zirveBul(SLUG);
  return zirve ? { title: `${zirve.ad} (${zirve.yil}) · GençTek`, description: zirve.ozet } : {};
}

export default async function IkinciZirveSayfasi() {
  const { zirve, digerleri } = await zirveVeDigerleri(SLUG);
  if (!zirve || !zirve.yayinda) notFound();
  return <ZirveSayfasi zirve={zirve} digerleri={digerleri} />;
}
