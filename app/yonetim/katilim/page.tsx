import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { katilimMetniniOku } from "@/lib/sayfa-metni";
import { katilimKaydetAction } from "./actions";

export const dynamic = "force-dynamic";

/**
 * KATILIM SAYFASI EKRANI (5 Eylül 2026 · istek: "hepsini yap").
 *
 * Sayfanın kendisi tek bir başlık bloğu ve bir form: form alanları koddan
 * geliyor (bkz. components/participation-form.tsx), düzenlenebilen üstteki üç
 * satır. Dinamik liste olmadığı için editör ayrı bir istemci bileşeni değil,
 * doğrudan bir sunucu formu.
 */
export default async function KatilimEkrani({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  const metin = await katilimMetniniOku();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell
      title="Katılım sayfası"
      action={<Link className="button button-secondary" href="/katilim" target="_blank">Sitede gör</Link>}
    >
      {kaydedildi ? <div className="info-banner">Katılım sayfası kaydedildi ve sitede yayımlandı.</div> : null}
      <div className="info-banner">
        <code>/katilim</code> adresindeki başlık bloğu. Altındaki başvuru formunun alanları burada değil,
        <strong> Formlar</strong> ekranından yönetiliyor.
      </div>

      <form action={katilimKaydetAction} className="admin-panel">
        <label>
          Üst etiket
          <input name="ustEtiket" defaultValue={metin.ustEtiket} placeholder="Ekosisteme katıl" />
          <small>Başlığın üstündeki küçük yazı. Boş bırakılırsa basılmaz.</small>
        </label>

        <label>
          Başlık
          <input name="baslik" defaultValue={metin.baslik} placeholder="Üretim yolculuğun burada başlıyor." />
          <small>Sayfanın H1 başlığı.</small>
        </label>

        <label>
          Spot metin
          <textarea name="spot" rows={3} defaultValue={metin.spot}
            placeholder="Bilgilerini paylaş; il koordinatörümüz seninle iletişime geçsin." />
          <small>Başlığın altındaki tek paragraf. Boş bırakılırsa basılmaz.</small>
        </label>

        <div className="blok-ekle">
          <button className="button button-primary" type="submit">Değişiklikleri kaydet</button>
        </div>
      </form>
    </AdminShell>
  );
}
