import { AdminShell } from "@/components/admin-shell";
import { EtkinlikProgramiEditoru } from "@/components/etkinlik-programi-editoru";

export default function YeniEtkinlikProgrami() {
  return <AdminShell title="Yeni etkinlik programı"><EtkinlikProgramiEditoru /></AdminShell>;
}
