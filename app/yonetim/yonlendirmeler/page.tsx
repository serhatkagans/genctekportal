import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { yonlendirmeleriOku } from "@/lib/yonlendirme";
import { ekleAction, silAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const kayitlar = await yonlendirmeleriOku();

  return (
    <AdminShell title="Yönlendirmeler">
      <div className="info-banner">
        Eski WordPress adreslerini yeni rotalara yönlendir. Kural yalnızca <strong>o adreste içerik yoksa</strong>
        devreye girer, yani var olan bir sayfayı gölgeleyemez. Aynı kaynak yeniden eklenirse eskisinin üzerine yazılır.
      </div>

      <section className="admin-panel">
        <div className="panel-head"><div><h2>Yeni yönlendirme</h2><p>Kaynak ve hedef site içi yol veya tam adres olabilir.</p></div></div>
        <form action={ekleAction} className="koordinator-form">
          <label>Kaynak yol <span aria-hidden="true">*</span><input name="kaynak" required placeholder="/eski-haber-adresi" /></label>
          <label>Hedef <span aria-hidden="true">*</span><input name="hedef" required placeholder="/haberler/yeni-adres" /></label>
          <label>Tür<select name="kod" defaultValue="301"><option value="301">301 · Kalıcı</option><option value="302">302 · Geçici</option></select></label>
          <button className="button button-primary" type="submit"><Icon name="plus" />Ekle</button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="panel-head"><div><h2>Tanımlı kurallar</h2><p>{kayitlar.length} yönlendirme</p></div></div>
        {kayitlar.length === 0 ? (
          <div className="empty-admin"><strong>Henüz yönlendirme yok.</strong><p>Yukarıdaki formdan ilk kuralı ekle.</p></div>
        ) : (
          <ul className="koordinator-listesi">
            {kayitlar.map((y) => (
              <li key={y.id}>
                <div className="yonlendirme-satir">
                  <code>{y.kaynak}</code>
                  <Icon name="arrow" />
                  <code>{y.hedef}</code>
                  <span className="status">{y.kod}</span>
                </div>
                <form action={silAction}>
                  <input type="hidden" name="id" value={y.id} />
                  <button className="koordinator-sil" type="submit" aria-label={`${y.kaynak} kuralını sil`}>Sil</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
