import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { DURUM_ETIKETLERI, basvuruBul, cevabiGoster } from "@/lib/forms/basvuru";
import { tarihYaz } from "@/lib/tarih";
import { acAction, basvuruYetkisi, durumAction, notAction } from "../actions";

export const dynamic = "force-dynamic";

const ALAN_ETIKETLERI: Record<string, string> = {
  applicantType: "Başvuran türü",
  studentName: "Öğrenci adı",
  studentPhone: "Öğrenci telefonu",
  studentEmail: "Öğrenci e-postası",
  teacherName: "Öğretmen adı",
  teacherPhone: "Öğretmen telefonu",
  teacherEmail: "Öğretmen e-postası",
  institution: "Okul / kurum",
  province: "İl",
  district: "İlçe",
  workDescription: "Çalışma açıklaması",
  notes: "Ek notlar",
  consent: "Açık rıza",
};

const SIRA = Object.keys(ALAN_ETIKETLERI);

export default async function Page({ params, searchParams }: {
  params: Promise<{ referans: string }>;
  searchParams: Promise<{ ac?: string }>;
}) {
  const { yetkili, yazabilir } = await basvuruYetkisi();
  if (!yetkili) notFound();

  const { referans } = await params;
  const basvuru = await basvuruBul(referans);
  if (!basvuru) notFound();

  // Maske yalnızca acAction denetim kaydını yazdıktan sonra kalkar.
  const acik = (await searchParams).ac === "1" && yazabilir;

  const alanlar = SIRA.filter((alan) => alan in basvuru.answers);

  return (
    <AdminShell title={`Başvuru ${basvuru.reference}`}>
      <Link className="back-link" href="/yonetim/basvurular">← Başvurulara dön</Link>

      <div className={acik ? "privacy-warning" : "info-banner"}>
        <span>
          {acik
            ? "İletişim bilgileri açık gösteriliyor. Bu görüntüleme denetim kaydına yazıldı."
            : "İletişim bilgileri maskeli. Açmak denetim kaydına yazılır."}
        </span>
        {!acik && yazabilir ? (
          <form action={acAction}>
            <input type="hidden" name="referans" value={basvuru.reference} />
            <button className="button button-secondary" type="submit">Bilgileri aç</button>
          </form>
        ) : null}
        {acik ? (
          <Link className="button button-secondary" href={`/yonetim/basvurular/${basvuru.reference}`}>Maskele</Link>
        ) : null}
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-head">
            <div>
              <h2>Form cevapları</h2>
              <p>Rıza sürümü {basvuru.consentVersion} · {tarihYaz(basvuru.submittedAt)}</p>
            </div>
          </div>
          <dl className="basvuru-cevaplar">
            {alanlar.map((alan) => (
              <div key={alan}>
                <dt>{ALAN_ETIKETLERI[alan] ?? alan}</dt>
                <dd>{cevabiGoster(alan, basvuru.answers[alan] ?? "", acik)}</dd>
              </div>
            ))}
          </dl>

          {basvuru.ekler.length > 0 ? (
            <div className="basvuru-ekler">
              <h3>Ekler</h3>
              <ul>
                {basvuru.ekler.map((ek) => (
                  <li key={ek.id}>
                    <a href={`/api/yonetim/basvuru-eki/${ek.mediaId}`} target="_blank" rel="noreferrer">{ek.ad}</a>
                    <span>{(ek.boyut / 1024).toFixed(0)} KB · {ek.tur}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Durum</h2>
          <form action={durumAction}>
            <input type="hidden" name="referans" value={basvuru.reference} />
            <label>
              Başvuru durumu
              <select name="durum" defaultValue={basvuru.status} disabled={!yazabilir}>
                {Object.entries(DURUM_ETIKETLERI).map(([deger, etiket]) => (
                  <option key={deger} value={deger}>{etiket}</option>
                ))}
              </select>
            </label>
            {yazabilir ? <button className="button button-primary" type="submit">Durumu kaydet</button> : null}
          </form>

          <dl>
            <div><dt>Referans</dt><dd><code>{basvuru.reference}</code></dd></div>
            <div><dt>İl</dt><dd>{basvuru.provinceName ?? basvuru.answers.province ?? "—"}</dd></div>
            <div><dt>Saklama bitişi</dt><dd>{tarihYaz(basvuru.retentionUntil)}</dd></div>
          </dl>
        </aside>
      </div>

      <section className="admin-panel basvuru-notlar">
        <div className="panel-head">
          <div>
            <h2>Notlar</h2>
            <p>İç değerlendirme notları; başvurana gösterilmez.</p>
          </div>
        </div>
        {yazabilir ? (
          <form action={notAction} className="basvuru-not-form">
            <input type="hidden" name="referans" value={basvuru.reference} />
            <textarea name="not" rows={3} required maxLength={2000} placeholder="Değerlendirme notu ekle" />
            <button className="button button-secondary" type="submit">Not ekle</button>
          </form>
        ) : null}
        {basvuru.notlar.length === 0 ? (
          <p className="belge-bos-metin">Henüz not yok.</p>
        ) : (
          <ul className="basvuru-not-listesi">
            {basvuru.notlar.map((n) => (
              <li key={n.id}>
                <p>{n.body}</p>
                <span>{n.yazar} · {tarihYaz(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
