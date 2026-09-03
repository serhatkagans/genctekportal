import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { HaberListesi } from "@/components/haber-listesi";
import { Icon } from "@/components/icons";
import { haberleriOku } from "@/lib/haber";

export const dynamic = "force-dynamic";

export default async function ContentList({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  const haberler = await haberleriOku(true);
  const silindi = (await searchParams).silindi === "1";

  return (
    <AdminShell title="Haberler" action={<Link className="button button-primary" href="/yonetim/icerik/yeni"><Icon name="plus"/>Yeni haber</Link>}>
      {silindi ? <div className="info-banner">Haber silindi.</div> : null}
      <div className="info-banner">{haberler.length} haber kayıtlı. Düzenlemek için başlığa tıkla; değişiklik kaydedilir kaydedilmez sitede yayımlanır.</div>
      <HaberListesi haberler={haberler.map(h => ({ id: h.id, title: h.title, slug: h.slug, date: h.date, featuredImage: h.featuredImage }))} />
    </AdminShell>
  );
}
