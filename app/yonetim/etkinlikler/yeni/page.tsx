import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";
import { EtkinlikEditoru } from "@/components/etkinlik-editoru";
import { illeriOku } from "@/lib/faaliyet/yonetim";

export const dynamic = "force-dynamic";

export default async function YeniEtkinlik() {
  const iller = await illeriOku();

  // İl listesi boşsa veritabanına ulaşılamıyor demektir; boş formu göstermek
  // kaydetme anında hata vermekten daha kötü olurdu.
  if (iller.length === 0) {
    return (
      <AdminShell title="Yeni etkinlik">
        <BagliDegil
          baslik="Veritabanına ulaşılamıyor"
          aciklama="Etkinlikler Postgres'e yazılıyor; bağlantı kurulamadığı için form açılmadı."
          model="Event"
          gereken={[
            "Postgres sunucusunun çalışıyor olması",
            ".env içindeki DATABASE_URL değerinin doğru olması",
            "npm run db:seed ile il listesinin yüklenmiş olması",
          ]}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Yeni etkinlik">
      <EtkinlikEditoru iller={iller} />
    </AdminShell>
  );
}
