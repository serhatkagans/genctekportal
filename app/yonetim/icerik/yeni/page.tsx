import { AdminShell } from "@/components/admin-shell";
import { HaberEditoru } from "@/components/haber-editoru";

export default function YeniHaber() {
  return <AdminShell title="Yeni haber"><HaberEditoru /></AdminShell>;
}
