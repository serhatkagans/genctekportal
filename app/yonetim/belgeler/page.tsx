import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";

export default function Page() {
  return (
    <AdminShell title="Belgeler">
      <BagliDegil
        baslik="Belge kitaplığı henüz bağlı değil"
        aciklama="Belge üretimi ayrı bir ekranda çalışıyor; buradaki kitaplık listesi veriye bağlanmadı."
        model="Document"
        gereken={["Postgres bağlantısı ve migration", "Nesne depolama (OBJECT_STORAGE_*) bağlantısı", "Sürüm ve erişim izni yönetimi"]}
      />
    </AdminShell>
  );
}
