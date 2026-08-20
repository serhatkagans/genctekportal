import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { EtkinlikEditoru } from "@/components/etkinlik-editoru";
import { faaliyetBul, illeriOku, yonetimFaaliyetleri } from "@/lib/faaliyet/yonetim";

export const dynamic = "force-dynamic";

export default async function EtkinlikDuzenle({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  const { id } = await params;
  const [faaliyet, iller, liste] = await Promise.all([
    faaliyetBul(id),
    illeriOku(),
    yonetimFaaliyetleri(),
  ]);
  if (!faaliyet) notFound();

  const katilimciSayisi = liste.bagli
    ? liste.faaliyetler.find((f) => f.id === id)?.basvuran ?? 0
    : 0;
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title={faaliyet.title}>
      <EtkinlikEditoru
        faaliyet={faaliyet}
        iller={iller}
        kaydedildi={kaydedildi}
        katilimciSayisi={katilimciSayisi}
      />
    </AdminShell>
  );
}
