import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { gorselYolu } from "@/lib/ortam";
import { yardimlasmaGruplariniOku } from "@/lib/yardimlasma";
import { yardimlasmaTasiAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function YardimlasmaListesi({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  const gruplar = await yardimlasmaGruplariniOku(true);
  const silindi = (await searchParams).silindi === "1";

  return (
    <AdminShell
      title="Yardımlaşma grupları"
      action={<Link className="button button-primary" href="/yonetim/yardimlasma/yeni"><Icon name="plus" />Yeni grup</Link>}
    >
      {silindi ? <div className="info-banner">Grup silindi.</div> : null}
      <div className="info-banner">
        {gruplar.length} grup kayıtlı. Bu kartlar <strong>Çalışma Grupları</strong> sayfasının altında,
        “Yardımlaşma Grupları” başlığı altında listeleniyor; buradaki sıra oradaki sıradır.
        Çalışma gruplarının kendisi ayrı bir ekranda (Temalar).
      </div>

      <section className="admin-panel">
        <div className="resource-list">
          {gruplar.map((grup, sira) => (
            <div className="haber-satiri hakkinda-satiri" key={grup.id}>
              {grup.gorsel
                ? <img src={gorselYolu(grup.gorsel)} alt="" loading="lazy" />
                : <span className="hakkinda-satir-simge hakkinda-bant-tag" aria-hidden="true"><Icon name="tag" /></span>}
              <Link href={`/yonetim/yardimlasma/${grup.id}`}>
                <strong>{String(sira + 1).padStart(2, "0")} · {grup.ad}</strong>
                <span>{grup.metin ? `${grup.metin.slice(0, 90)}…` : "Tanıtım metni yok"}</span>
              </Link>
              <code className="hakkinda-satir-adres">/yardimlasma/{grup.slug}</code>
              <span className={`status ${grup.yayinda ? "status-published" : "status-draft"}`}>
                {grup.yayinda ? "Yayında" : "Taslak"}
              </span>
              <span className="hakkinda-satir-tur">{grup.gorsel ? "görselli" : "görselsiz"}</span>

              <div className="hakkinda-satir-araclar">
                <form action={yardimlasmaTasiAction}>
                  <input type="hidden" name="id" value={grup.id} />
                  <input type="hidden" name="yon" value="yukari" />
                  <button type="submit" disabled={sira === 0} aria-label={`${grup.ad} kartını yukarı taşı`}>↑</button>
                </form>
                <form action={yardimlasmaTasiAction}>
                  <input type="hidden" name="id" value={grup.id} />
                  <input type="hidden" name="yon" value="asagi" />
                  <button type="submit" disabled={sira === gruplar.length - 1} aria-label={`${grup.ad} kartını aşağı taşı`}>↓</button>
                </form>
              </div>
              <Link className="haber-duzenle" href={`/yonetim/yardimlasma/${grup.id}`}>Düzenle →</Link>
            </div>
          ))}

          {gruplar.length === 0 ? (
            <div className="empty-admin">
              <strong>Kayıtlı yardımlaşma grubu yok.</strong>
              <p>
                Gruplar veritabanından geliyor; tablo boşsa Çalışma Grupları sayfasındaki alt bölüm de boş kalır.
                İlk kurulumda <code>npm run goc:yardimlasma</code> dört grubu yükler.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
