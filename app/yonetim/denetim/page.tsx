import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";

export default function Page() {
  return (
    <AdminShell title="Denetim kaydı">
      <BagliDegil
        baslik="Denetim kaydı henüz bağlı değil"
        aciklama="Değiştirilemez işlem kaydı için ekleme-dışı yazım kısıtı olan bir depo gerekiyor; dosya tabanlı depo bunu sağlayamaz."
        model="AuditLog"
        gereken={["Postgres bağlantısı ve migration", "Yalnızca ekleme yapılabilen tablo kısıtı", "Panel işlemlerinin kayda bağlanması"]}
      />
    </AdminShell>
  );
}
