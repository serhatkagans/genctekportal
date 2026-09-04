import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { baglantiKartiMi, hakkindaSayfalariniOku, kartAdresi } from "@/lib/hakkinda";
import { hakkindaTasiAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function HakkindaListesi({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  // Taslaklar da listeleniyor: panelde hazırlanan ama henüz yayımlanmayan bir
  // sayfa buradan başka hiçbir yerde görünmüyor.
  const sayfalar = await hakkindaSayfalariniOku(true);
  const silindi = (await searchParams).silindi === "1";

  return (
    <AdminShell
      title="Hakkında sayfaları"
      action={<Link className="button button-primary" href="/yonetim/hakkinda/yeni"><Icon name="plus" />Yeni sayfa</Link>}
    >
      {silindi ? <div className="info-banner">Sayfa silindi.</div> : null}
      <div className="info-banner">
        {sayfalar.length} başlık kayıtlı. Buradaki sıra ana sayfadaki kart ızgarasının ve üst menüdeki
        “Hakkında” listesinin sırasıdır; kart numaraları (01, 02, …) da buradan gelir.
      </div>

      <section className="admin-panel">
        <div className="resource-list">
          {sayfalar.map((sayfa, sira) => (
            <div className="haber-satiri hakkinda-satiri" key={sayfa.id}>
              <span className={`hakkinda-satir-simge hakkinda-bant-${sayfa.ikon}`} aria-hidden="true">
                <Icon name={sayfa.ikon} />
              </span>
              <Link href={`/yonetim/hakkinda/${sayfa.id}`}>
                <strong>{String(sira + 1).padStart(2, "0")} · {sayfa.baslik}</strong>
                <span>{sayfa.ozet}</span>
              </Link>
              <code className="hakkinda-satir-adres">{kartAdresi(sayfa)}</code>
              <span className={`status ${sayfa.yayinda ? "status-published" : "status-draft"}`}>
                {sayfa.yayinda ? "Yayında" : "Taslak"}
              </span>
              <span className="hakkinda-satir-tur">{baglantiKartiMi(sayfa) ? "Bağlantı kartı" : `${sayfa.bloklar.length} blok`}</span>

              {/* Sıralama düğmeleri betiksiz çalışıyor: her biri kendi küçük
                  formu. Sürükle-bırak için istemci tarafı bir liste gerekirdi,
                  altı satırlık bir listede karşılığı yok. */}
              <div className="hakkinda-satir-araclar">
                <form action={hakkindaTasiAction}>
                  <input type="hidden" name="id" value={sayfa.id} />
                  <input type="hidden" name="yon" value="yukari" />
                  <button type="submit" disabled={sira === 0} aria-label={`${sayfa.baslik} kartını yukarı taşı`}>↑</button>
                </form>
                <form action={hakkindaTasiAction}>
                  <input type="hidden" name="id" value={sayfa.id} />
                  <input type="hidden" name="yon" value="asagi" />
                  <button type="submit" disabled={sira === sayfalar.length - 1} aria-label={`${sayfa.baslik} kartını aşağı taşı`}>↓</button>
                </form>
              </div>
              <Link className="haber-duzenle" href={`/yonetim/hakkinda/${sayfa.id}`}>Düzenle →</Link>
            </div>
          ))}

          {sayfalar.length === 0 ? (
            <div className="empty-admin">
              <strong>Kayıtlı Hakkında sayfası yok.</strong>
              <p>
                Kartlar veritabanından geliyor; tablo boşsa ana sayfadaki ızgara ve menü de boş kalır.
                İlk kurulumda <code>npm run goc:hakkinda</code> altı başlığı yükler.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
