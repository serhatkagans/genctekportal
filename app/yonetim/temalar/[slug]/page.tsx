import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { TemaEditoru } from "@/components/tema-editoru";
import { temaBul } from "@/lib/tema";

export const dynamic = "force-dynamic";

export default async function TemaDuzenle({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  const { slug } = await params;
  const tema = await temaBul(slug);
  if (!tema) notFound();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title={tema.name}>
      <TemaEditoru tema={tema} kaydedildi={kaydedildi} />
    </AdminShell>
  );
}
