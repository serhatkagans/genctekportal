import { AdminShell } from "@/components/admin-shell";
import { AltbilgiEditoru } from "@/components/altbilgi-editoru";
import { altbilgiyiOku } from "@/lib/altbilgi";
import { ayarlariOkuSessiz } from "@/lib/yonetim/ayar";

export const dynamic = "force-dynamic";

/**
 * ALT BİLGİ EKRANI (4 Eylül 2026 · istek: "footer için de ayar yap").
 *
 * Genel ayarlardan ayrı bir ekran: oradaki alanlar anahtar-değer metinler,
 * buradakiler ise sıralı listeler (marka sütunları, bağlantılar). İkisini tek
 * forma sıkıştırmak, "hangi alan nerede görünüyor" sorusunu bulanıklaştırırdı.
 */
export default async function AltbilgiEkrani({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  const altbilgi = await altbilgiyiOku();
  const ayarlar = await ayarlariOkuSessiz();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title="Alt bilgi">
      <AltbilgiEditoru altbilgi={altbilgi} eposta={ayarlar["iletisim.eposta"]} kaydedildi={kaydedildi} />
    </AdminShell>
  );
}
