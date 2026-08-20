import Link from "next/link";
import { notFound } from "next/navigation";
import { TumunuSecKutusu } from "@/components/belge/TumunuSecKutusu";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { BELGE_TURU_ETIKETLERI, BELGE_TURLERI } from "@/lib/belge/kurallar";
import { prisma } from "@/lib/db";
import { faaliyetKapsamiCikar, gorunurFaaliyetGetir } from "@/lib/faaliyet/erisim";
import { uygulamaYolu } from "@/lib/ortam";
import { tarihYaz } from "@/lib/tarih";
import { faaliyetRaporuYazabilirMi } from "@/lib/yetki/izinler";

export const dynamic = "force-dynamic";

const TOPLU_FORM_KIMLIGI = "toplu-belge-formu";

export default async function BelgelerSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kullanici = await oturumKullanicisiZorunlu();
  const faaliyet = await gorunurFaaliyetGetir(kullanici, id);
  if (!faaliyet) notFound();
  if (!faaliyetRaporuYazabilirMi(kullanici, faaliyetKapsamiCikar(faaliyet))) notFound();

  const basvurular = await prisma.activityParticipation.findMany({
    where: { eventId: faaliyet.id, status: "SECILDI" },
    orderBy: { appliedAt: "asc" },
    select: {
      participantId: true,
      participant: {
        select: { name: true, surname: true, className: true, branch: true, institution: true },
      },
    },
  });

  const tekBelgeYolu = (tur: string, ad: string) => uygulamaYolu(
    `/panel/faaliyetler/${faaliyet.id}/belge?tur=${tur}&ad=${encodeURIComponent(ad)}`,
  );
  const topluBelgeYolu = (tur: string) => uygulamaYolu(
    `/panel/faaliyetler/${faaliyet.id}/belge/toplu?tur=${tur}`,
  );

  return (
    <div className="belgeler-ekrani">
      <Link className="back-link" href="/yonetim/etkinlikler">← Etkinliklere dön</Link>
      <header className="belgeler-baslik">
        <span className="eyebrow">Belge üretimi</span>
        <h2>Katılım ve teşekkür belgeleri</h2>
        <p>{faaliyet.title} · {tarihYaz(faaliyet.startsAt)}</p>
      </header>

      <aside className="info-banner">
        Tekil belge bir sayfa açar. Toplu belge, tek yazdırma işlemiyle her katılımcıyı ayrı
        sayfaya yerleştirerek N sayfalık tek PDF üretir. Yazdırma ekranında gerekirse
        “Arka plan grafikleri” seçeneğini açın.
      </aside>

      <section className="admin-panel belge-panel">
        <div className="panel-head">
          <div>
            <h2>Katılımcılar</h2>
            <p>Faaliyete seçilmiş kişiler ve tekil belge kısayolları.</p>
          </div>
          {basvurular.length > 0 && <TumunuSecKutusu formId={TOPLU_FORM_KIMLIGI} />}
        </div>

        {basvurular.length === 0 ? (
          <p className="belge-bos-metin">
            Bu faaliyete seçilmiş katılımcı yok. Aşağıdaki bölümden ad yazarak tekil belge üretebilirsiniz.
          </p>
        ) : (
          <form
            id={TOPLU_FORM_KIMLIGI}
            method="get"
            action={uygulamaYolu(`/panel/faaliyetler/${faaliyet.id}/belge/toplu`)}
            target="_blank"
          >
            <div className="belge-toplu-ayarlari">
              <label>
                <span>Belge türü</span>
                <select name="tur" defaultValue="KATILIM">
                  {BELGE_TURLERI.map((tur) => (
                    <option key={tur} value={tur}>{BELGE_TURU_ETIKETLERI[tur]}</option>
                  ))}
                </select>
              </label>
              <label className="belge-metin-alani">
                <span>Ortak özel metin <small>(isteğe bağlı)</small></span>
                <input name="metin" type="text" maxLength={300} placeholder="Atölyedeki katkıları için." />
              </label>
              <button className="button button-primary" type="submit">Seçilenler için belge</button>
              <small className="belge-yardim">
                Hiç kimse işaretlenmezse seçilmiş katılımcıların tümü basılır.
              </small>
            </div>

            <ul className="belge-katilimci-listesi">
              {basvurular.map((basvuru) => {
                const adSoyad = `${basvuru.participant.name} ${basvuru.participant.surname}`.trim();
                return (
                  <li key={basvuru.participantId}>
                    <input
                      type="checkbox"
                      name="katilimci"
                      value={basvuru.participantId}
                      aria-label={`${adSoyad} kişisini seç`}
                    />
                    <div className="belge-katilimci-bilgi">
                      <strong>{adSoyad}</strong>
                      <span>
                        {basvuru.participant.className ?? basvuru.participant.branch ?? "—"}
                        {" · "}{basvuru.participant.institution ?? "—"}
                      </span>
                    </div>
                    <div className="belge-tekil-baglantilar">
                      {BELGE_TURLERI.map((tur) => (
                        <a key={tur} href={tekBelgeYolu(tur, adSoyad)} target="_blank" rel="noreferrer">
                          {BELGE_TURU_ETIKETLERI[tur]}
                        </a>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </form>
        )}

        {basvurular.length > 0 && (
          <div className="belge-hizli-yollar">
            <span>Hızlı yollar:</span>
            <a href={topluBelgeYolu("KATILIM")} target="_blank" rel="noreferrer">
              Tümü için katılım belgesi
            </a>
            <a href={topluBelgeYolu("TESEKKUR")} target="_blank" rel="noreferrer">
              Tümü için teşekkür belgesi
            </a>
          </div>
        )}
      </section>

      <section className="admin-panel belge-panel belge-tekil-form">
        <div className="panel-head">
          <div>
            <h2>Listede olmayan biri için</h2>
            <p>Konuşmacı, destek veren kurum veya sistemde kaydı olmayan katılımcı.</p>
          </div>
        </div>
        <form
          method="get"
          action={uygulamaYolu(`/panel/faaliyetler/${faaliyet.id}/belge`)}
          target="_blank"
        >
          <label>
            <span>Ad Soyad</span>
            <input type="text" name="ad" required maxLength={120} placeholder="Prof. Dr. Mehmet Kaya" />
          </label>
          <label>
            <span>Belge türü</span>
            <select name="tur" defaultValue="TESEKKUR">
              {BELGE_TURLERI.map((tur) => (
                <option key={tur} value={tur}>{BELGE_TURU_ETIKETLERI[tur]}</option>
              ))}
            </select>
          </label>
          <label className="belge-metin-alani">
            <span>Özel metin <small>(isteğe bağlı)</small></span>
            <input type="text" name="metin" maxLength={300} placeholder="Atölyenin yürütülmesindeki desteği için." />
          </label>
          <button className="button button-secondary" type="submit">Belgeyi aç</button>
        </form>
      </section>
    </div>
  );
}
