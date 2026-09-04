import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { gorselYolu } from "@/lib/ortam";
import { aciklamaOzeti, etkinlikleriOku, type TemelEtkinlik } from "@/lib/temel-etkinlik";
import { etkinlikTasiAction } from "./actions";

export const dynamic = "force-dynamic";

/**
 * TEMEL ETKİNLİKLER EKRANI (4 Eylül 2026 · istek: "temel etkinlik düzelt ekle
 * de yapalım panelde").
 *
 * İki liste tek ekranda ama AYRI BAŞLIKLAR altında: sırası da, sitede
 * göründükleri yer de ayrı. Tek karışık liste, hangi kaydın nerede çıktığını
 * gizlerdi.
 */
function Liste({ baslik, aciklama, kayitlar }: { baslik: string; aciklama: string; kayitlar: TemelEtkinlik[] }) {
  return (
    <section className="admin-panel">
      <div className="blok-editor-baslik">
        <h2>{baslik}</h2>
        <span>{kayitlar.length} program</span>
      </div>
      <p className="ayar-aciklama">{aciklama}</p>

      <div className="resource-list">
        {kayitlar.map((kayit, sira) => (
          <div className="haber-satiri hakkinda-satiri" key={kayit.id}>
            {kayit.gorseller[0]
              ? <img src={gorselYolu(kayit.gorseller[0].url)} alt="" loading="lazy" />
              : <span className="hakkinda-satir-simge hakkinda-bant-calendar" aria-hidden="true"><Icon name="calendar" /></span>}
            <Link href={`/yonetim/temel-etkinlikler/${kayit.id}`}>
              <strong>{String(sira + 1).padStart(2, "0")} · {kayit.ad}</strong>
              <span>{aciklamaOzeti(kayit.aciklama)?.slice(0, 110) || "Açıklama yok"}</span>
            </Link>
            <code className="hakkinda-satir-adres">{kayit.slug}</code>
            <span className={`status ${kayit.yayinda ? "status-published" : "status-draft"}`}>
              {kayit.yayinda ? "Yayında" : "Taslak"}
            </span>
            <span className="hakkinda-satir-tur">{kayit.gorseller.length} kare</span>

            <div className="hakkinda-satir-araclar">
              <form action={etkinlikTasiAction}>
                <input type="hidden" name="id" value={kayit.id} />
                <input type="hidden" name="yon" value="yukari" />
                <button type="submit" disabled={sira === 0} aria-label={`${kayit.ad} kaydını yukarı taşı`}>↑</button>
              </form>
              <form action={etkinlikTasiAction}>
                <input type="hidden" name="id" value={kayit.id} />
                <input type="hidden" name="yon" value="asagi" />
                <button type="submit" disabled={sira === kayitlar.length - 1} aria-label={`${kayit.ad} kaydını aşağı taşı`}>↓</button>
              </form>
            </div>
            <Link className="haber-duzenle" href={`/yonetim/temel-etkinlikler/${kayit.id}`}>Düzenle →</Link>
          </div>
        ))}

        {kayitlar.length === 0 ? (
          <div className="empty-admin">
            <strong>Bu listede kayıt yok.</strong>
            <p>İlk kurulumda <code>npm run goc:etkinlikler</code> on dokuz programı yükler.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default async function EtkinlikProgramlariListesi({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  // Taslaklar da listeleniyor; zirve kaydı burada BİRLEŞTİRİLMEDEN gösteriliyor
  // ki panelde kaydın kendi (boş) açıklaması görünsün, zirveden gelen metin değil.
  const kayitlar = await etkinlikleriOku(undefined, true);
  const silindi = (await searchParams).silindi === "1";

  return (
    <AdminShell
      title="Temel etkinlikler"
      action={<Link className="button button-primary" href="/yonetim/temel-etkinlikler/yeni"><Icon name="plus" />Yeni program</Link>}
    >
      {silindi ? <div className="info-banner">Program silindi.</div> : null}
      <div className="info-banner">
        Bu liste GençTek platformundaki <code>temel_etkinlik_programi</code> tablosuyla aynı olmalı: etkinlik
        açan kişi program adını oradan seçiyor. Ad değiştirir ya da yeni program eklersen platform tarafı da
        güncellenmeli.
      </div>

      <Liste
        baslik="Temel GençTek etkinlikleri"
        aciklama="/hakkinda/temel-etkinlikler sayfasındaki kartlar; buradaki sıra oradaki sıradır."
        kayitlar={kayitlar.filter((k) => k.liste === "temel")}
      />

      <Liste
        baslik="Çalışma grubu etkinlikleri"
        aciklama="1 Eylül 2026'da liste ekranından kaldırıldılar; kartları hiçbir sayfada görünmüyor ama kendi sayfaları açılıyor — paylaşılmış bağlantılar çalışsın diye."
        kayitlar={kayitlar.filter((k) => k.liste === "grup")}
      />
    </AdminShell>
  );
}
