import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";

export default function Page() {
  return (
    <AdminShell title="Genel ayarlar">
      <BagliDegil
        baslik="Ayarlar henüz bağlı değil"
        aciklama="Form alanları doluydu ama Kaydet hiçbir şey yapmıyordu. Site adı, iletişim ve SEO ayarları şu an koddan geliyor: app/layout.tsx içindeki metadata."
        model="GlobalSetting"
        gereken={["Postgres bağlantısı ve migration", "Ayarların metadata üretimine bağlanması", "Değişikliklerin denetim kaydına yazılması"]}
      />
    </AdminShell>
  );
}
