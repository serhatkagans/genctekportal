import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { tarihYaz } from "@/lib/tarih";
import {
  DURUM_ETIKETLERI,
  ROLLER,
  ROL_ETIKETLERI,
  yonetimKullanicilari,
} from "@/lib/yonetim/kullanici";
import {
  durumDegistirAction,
  oturumlariKapatAction,
  rolDegistirAction,
} from "./actions";

export const dynamic = "force-dynamic";

/**
 * KULLANICILAR (20 Ağustos 2026 · istek: "yonetim/kullanicilar buradaki
 * kullanıcılar sayfasını … yapmamışsın").
 *
 * EKRAN YALNIZCA SİSTEM YÖNETİCİSİNE AÇIK. Kullanıcı listesi kimin neye
 * erişebildiğini gösterir; rol dağılımını görmek yetki haritasını görmektir.
 * Aynı kapı sunucu eylemlerinde de var (actions.ts) — ekranı gizlemek tek
 * başına koruma değildir.
 *
 * DURUM SATIR İÇİNDE DEĞİŞİR, ayrı bir düzenleme sayfası yoktur: değiştirilen
 * şey tek bir alan ve karar listeye bakarken veriliyor ("bu kişi hâlâ burada
 * mı"). Ayrı sayfa iki tık ve bir geri dönüş eklerdi.
 */
export default async function Page() {
  const kullanici = await oturumKullanicisiZorunlu();
  if (!kullanici.roller.includes("SYSTEM_ADMIN")) {
    return (
      <AdminShell title="Kullanıcılar">
        <div className="empty-admin">
          <strong>Bu ekranı görme yetkiniz yok.</strong>
          <p>Kullanıcı ve rol yönetimi yalnızca sistem yöneticisindedir.</p>
        </div>
      </AdminShell>
    );
  }

  const sonuc = await yonetimKullanicilari();
  if (!sonuc.bagli) {
    return (
      <AdminShell title="Kullanıcılar">
        <BagliDegil
          baslik="Veritabanına ulaşılamıyor"
          aciklama={`Kullanıcılar Postgres'ten okunuyor ama bağlantı kurulamadı: ${sonuc.hata}`}
          model="User / UserRole"
          gereken={[
            "Postgres sunucusunun çalışıyor olması",
            ".env içindeki DATABASE_URL değeri",
            "npx prisma migrate deploy",
          ]}
        />
      </AdminShell>
    );
  }

  const { kullanicilar } = sonuc;
  const aktif = kullanicilar.filter((k) => k.durum === "ACTIVE").length;
  const yonetici = kullanicilar.filter((k) => k.roller.includes("SYSTEM_ADMIN")).length;
  const mfali = kullanicilar.filter((k) => k.mfaAcik).length;
  const acikOturum = kullanicilar.reduce((t, k) => t + k.acikOturum, 0);
  const simdi = new Date();

  return (
    <AdminShell title="Kullanıcılar">
      <div className="admin-stats">
        <div className="admin-panel sayim-kutu"><strong>{kullanicilar.length}</strong><span>kayıtlı kişi</span></div>
        <div className="admin-panel sayim-kutu"><strong>{aktif}</strong><span>aktif</span></div>
        <div className="admin-panel sayim-kutu"><strong>{yonetici}</strong><span>sistem yöneticisi</span></div>
        <div className="admin-panel sayim-kutu"><strong>{acikOturum}</strong><span>açık oturum</span></div>
      </div>

      {/*
        MFA DURUMU SAYIYLA yazılıyor: "çoğunda kapalı" demek yerine kaç kişide
        açık olduğu söyleniyor, yönetici kimi arayacağını listeden görüyor.
      */}
      <div className="info-banner">
        {kullanicilar.length} kişiden {mfali} tanesinde iki adımlı doğrulama açık.
        Davet ve parola sıfırlama bu ekranda YOK: ikisi de e-posta gönderimi
        gerektiriyor ve <code>SMTP_URL</code> henüz tanımlı değil — panelden
        &quot;gönderildi&quot; deyip hiçbir şey göndermemektense yapılmadı.
      </div>

      {kullanicilar.length === 0 ? (
        <div className="empty-admin">
          <strong>Kayıtlı kullanıcı yok.</strong>
          <p>İlk yönetici hesabı <code>scripts/seed-veritabani.mjs</code> ile açılır.</p>
        </div>
      ) : (
        <section className="admin-panel">
          <div className="resource-list">
            {kullanicilar.map((k) => (
              <article className="resource-row kullanici-satiri" key={k.id}>
                <div className="kullanici-kimlik">
                  <strong>{k.ad}</strong>
                  <span>
                    {k.eposta}
                    {k.ilAdi ? ` · ${k.ilAdi}` : ""}
                    {k.mfaAcik ? " · 2FA açık" : ""}
                  </span>
                  <span className="kullanici-son">
                    {k.sonGiris ? `Son giriş: ${tarihYaz(k.sonGiris)}` : "Hiç giriş yapmadı"}
                    {k.acikOturum > 0 ? ` · ${k.acikOturum} açık oturum` : ""}
                    {k.kilitliBitis && k.kilitliBitis > simdi
                      ? ` · ${tarihYaz(k.kilitliBitis)} tarihine kadar kilitli`
                      : ""}
                  </span>
                </div>

                {/*
                  ROLLER TEK TEK AÇILIP KAPANIR. Çoklu seçim kutusu daha kısa
                  olurdu ama "kaydet"e basmadan önce hangi yetkinin
                  değiştiğini göstermezdi; burada her tık tek bir yetkiyi
                  değiştirir ve denetim kaydına tek satır düşer.
                */}
                <div className="rol-kutusu">
                  {ROLLER.map((rol) => {
                    const acik = k.roller.includes(rol);
                    return (
                      <form action={rolDegistirAction} key={rol}>
                        <input type="hidden" name="kullaniciId" value={k.id} />
                        <input type="hidden" name="rol" value={rol} />
                        <input type="hidden" name="islem" value={acik ? "cikar" : "ekle"} />
                        <button
                          type="submit"
                          className={`rol-etiket${acik ? " rol-etiket-acik" : ""}`}
                          title={acik
                            ? `${ROL_ETIKETLERI[rol]} rolünü kaldır`
                            : `${ROL_ETIKETLERI[rol]} rolü ver`}
                        >
                          {ROL_ETIKETLERI[rol]}
                        </button>
                      </form>
                    );
                  })}
                </div>

                <div className="kullanici-eylem">
                  <form action={durumDegistirAction}>
                    <input type="hidden" name="kullaniciId" value={k.id} />
                    <select name="durum" defaultValue={k.durum} className="durum-secim">
                      {Object.entries(DURUM_ETIKETLERI).map(([deger, etiket]) => (
                        <option key={deger} value={deger}>{etiket}</option>
                      ))}
                    </select>
                    <button className="text-link" type="submit">Uygula</button>
                  </form>
                  {k.acikOturum > 0 && (
                    <form action={oturumlariKapatAction}>
                      <input type="hidden" name="kullaniciId" value={k.id} />
                      <button className="text-link" type="submit">Oturumları kapat</button>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </AdminShell>
  );
}
