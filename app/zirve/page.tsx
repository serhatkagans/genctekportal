import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ZirveSayfasi } from "@/components/zirve-sayfasi";
import { zirveBul, zirveVeDigerleri } from "@/lib/zirve";

/*
 * 1. GENÇTEK ZİRVESİ (2025) — TARİHSEL ADRES.
 *
 * İçerik 4 Eylül 2026'da veritabanına taşındı ama adres kaldı: `/zirve` iki
 * yıldır paylaşılan bağlantı, arama motorunda kayıtlı ve üst menüde duruyor.
 * Kayıt tabloda `slug = "zirve"` ile yaşıyor; panelden açılan yeni zirveler
 * `/zirve/<slug>` altına düşüyor (bkz. app/zirve/[slug]).
 *
 * force-dynamic: panelden yapılan düzenleme kaydedilir kaydedilmez sitede
 * görünmeli — tema, haber ve Hakkında sayfalarındaki karar.
 */
export const dynamic = "force-dynamic";

const SLUG = "zirve";

export async function generateMetadata(): Promise<Metadata> {
  const zirve = await zirveBul(SLUG);
  return zirve ? { title: `${zirve.ad} (${zirve.yil}) · GençTek`, description: zirve.ozet } : {};
}

export default async function BirinciZirveSayfasi() {
  const { zirve, digerleri } = await zirveVeDigerleri(SLUG);
  if (!zirve || !zirve.yayinda) notFound();
  return <ZirveSayfasi zirve={zirve} digerleri={digerleri} />;
}
