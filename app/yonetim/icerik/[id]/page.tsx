import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { HaberEditoru } from "@/components/haber-editoru";
import { haberBulId } from "@/lib/haber";

export const dynamic = "force-dynamic";

export default async function HaberDuzenle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  const haber = await haberBulId(Number((await params).id));
  if (!haber) notFound();
  const kaydedildi = (await searchParams).kaydedildi === "1";
  return <AdminShell title={haber.title}><HaberEditoru haber={haber} kaydedildi={kaydedildi} /></AdminShell>;
}
