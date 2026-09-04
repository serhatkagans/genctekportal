import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { EtkinlikProgramiEditoru } from "@/components/etkinlik-programi-editoru";
import { etkinligiIdIleBul } from "@/lib/temel-etkinlik";

export const dynamic = "force-dynamic";

export default async function EtkinlikDuzenle({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  const { id } = await params;
  const etkinlik = await etkinligiIdIleBul(id);
  if (!etkinlik) notFound();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title={etkinlik.ad}>
      <EtkinlikProgramiEditoru etkinlik={etkinlik} kaydedildi={kaydedildi} />
    </AdminShell>
  );
}
