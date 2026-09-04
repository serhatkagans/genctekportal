import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ZirveEditoru } from "@/components/zirve-editoru";
import { zirveyiIdIleBul } from "@/lib/zirve";

export const dynamic = "force-dynamic";

export default async function ZirveDuzenle({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  const { id } = await params;
  const zirve = await zirveyiIdIleBul(id);
  if (!zirve) notFound();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title={zirve.ad}>
      <ZirveEditoru zirve={zirve} kaydedildi={kaydedildi} />
    </AdminShell>
  );
}
