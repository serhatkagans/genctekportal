import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";
import { formAyarlari, katilimFormunuHazirla } from "@/lib/forms/basvuru";
import { basvuruYetkisi } from "@/app/yonetim/basvurular/actions";
import { formKaydetAction } from "./actions";

export const dynamic = "force-dynamic";

const DURUM_ETIKETLERI: Record<string, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
  CLOSED: "Kapalı",
  ARCHIVED: "Arşiv",
};

function tarihAlani(tarih: Date | null) {
  return tarih ? new Date(tarih).toISOString().slice(0, 16) : "";
}

export default async function Page({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  const { yetkili, yazabilir } = await basvuruYetkisi();
  if (!yetkili) {
    return (
      <AdminShell title="Formlar">
        <div className="empty-admin">
          <strong>Bu ekranı görme yetkiniz yok.</strong>
          <p>Form ayarları kişisel veri saklama süresini belirler; yalnızca yetkili roller görebilir.</p>
        </div>
      </AdminShell>
    );
  }

  let ayar = null;
  let hata = "";
  try {
    await katilimFormunuHazirla();
    ayar = await formAyarlari();
  } catch (e) {
    hata = e instanceof Error ? e.message : "Bilinmeyen veritabanı hatası.";
  }

  if (!ayar) {
    return (
      <AdminShell title="Formlar">
        <BagliDegil
          baslik="Veritabanına ulaşılamıyor"
          aciklama={`Form tanımı Postgres'te tutuluyor ama bağlantı kurulamadı: ${hata}`}
          model="FormDefinition / FormVersion"
          gereken={["Postgres sunucusunun çalışıyor olması", ".env içindeki DATABASE_URL değeri", "npx prisma migrate deploy"]}
        />
      </AdminShell>
    );
  }

  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell title="Formlar">
      {kaydedildi ? <div className="info-banner">Form ayarları kaydedildi.</div> : null}

      <div className="info-banner">
        Sitede tek form var: <strong>{ayar.name}</strong> — <code>/katilim</code> adresinde yayında ve{" "}
        <Link href="/yonetim/basvurular">{ayar.basvuruSayisi} başvuru</Link> aldı. Alanları{" "}
        <code>lib/validation/participation.ts</code> içinde tanımlı; buradan yayın durumu, açılış-kapanış
        tarihi, KVKK saklama süresi ve açık rıza metni yönetilir.
      </div>

      <form action={formKaydetAction} className="editor-layout">
        <section className="admin-panel editor-fields">
          <input type="hidden" name="formId" value={ayar.id} />
          <input type="hidden" name="versionId" value={ayar.versionId} />

          <label>
            Form adı
            <input name="name" defaultValue={ayar.name} required disabled={!yazabilir} />
          </label>

          <div className="form-row">
            <label>
              Açılış tarihi
              <input type="datetime-local" name="opensAt" defaultValue={tarihAlani(ayar.opensAt)} disabled={!yazabilir} />
            </label>
            <label>
              Kapanış tarihi
              <input type="datetime-local" name="closesAt" defaultValue={tarihAlani(ayar.closesAt)} disabled={!yazabilir} />
            </label>
          </div>

          <label>
            Saklama süresi (gün)
            <input type="number" name="retentionDays" min={30} max={3650} defaultValue={ayar.retentionDays} disabled={!yazabilir} />
            <small>
              Başvurular bu süre sonunda silinmelidir; her kayıt için hesaplanan bitiş tarihi başvuru
              detayında görünür. En az 30, en fazla 3650 gün.
            </small>
          </label>

          <div className="form-row">
            <label>
              Rıza metni sürümü
              <input name="consentVersion" defaultValue={ayar.consentVersion} disabled={!yazabilir} />
              <small>Metni değiştirdiğinde sürümü de artır; eski başvurular onayladıkları sürümle saklanır.</small>
            </label>
            <label>
              Yayın durumu
              <select name="status" defaultValue={ayar.status} disabled={!yazabilir}>
                {Object.entries(DURUM_ETIKETLERI).map(([deger, etiket]) => (
                  <option key={deger} value={deger}>{etiket}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Açık rıza metni
            <textarea name="consentText" rows={6} defaultValue={ayar.consentText} disabled={!yazabilir} />
          </label>
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Form</h2>
          <dl>
            <div><dt>Adres</dt><dd><code>/{ayar.slug}</code></dd></div>
            <div><dt>Sürüm</dt><dd>{ayar.version}</dd></div>
            <div><dt>Başvuru</dt><dd>{ayar.basvuruSayisi}</dd></div>
          </dl>
          {yazabilir ? <button className="button button-primary" type="submit">Ayarları kaydet</button> : null}
          <Link className="button button-secondary" href="/katilim" target="_blank">Formu sitede gör</Link>
          <Link href="/yonetim/basvurular">Başvurulara git</Link>
        </aside>
      </form>
    </AdminShell>
  );
}
