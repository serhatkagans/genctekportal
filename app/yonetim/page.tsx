import { readdir } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { haberleriOku } from "@/lib/haber";
import { gorselYolu } from "@/lib/ortam";
import { koordinatorleriOku } from "@/lib/koordinator";
import { temalariOku } from "@/lib/tema";
import { wordpressPages } from "@/lib/wordpress-content";

export const dynamic = "force-dynamic";

async function medyaSayisi() {
  try {
    return (await readdir(path.join(process.cwd(), "public", "wordpress", "media"))).length;
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const [haberler, koordinatorler, medya, themes] = await Promise.all([
    haberleriOku(true),
    koordinatorleriOku(),
    medyaSayisi(),
    temalariOku(),
  ]);

  const iller = new Set(koordinatorler.map((k) => k.il)).size;
  const atamaBekleyen = koordinatorler.filter((k) => !k.ad).length;
  const sonHaberler = haberler.slice(0, 6);
  const sonGuncelleme = haberler
    .map((h) => new Date(h.modified).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => b - a)[0];

  return (
    <AdminShell
      title="Genel bakış"
      action={<Link className="button button-primary" href="/yonetim/icerik/yeni"><Icon name="plus" />Yeni haber</Link>}
    >
      <div className="admin-stats">
        <article>
          <span>Haber</span>
          <strong>{haberler.length}</strong>
          <small>{sonGuncelleme ? `Son değişiklik ${new Date(sonGuncelleme).toLocaleDateString("tr-TR")}` : "Henüz düzenlenmedi"}</small>
        </article>
        <article>
          <span>Koordinatör</span>
          <strong>{koordinatorler.length}</strong>
          <small>{iller} ilde görevli</small>
        </article>
        <article>
          <span>Atama bekleyen</span>
          <strong>{atamaBekleyen}</strong>
          <small>{atamaBekleyen ? "Kadro boş" : "Tüm kadrolar dolu"}</small>
        </article>
        <article>
          <span>Medya dosyası</span>
          <strong>{medya}</strong>
          <small>{wordpressPages.length} sabit sayfa · {themes.length} tema</small>
        </article>
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-head">
            <div>
              <h2>Son haberler</h2>
              <p>Düzenlemek için başlığa tıkla</p>
            </div>
            <Link href="/yonetim/icerik">Tümünü gör</Link>
          </div>
          <div className="resource-list">
            {sonHaberler.map((h) => (
              <Link className="haber-satiri" href={`/yonetim/icerik/${h.id}`} key={h.id}>
                <img src={gorselYolu(h.featuredImage || "/Genc.png")} alt="" loading="lazy" />
                <div>
                  <strong>{h.title}</strong>
                  <span>/haberler/{h.slug}</span>
                </div>
                <time dateTime={h.date}>{new Date(h.date).toLocaleDateString("tr-TR")}</time>
                <span className="haber-duzenle">Düzenle →</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="admin-panel">
          <div className="panel-head">
            <div>
              <h2>Bağlı ekranlar</h2>
              <p>Gerçek veriyle çalışan bölümler</p>
            </div>
          </div>
          <ul className="panel-liste">
            <li><Link href="/yonetim/icerik">Haberler</Link><span>{haberler.length} kayıt · yazılabilir</span></li>
            <li><Link href="/yonetim/koordinatorler">Koordinatörler</Link><span>{koordinatorler.length} kayıt · yazılabilir</span></li>
            <li><Link href="/yonetim/yonlendirmeler">Yönlendirmeler</Link><span>yazılabilir</span></li>
            <li><Link href="/yonetim/medya">Medya</Link><span>{medya} dosya · salt okunur</span></li>
            <li><Link href="/yonetim/temalar">Temalar</Link><span>{themes.length} tema · yazılabilir</span></li>
          </ul>
        </aside>
      </div>
    </AdminShell>
  );
}
