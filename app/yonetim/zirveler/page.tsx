import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { gorselYolu } from "@/lib/ortam";
import { zirveleriOku } from "@/lib/zirve";
import { zirveTasiAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ZirveListesi({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  // Taslaklar da listeleniyor: hazırlanan ama henüz yayımlanmayan bir zirve
  // buradan başka hiçbir yerde görünmüyor.
  const zirveler = await zirveleriOku(true);
  const silindi = (await searchParams).silindi === "1";

  return (
    <AdminShell
      title="Zirveler"
      action={<Link className="button button-primary" href="/yonetim/zirveler/yeni"><Icon name="plus" />Yeni zirve</Link>}
    >
      {silindi ? <div className="info-banner">Zirve silindi.</div> : null}
      <div className="info-banner">
        {zirveler.length} zirve kayıtlı. Buradaki sıra üst menüdeki “GençTek Zirvesi” listesinin sırasıdır;
        en üstteki en güncel zirve olmalı. İlk iki zirve kendi tarihsel adresinde yayımlanıyor, yeni
        eklenenler <code>/zirve/&lt;adres&gt;</code> altına düşer.
      </div>

      <section className="admin-panel">
        <div className="resource-list">
          {zirveler.map((zirve, sira) => (
            <div className="haber-satiri hakkinda-satiri" key={zirve.id}>
              {zirve.gorseller[0]
                ? <img src={gorselYolu(zirve.gorseller[0].url)} alt="" loading="lazy" />
                : <span className="hakkinda-satir-simge hakkinda-bant-calendar" aria-hidden="true"><Icon name="calendar" /></span>}
              <Link href={`/yonetim/zirveler/${zirve.id}`}>
                <strong>{zirve.ad} ({zirve.yil})</strong>
                <span>{zirve.tarihYer}</span>
              </Link>
              <code className="hakkinda-satir-adres">{zirve.yol}</code>
              <span className={`status ${zirve.yayinda ? "status-published" : "status-draft"}`}>
                {zirve.yayinda ? "Yayında" : "Taslak"}
              </span>
              <span className="hakkinda-satir-tur">
                {zirve.bolumler.length} bölüm · {zirve.gorseller.length} kare{zirve.video ? " · video" : ""}
              </span>

              <div className="hakkinda-satir-araclar">
                <form action={zirveTasiAction}>
                  <input type="hidden" name="id" value={zirve.id} />
                  <input type="hidden" name="yon" value="yukari" />
                  <button type="submit" disabled={sira === 0} aria-label={`${zirve.ad} kaydını yukarı taşı`}>↑</button>
                </form>
                <form action={zirveTasiAction}>
                  <input type="hidden" name="id" value={zirve.id} />
                  <input type="hidden" name="yon" value="asagi" />
                  <button type="submit" disabled={sira === zirveler.length - 1} aria-label={`${zirve.ad} kaydını aşağı taşı`}>↓</button>
                </form>
              </div>
              <Link className="haber-duzenle" href={`/yonetim/zirveler/${zirve.id}`}>Düzenle →</Link>
            </div>
          ))}

          {zirveler.length === 0 ? (
            <div className="empty-admin">
              <strong>Kayıtlı zirve yok.</strong>
              <p>
                Zirveler veritabanından geliyor; tablo boşsa üst menüdeki liste de boş kalır.
                İlk kurulumda <code>npm run goc:zirveler</code> iki zirveyi yükler.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
