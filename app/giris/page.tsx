import Link from "next/link";
import { redirect } from "next/navigation";
import { GirisFormu } from "@/components/giris-formu";
import { oturumKullanicisi } from "@/lib/auth/oturum";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const hedef = returnTo ?? "/yonetim";

  // Oturumu açık olan biri giriş ekranında takılı kalmasın. Çerezin varlığı
  // yetmez: süresi dolmuş çerezle gelen kullanıcı buradan geri yollanırsa
  // korunan sayfa onu tekrar buraya atar ve döngü kurulur.
  if (await oturumKullanicisi()) redirect(hedef);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/">
          <span className="brand-mark">G</span>
          <span>GENÇ<span className="brand-accent">TEK</span></span>
        </Link>
        <div>
          <span className="eyebrow">Yönetim Merkezi</span>
          <h1>Tekrar hoş geldiniz.</h1>
          <p>İçerikleri ve GençTek ekosistemini yönetmek için giriş yapın.</p>
        </div>
        <GirisFormu returnTo={hedef} />
        <p className="auth-foot">Hesaplar yalnızca sistem yöneticisi davetiyle oluşturulur.</p>
      </section>
    </main>
  );
}
