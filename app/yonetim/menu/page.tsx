import { AdminShell } from "@/components/admin-shell";
import { MenuEditoru } from "@/components/menu-editoru";
import { menuyuOku } from "@/lib/menu";

export const dynamic = "force-dynamic";

/**
 * ÜST MENÜ EKRANI (4 Eylül 2026 · istek: "menülerin de ismi değişebilir
 * olabilir mi").
 *
 * Alt bilgi ekranının kardeşi: ikisi de sitenin her sayfasında görünen, sıralı
 * kısa listeler. Genel ayarlardan ayrı duruyorlar çünkü oradaki alanlar
 * anahtar-değer metinler.
 */
export default async function MenuEkrani({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  const menu = await menuyuOku();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title="Üst menü">
      <MenuEditoru menu={menu} kaydedildi={kaydedildi} />
    </AdminShell>
  );
}
