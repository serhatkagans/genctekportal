import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { gorselYolu } from "@/lib/ortam";
import { temalariOku } from "@/lib/tema";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  const temalar = await temalariOku();
  const silindi = (await searchParams).silindi === "1";

  return (
    <AdminShell
      title="Temalar"
      action={<Link className="button button-primary" href="/yonetim/temalar/yeni"><Icon name="plus" />Yeni tema</Link>}
    >
      {silindi ? <div className="info-banner">Tema silindi.</div> : null}
      <div className="info-banner">
        {temalar.length} tema kayıtlı. Düzenlemek için tema adına tıkla; değişiklik kaydedilir kaydedilmez sitede yayımlanır.
        Sıralama bu listedeki sıradır — tema sayfalarındaki numaralandırma da buradan gelir.
      </div>
      <section className="admin-panel">
        <div className="resource-list">
          {temalar.map((t) => (
            <Link className="haber-satiri" href={`/yonetim/temalar/${t.slug}`} key={t.slug}>
              <img src={gorselYolu(t.image || "/Genc.png")} alt="" loading="lazy" />
              <div>
                <strong>{t.name}</strong>
                <span>{t.shortDescription}</span>
              </div>
              <time>{t.focus.length} odak · {t.outcomes.length} çıktı</time>
              <span className="haber-duzenle">Düzenle →</span>
            </Link>
          ))}
          {temalar.length === 0 ? (
            <div className="empty-admin">
              <strong>Kayıtlı tema yok.</strong>
              <p>Yukarıdaki “Yeni tema” düğmesiyle ilk temayı oluştur.</p>
            </div>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
