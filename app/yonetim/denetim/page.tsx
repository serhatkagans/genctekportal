import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { can } from "@/lib/auth/rbac";
import { denetimKayitlari } from "@/lib/yonetim/denetim";

export const dynamic = "force-dynamic";

/**
 * DENETİM KAYDI (20 Ağustos 2026 · istek: "denetim kaydını … yapmamışsın").
 *
 * Tablo ve yazma yardımcısı vardı, okuyan ekran yoktu: kayıt tutuluyordu ama
 * kimse bakamıyordu.
 *
 * YETKİ `audit.read` ÜZERİNDEN sorulur, rol adıyla değil (bkz.
 * lib/auth/rbac.ts). Böylece denetçi rolü de sistem yöneticisi de aynı kapıdan
 * geçer; yeni bir rol eklendiğinde bu ekranı ayrıca güncellemek gerekmez.
 *
 * SALT OKUNUR VE ÖYLE KALMALI: silme/düzeltme yolu yok. Düzeltilebilen bir
 * denetim kaydı, denetim kaydı değildir.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ islem?: string; arama?: string; sayfa?: string }>;
}) {
  const kullanici = await oturumKullanicisiZorunlu();
  const yetkili = kullanici.roller.some((rol) => can(rol, "audit.read"));
  if (!yetkili) {
    return (
      <AdminShell title="Denetim kaydı">
        <div className="empty-admin">
          <strong>Bu ekranı görme yetkiniz yok.</strong>
          <p>Denetim kaydı, kimin ne yaptığını gösterir; denetçi ve sistem yöneticisi görebilir.</p>
        </div>
      </AdminShell>
    );
  }

  const { islem, arama, sayfa } = await searchParams;
  const sonuc = await denetimKayitlari({
    islem,
    arama,
    sayfa: Number.parseInt(sayfa ?? "1", 10) || 1,
  });

  if (!sonuc.bagli) {
    return (
      <AdminShell title="Denetim kaydı">
        <BagliDegil
          baslik="Veritabanına ulaşılamıyor"
          aciklama={`Denetim kaydı Postgres'ten okunuyor ama bağlantı kurulamadı: ${sonuc.hata}`}
          model="AuditLog"
          gereken={[
            "Postgres sunucusunun çalışıyor olması",
            ".env içindeki DATABASE_URL değeri",
            "npx prisma migrate deploy",
          ]}
        />
      </AdminShell>
    );
  }

  const { kayitlar, toplam, islemler, sayfa: gecerliSayfa, sonSayfa } = sonuc;
  const suzgecVar = Boolean(islem || arama);

  // Sayfalar arasında gezerken süzgeç düşmemeli: bağlantı mevcut sorguyu taşır.
  const sayfaYolu = (hedef: number) => {
    const sorgu = new URLSearchParams();
    if (islem) sorgu.set("islem", islem);
    if (arama) sorgu.set("arama", arama);
    if (hedef > 1) sorgu.set("sayfa", String(hedef));
    const metin = sorgu.toString();
    return metin ? `/yonetim/denetim?${metin}` : "/yonetim/denetim";
  };

  const tarihYaz = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  });

  return (
    <AdminShell title="Denetim kaydı">
      <div className="info-banner">
        Panelde yapılan yetki ve ayar değişiklikleri buraya yazılır. Kayıtlar
        yalnızca okunur; bu ekranda silme ya da düzeltme yolu yoktur.
      </div>

      <div className="admin-toolbar">
        <form className="basvuru-suzgec">
          <label>
            <input name="arama" defaultValue={arama ?? ""} placeholder="Kişi, hedef veya ayrıntı ara" />
          </label>
          <select name="islem" defaultValue={islem ?? ""}>
            <option value="">Tüm işlemler</option>
            {islemler.map((deger) => (
              <option key={deger} value={deger}>{deger}</option>
            ))}
          </select>
          <button className="button button-secondary" type="submit">Filtrele</button>
          {suzgecVar ? <Link className="text-link" href="/yonetim/denetim">Temizle</Link> : null}
        </form>
        <span className="result-count">{toplam} kayıt</span>
      </div>

      {kayitlar.length === 0 ? (
        <div className="empty-admin">
          <strong>{toplam === 0 ? "Henüz kayıt yok." : "Filtreyle eşleşen kayıt yok."}</strong>
          <p>
            {toplam === 0
              ? "Bir rolü değiştirdiğinizde ya da ayarları kaydettiğinizde ilk satır burada görünür."
              : "Arama ölçütlerini değiştirin."}
          </p>
        </div>
      ) : (
        <section className="admin-panel">
          <div className="resource-list">
            {kayitlar.map((kayit) => (
              <article className="resource-row denetim-satiri" key={kayit.id}>
                <span className="status">{kayit.islem}</span>
                <div>
                  <strong>{kayit.detay || `${kayit.hedefTip} ${kayit.hedefId ?? ""}`}</strong>
                  <span>
                    {/*
                      Aktör silinmiş olabilir: şemada actorId SetNull. Boş bir
                      hücre kaydın bozuk olduğunu düşündürürdü.
                    */}
                    {kayit.aktorAdi ?? "(silinmiş kullanıcı)"} · {kayit.hedefTip}
                    {kayit.hedefId ? ` · ${kayit.hedefId}` : ""}
                  </span>
                </div>
                <time dateTime={kayit.tarih.toISOString()}>{tarihYaz.format(kayit.tarih)}</time>
              </article>
            ))}
          </div>
        </section>
      )}

      {sonSayfa > 1 && (
        <div className="denetim-sayfalama">
          <span>{gecerliSayfa} / {sonSayfa}</span>
          <span className="denetim-sayfa-baglari">
            {gecerliSayfa > 1 && <Link className="text-link" href={sayfaYolu(gecerliSayfa - 1)}>Önceki</Link>}
            {gecerliSayfa < sonSayfa && <Link className="text-link" href={sayfaYolu(gecerliSayfa + 1)}>Sonraki</Link>}
          </span>
        </div>
      )}
    </AdminShell>
  );
}
