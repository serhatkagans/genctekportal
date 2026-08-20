import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { BagliDegil } from "@/components/bagli-degil";
import { DURUM_ETIKETLERI, basvurulariOku, cevabiGoster } from "@/lib/forms/basvuru";
import { uygulamaYolu } from "@/lib/ortam";
import { tarihYaz } from "@/lib/tarih";
import { basvuruYetkisi } from "./actions";

export const dynamic = "force-dynamic";

const DURUM_SINIFLARI: Record<string, string> = {
  APPROVED: "status-published",
  NEW: "status-published",
};

export default async function Page({ searchParams }: {
  searchParams: Promise<{ durum?: string; arama?: string }>;
}) {
  const { yetkili } = await basvuruYetkisi();
  if (!yetkili) {
    return (
      <AdminShell title="Başvurular">
        <div className="empty-admin">
          <strong>Bu ekranı görme yetkiniz yok.</strong>
          <p>Başvurular kişisel veri içerir; yalnızca form inceleyici, denetçi ve sistem yöneticisi görebilir.</p>
        </div>
      </AdminShell>
    );
  }

  const { durum, arama } = await searchParams;
  const sonuc = await basvurulariOku({ durum, arama });

  if (!sonuc.bagli) {
    return (
      <AdminShell title="Başvurular">
        <BagliDegil
          baslik="Veritabanına ulaşılamıyor"
          aciklama={`Başvurular Postgres'ten okunuyor ama bağlantı kurulamadı: ${sonuc.hata}`}
          model="Submission"
          gereken={["Postgres sunucusunun çalışıyor olması", ".env içindeki DATABASE_URL değeri", "npx prisma migrate deploy"]}
        />
      </AdminShell>
    );
  }

  const { basvurular, durumSayilari } = sonuc;
  const toplam = Object.values(durumSayilari).reduce((t, n) => t + n, 0);

  return (
    <AdminShell
      title="Başvurular"
      action={
        <a className="button button-secondary" href={uygulamaYolu("/yonetim/basvurular/disa-aktar")}>
          CSV indir
        </a>
      }
    >
      <div className="privacy-warning">
        <span>
          Bu ekrandaki kayıtlar kişisel veri içerir. İletişim bilgileri veritabanında şifreli tutulur,
          listede maskelenir; maskeyi kaldırmak denetim kaydına yazılır.
        </span>
      </div>

      <div className="admin-toolbar">
        <form className="basvuru-suzgec">
          <label>
            <input name="arama" defaultValue={arama ?? ""} placeholder="Referans, ad veya kurum ara" />
          </label>
          <select name="durum" defaultValue={durum ?? ""}>
            <option value="">Tüm durumlar ({toplam})</option>
            {Object.entries(DURUM_ETIKETLERI).map(([deger, etiket]) => (
              <option key={deger} value={deger}>{etiket} ({durumSayilari[deger] ?? 0})</option>
            ))}
          </select>
          <button className="button button-secondary" type="submit">Filtrele</button>
          {durum || arama ? <Link className="text-link" href="/yonetim/basvurular">Temizle</Link> : null}
        </form>
        <span className="result-count">{basvurular.length} kayıt</span>
      </div>

      {basvurular.length === 0 ? (
        <div className="empty-admin">
          <strong>Kayıtlı başvuru yok.</strong>
          <p>
            {toplam === 0
              ? <>Katılım formuna gelen başvurular buraya düşer. Formu <code>/katilim</code> adresinden deneyebilirsin.</>
              : "Filtreyle eşleşen kayıt yok."}
          </p>
        </div>
      ) : (
        <section className="admin-panel">
          <div className="resource-list">
            {basvurular.map((b) => {
              const ogrenciMi = b.answers.applicantType === "STUDENT";
              const ad = ogrenciMi ? b.answers.studentName : b.answers.teacherName;
              const eposta = ogrenciMi ? b.answers.studentEmail : b.answers.teacherEmail;
              return (
                <article className="resource-row basvuru-satiri" key={b.id}>
                  <code className="basvuru-referans">{b.reference}</code>
                  <div>
                    <Link className="etkinlik-baslik" href={`/yonetim/basvurular/${b.reference}`}>
                      {ad || "Ad belirtilmemiş"}
                    </Link>
                    <span>
                      {ogrenciMi ? "Öğrenci" : "Danışman öğretmen"} · {b.answers.institution || "—"}
                      {" · "}{cevabiGoster(ogrenciMi ? "studentEmail" : "teacherEmail", eposta ?? "", false)}
                    </span>
                  </div>
                  <span className={`status ${DURUM_SINIFLARI[b.status] ?? ""}`}>
                    {DURUM_ETIKETLERI[b.status] ?? b.status}
                  </span>
                  <span>
                    {b.provinceName ?? b.answers.province ?? "—"} · {tarihYaz(b.submittedAt)}
                    {b.ekSayisi > 0 ? ` · ${b.ekSayisi} ek` : ""}
                    {b.notSayisi > 0 ? ` · ${b.notSayisi} not` : ""}
                  </span>
                  <Link className="etkinlik-belge" href={`/yonetim/basvurular/${b.reference}`}>Aç →</Link>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </AdminShell>
  );
}
