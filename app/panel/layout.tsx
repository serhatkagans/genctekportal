import { AdminShell } from "@/components/admin-shell";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell title="Faaliyet belgeleri">{children}</AdminShell>;
}
