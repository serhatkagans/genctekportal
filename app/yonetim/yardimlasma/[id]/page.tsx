import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { YardimlasmaEditoru } from "@/components/yardimlasma-editoru";
import { yardimlasmaGrubunuIdIleBul } from "@/lib/yardimlasma";

export const dynamic = "force-dynamic";

export default async function YardimlasmaDuzenle({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  const { id } = await params;
  const grup = await yardimlasmaGrubunuIdIleBul(id);
  if (!grup) notFound();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title={grup.ad}>
      <YardimlasmaEditoru grup={grup} kaydedildi={kaydedildi} />
    </AdminShell>
  );
}
