import Link from "next/link";
import { AdminNav } from "./admin-nav";
import { Icon } from "./icons";
import { MarkaSimgesi } from "./marka-simgesi";
import { TemaSecici } from "./TemaSecici";
import { cikisAction } from "@/app/giris/actions";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";

// Bütün yönetim sayfaları bu kabuktan geçiyor; oturum burada doğrulanıyor.
// Proxy yalnızca çerezin var olduğuna bakabiliyor (veritabanına erişemez), o
// yüzden gerçek denetim burada: uydurma bir çerezle panel açılmamalı.
export async function AdminShell({ children, title, action }: { children: React.ReactNode; title: string; action?: React.ReactNode }) {
  await oturumKullanicisiZorunlu();
  // Rozet sabit "Geliştirme" yazıyordu; canlıda yanlış bilgi verirdi.
  const ortam = process.env.NODE_ENV === "production" ? "Canlı" : "Geliştirme";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand brand-inverse" href="/">
          <MarkaSimgesi /><span>GENÇ<span className="brand-accent">TEK</span></span>
        </Link>
        <span className="admin-label">Yönetim Merkezi</span>
        <AdminNav />
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <Link className="button button-secondary admin-siteye" href="/" target="_blank">
            Siteyi görüntüle <Icon name="arrow" />
          </Link>
          <TemaSecici />
          <span className="env-badge">{ortam}</span>
          <form action={cikisAction}>
            <button className="admin-cikis" type="submit">Çıkış yap</button>
          </form>
        </header>
        <main className="admin-content">
          <div className="admin-page-head">
            <div>
              <span className="breadcrumb">Yönetim / {title}</span>
              <h1>{title}</h1>
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
