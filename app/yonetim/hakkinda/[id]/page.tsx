import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { HakkindaEditoru } from "@/components/hakkinda-editoru";
import { hakkindaSayfasiniIdIleBul } from "@/lib/hakkinda";

export const dynamic = "force-dynamic";

export default async function HakkindaDuzenle({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  const { id } = await params;
  const sayfa = await hakkindaSayfasiniIdIleBul(id);
  if (!sayfa) notFound();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title={sayfa.baslik}>
      <HakkindaEditoru sayfa={sayfa} kaydedildi={kaydedildi} />
    </AdminShell>
  );
}
