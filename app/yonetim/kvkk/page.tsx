import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { KvkkEditoru } from "@/components/kvkk-editoru";
import { kvkkMetniniOku } from "@/lib/sayfa-metni";

export const dynamic = "force-dynamic";

/**
 * KVKK EKRANI (5 Eylül 2026 · istek: "hepsini yap").
 *
 * Metin YEĞİTEK'ten geldi ve koda yazılıydı; bir hukuki metnin güncellenmesi
 * kod değişikliği ve dağıtım gerektiriyordu. Artık "Page" tablosunda tek bir
 * satırda (section = 'kvkk').
 *
 * SİSTEM GRUBUNDA, İÇERİKTE DEĞİL: bu bir tanıtım metni değil, kurumun yasal
 * beyanı — haber ya da tema düzenler gibi düzenlenmemeli.
 */
export default async function KvkkEkrani({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  const metin = await kvkkMetniniOku();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell
      title="KVKK metni"
      action={<Link className="button button-secondary" href="/kvkk" target="_blank">Sitede gör</Link>}
    >
      <KvkkEditoru metin={metin} kaydedildi={kaydedildi} />
    </AdminShell>
  );
}
