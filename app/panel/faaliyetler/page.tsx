import Link from "next/link";
import { notFound } from "next/navigation";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { prisma } from "@/lib/db";
import { tarihYaz } from "@/lib/tarih";

export const dynamic = "force-dynamic";

export default async function FaaliyetlerSayfasi() {
  const kullanici = await oturumKullanicisiZorunlu();
  const genelYetki = kullanici.roller.some((rol) => rol === "SYSTEM_ADMIN" || rol === "CONTENT_MANAGER");
  const ilYetkisi = kullanici.roller.includes("FORM_REVIEWER") && kullanici.ilKodu;
  if (!genelYetki && !ilYetkisi) notFound();

  const faaliyetler = await prisma.event.findMany({
    where: genelYetki ? {} : { provinceCode: kullanici.ilKodu ?? "__YOK__" },
    orderBy: { startsAt: "desc" },
    select: {
      id: true,
      title: true,
      startsAt: true,
      province: { select: { name: true } },
      _count: { select: { participations: { where: { status: "SECILDI" } } } },
    },
  });

  return (
    <section className="admin-panel belge-panel">
      <div className="panel-head">
        <div>
          <h2>Belge üretilecek faaliyetler</h2>
          <p>
            Bir faaliyet açın; o faaliyete <strong>seçilmiş</strong> katılımcılar listelenir ve
            katılım / teşekkür belgesi tekil ya da toplu olarak basılır.
          </p>
        </div>
      </div>
      {faaliyetler.length === 0 ? (
        <p className="belge-bos-metin">Erişebileceğiniz bir faaliyet bulunamadı.</p>
      ) : (
        <div className="resource-list">
          {faaliyetler.map((faaliyet) => (
            <article className="resource-row etkinlik-satiri" key={faaliyet.id}>
              <span aria-hidden>◆</span>
              <div>
                <Link className="etkinlik-baslik" href={`/panel/faaliyetler/${faaliyet.id}/belgeler`}>
                  {faaliyet.title}
                </Link>
                <span>{faaliyet.province?.name ?? "Genel"} · {tarihYaz(faaliyet.startsAt)}</span>
              </div>
              <span className="status status-published">{faaliyet._count.participations} kişi seçilmiş</span>
              <span>Katılım / teşekkür belgesi</span>
              <Link
                className="etkinlik-belge"
                href={`/panel/faaliyetler/${faaliyet.id}/belgeler`}
                aria-label={`${faaliyet.title} belgelerini aç`}
              >
                Belge üret →
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
