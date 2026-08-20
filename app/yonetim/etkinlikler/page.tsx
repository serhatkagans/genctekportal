import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";
import { Icon } from "@/components/icons";
import { DURUM_ETIKETLERI, yonetimFaaliyetleri } from "@/lib/faaliyet/yonetim";
import { tarihYaz } from "@/lib/tarih";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  const sonuc = await yonetimFaaliyetleri();
  const silindi = (await searchParams).silindi === "1";

  if (!sonuc.bagli) {
    return (
      <AdminShell title="Etkinlikler">
        <BagliDegil
          baslik="Veritabanına ulaşılamıyor"
          aciklama={`Etkinlikler Postgres'ten okunuyor ama bağlantı kurulamadı: ${sonuc.hata}`}
          model="Event"
          gereken={[
            "Postgres sunucusunun çalışıyor olması",
            ".env içindeki DATABASE_URL değerinin doğru olması",
            "npx prisma migrate deploy ile şemanın uygulanmış olması",
          ]}
        />
      </AdminShell>
    );
  }

  const { faaliyetler } = sonuc;
  const simdi = new Date();
  const yaklasan = faaliyetler.filter((f) => f.startsAt > simdi).length;
  const toplamSecilmis = faaliyetler.reduce((t, f) => t + f.secilmis, 0);

  return (
    <AdminShell
      title="Etkinlikler"
      action={<Link className="button button-primary" href="/yonetim/etkinlikler/yeni"><Icon name="plus" />Yeni etkinlik</Link>}
    >
      {silindi ? <div className="info-banner">Etkinlik silindi.</div> : null}
      <div className="info-banner">
        {faaliyetler.length} etkinlik kayıtlı. Düzenlemek için etkinlik adına tıkla. Katılım ve teşekkür
        belgeleri, etkinliğe <strong>seçilmiş</strong> katılımcılar üzerinden satırdaki “Belge” bağlantısından üretilir.
      </div>

      {faaliyetler.length === 0 ? (
        <div className="empty-admin">
          <strong>Kayıtlı etkinlik yok.</strong>
          <p>Yukarıdaki “Yeni etkinlik” düğmesiyle ilk kaydı oluştur ya da <code>npm run db:seed</code> ile örnek verileri yükle.</p>
        </div>
      ) : (
        <>
          <div className="admin-stats compact-stats">
            <article><span>Toplam etkinlik</span><strong>{faaliyetler.length}</strong></article>
            <article><span>Yaklaşan</span><strong>{yaklasan}</strong></article>
            <article><span>Seçilmiş katılımcı</span><strong>{toplamSecilmis}</strong></article>
            <article><span>İl sayısı</span><strong>{new Set(faaliyetler.map((f) => f.provinceName).filter(Boolean)).size}</strong></article>
          </div>

          <section className="admin-panel">
            <div className="resource-list">
              {faaliyetler.map((f) => (
                <article className="resource-row etkinlik-satiri" key={f.id}>
                  <span aria-hidden><Icon name="calendar" /></span>
                  <div>
                    <Link className="etkinlik-baslik" href={`/yonetim/etkinlikler/${f.id}`}>{f.title}</Link>
                    <span>
                      {f.eventType} · {f.provinceName ?? "Genel"}
                      {f.venue ? ` · ${f.venue}` : ""}
                    </span>
                  </div>
                  <span className={`status ${f.status === "PUBLISHED" ? "status-published" : ""}`}>
                    {DURUM_ETIKETLERI[f.status] ?? f.status}
                  </span>
                  <span>
                    {tarihYaz(f.startsAt)}
                    {" · "}
                    {f.secilmis}/{f.basvuran} katılımcı
                  </span>
                  <Link className="etkinlik-belge" href={`/panel/faaliyetler/${f.id}/belgeler`}>Belge</Link>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}
