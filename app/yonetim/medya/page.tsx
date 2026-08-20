import { AdminShell } from "@/components/admin-shell";
import { MedyaListesi } from "@/components/medya-listesi";
import { EN_BUYUK_BOYUT, medyaDosyalari } from "@/lib/medya";

export const dynamic = "force-dynamic";

export default async function Page() {
  const dosyalar = await medyaDosyalari();
  dosyalar.sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  const toplam = dosyalar.reduce((t, d) => t + d.boyut, 0);
  const yuklenen = dosyalar.filter((d) => d.kaynak === "yuklenen").length;

  return (
    <AdminShell title="Medya kütüphanesi">
      <div className="info-banner">
        {dosyalar.length} dosya · {(toplam / 1024 / 1024).toFixed(1)} MB — bunların {yuklenen} tanesi panelden yüklendi.
        Yüklenen dosyalar <code>public/medya</code>, WordPress içe aktarımından gelenler <code>public/wordpress/media</code>{" "}
        klasöründe durur. En büyük dosya boyutu {(EN_BUYUK_BOYUT / 1024 / 1024).toFixed(0)} MB; PNG, JPEG, WebP, AVIF ve GIF kabul edilir.
      </div>
      <MedyaListesi dosyalar={dosyalar} />
    </AdminShell>
  );
}
