import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";

export default function Page() {
  return (
    <AdminShell title="Kullanıcılar">
      <BagliDegil
        baslik="Kullanıcı yönetimi henüz bağlı değil"
        aciklama="Oturum ve rol altyapısı kodda hazır (lib/auth) ama veritabanı olmadan çalışamaz."
        model="User / UserRole / Invitation"
        gereken={["Postgres bağlantısı ve migration", "Davet ve parola sıfırlama akışı", "MFA zorunluluğu"]}
      />
    </AdminShell>
  );
}
