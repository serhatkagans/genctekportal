import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { AYAR_TANIMLARI, ayarlariOku } from "@/lib/yonetim/ayar";
import { ayarlariKaydetAction } from "./actions";

export const dynamic = "force-dynamic";

/**
 * GENEL AYARLAR (20 Ağustos 2026 · istek: "ayarlar sayfasını yapmamışsın").
 *
 * Eski hâli dürüst bir yer tutucuydu: "form alanları doluydu ama Kaydet
 * hiçbir şey yapmıyordu". Artık değerler `GlobalSetting` tablosuna yazılıyor
 * ve GERÇEKTEN KULLANILIYOR — site başlığı ve açıklaması sayfaların
 * metadata'sına, iletişim bilgileri alt bilgiye buradan geçiyor.
 *
 * Ayarın nerede göründüğü her alanın altında yazılı: kaydeden kişi neyi
 * değiştirdiğini görmeden kaydetmemeli.
 */
export default async function Page() {
  const kullanici = await oturumKullanicisiZorunlu();
  if (!kullanici.roller.includes("SYSTEM_ADMIN")) {
    return (
      <AdminShell title="Genel ayarlar">
        <div className="empty-admin">
          <strong>Bu ekranı görme yetkiniz yok.</strong>
          <p>Genel ayarlar sitenin tamamını etkiler; yalnızca sistem yöneticisi değiştirebilir.</p>
        </div>
      </AdminShell>
    );
  }

  const sonuc = await ayarlariOku();
  if (!sonuc.bagli) {
    return (
      <AdminShell title="Genel ayarlar">
        <BagliDegil
          baslik="Veritabanına ulaşılamıyor"
          aciklama={`Ayarlar Postgres'ten okunuyor ama bağlantı kurulamadı: ${sonuc.hata}`}
          model="GlobalSetting"
          gereken={[
            "Postgres sunucusunun çalışıyor olması",
            ".env içindeki DATABASE_URL değeri",
            "npx prisma migrate deploy",
          ]}
        />
      </AdminShell>
    );
  }

  const { ayarlar, guncelleme } = sonuc;
  const guncellemeYazisi = guncelleme
    ? new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
      }).format(guncelleme)
    : null;

  return (
    <AdminShell title="Genel ayarlar">
      <div className="info-banner">
        Bu alanlar sitenin her sayfasını etkiler: başlık ve açıklama tarayıcı
        sekmesine ve arama sonuçlarına, iletişim bilgileri alt bilgiye girer.
        {guncellemeYazisi ? ` Son değişiklik: ${guncellemeYazisi}.` : " Henüz kaydedilmiş bir değişiklik yok; varsayılanlar görünüyor."}
      </div>

      <form action={ayarlariKaydetAction} className="admin-panel ayar-formu">
        {AYAR_TANIMLARI.map((tanim) => (
          <label className="ayar-alani" key={tanim.anahtar}>
            <span className="ayar-etiket">{tanim.etiket}</span>
            {tanim.cokSatirli ? (
              <textarea name={tanim.anahtar} defaultValue={ayarlar[tanim.anahtar]} rows={3} />
            ) : (
              <input name={tanim.anahtar} defaultValue={ayarlar[tanim.anahtar]} />
            )}
            <span className="ayar-aciklama">{tanim.aciklama}</span>
          </label>
        ))}

        {/*
          BOŞ BIRAKILAN ALAN SİLİNMEZ, varsayılanına döner (bkz.
          lib/yonetim/ayar.ts). Boş bir site başlığı ekranı bozardı ve kullanıcı
          bunu ancak yayında fark ederdi; bu yüzden kural burada da yazılı.
        */}
        <p className="ayar-not">
          Boş bırakılan alan varsayılan değerine döner. Her kaydetme denetim
          kaydına yazılır.
        </p>

        <button className="button button-primary" type="submit">Kaydet</button>
      </form>
    </AdminShell>
  );
}
