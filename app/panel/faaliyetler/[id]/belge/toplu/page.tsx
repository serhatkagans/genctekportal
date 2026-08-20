import Link from "next/link";
import { notFound } from "next/navigation";
import { YazdirButonu } from "@/components/YazdirButonu";
import { BelgeKagidi } from "@/components/belge/BelgeKagidi";
import { belgeStilleri } from "@/components/belge/belge-stilleri";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { BELGE_TURU_ETIKETLERI, belgeMetniUret, belgeTuruMu } from "@/lib/belge/kurallar";
import { prisma } from "@/lib/db";
import { faaliyetKapsamiCikar, gorunurFaaliyetGetir } from "@/lib/faaliyet/erisim";
import { uygulamaYolu } from "@/lib/ortam";
import { tarihYaz } from "@/lib/tarih";
import { faaliyetRaporuYazabilirMi } from "@/lib/yetki/izinler";
import { erisimLogla } from "@/lib/yetki/log";

export const dynamic = "force-dynamic";

// Yüzlerce tam sayfa arka plan, Chrome/Edge yazdırma önizlemesini kilitleyebildiği için sınırlıdır.
const BELGE_UST_SINIRI = 200;

type AramaParametreleri = {
  tur?: string | string[];
  katilimci?: string | string[];
  metin?: string | string[];
};

function tekDeger(deger: string | string[] | undefined): string | undefined {
  return Array.isArray(deger) ? deger[0] : deger;
}

function DurumEkrani({ id, baslik, aciklama }: { id: string; baslik: string; aciklama: string }) {
  return (
    <section className="belge-durum" role="status">
      <h2>{baslik}</h2>
      <p>{aciklama}</p>
      <Link className="button button-primary" href={`/panel/faaliyetler/${id}/belgeler`}>
        Belgeler ekranına dön
      </Link>
    </section>
  );
}

export default async function TopluBelgeSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<AramaParametreleri>;
}) {
  const [{ id }, arama] = await Promise.all([params, searchParams]);
  const tur = tekDeger(arama.tur);
  const metin = tekDeger(arama.metin);
  if (!tur || !belgeTuruMu(tur) || (metin?.length ?? 0) > 300) notFound();

  const kullanici = await oturumKullanicisiZorunlu();
  const faaliyet = await gorunurFaaliyetGetir(kullanici, id);
  if (!faaliyet) notFound();
  if (!faaliyetRaporuYazabilirMi(kullanici, faaliyetKapsamiCikar(faaliyet))) notFound();

  const katilimciParametresiVar = arama.katilimci !== undefined;
  const hamKimlikler = arama.katilimci === undefined
    ? []
    : Array.isArray(arama.katilimci) ? arama.katilimci : [arama.katilimci];
  const istenenKimlikler = [...new Set(hamKimlikler
    .map((deger) => Number.parseInt(deger, 10))
    .filter((deger) => Number.isSafeInteger(deger) && deger > 0))];

  const basvurular = await prisma.activityParticipation.findMany({
    where: {
      eventId: faaliyet.id,
      status: "SECILDI",
      ...(katilimciParametresiVar ? { participantId: { in: istenenKimlikler } } : {}),
    },
    select: { participant: { select: { id: true, name: true, surname: true } } },
  });

  if (basvurular.length === 0) {
    const secimMesaji = katilimciParametresiVar
      ? "Seçilen kişiler bu faaliyetin seçilmiş katılımcıları arasında değil."
      : "Bu faaliyete seçilmiş katılımcı yok.";
    return <DurumEkrani id={faaliyet.id} baslik="Belge üretilemedi" aciklama={secimMesaji} />;
  }
  if (basvurular.length > BELGE_UST_SINIRI) {
    return (
      <DurumEkrani
        id={faaliyet.id}
        baslik="Belge sınırı aşıldı"
        aciklama={`${basvurular.length} kişi bulundu. En fazla ${BELGE_UST_SINIRI} kişilik seçimler yaparak işlemi bölün.`}
      />
    );
  }

  const katilimcilar = basvurular
    .map(({ participant }) => ({ ...participant, adSoyad: `${participant.name} ${participant.surname}`.trim() }))
    .sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, "tr"));
  const tarihMetni = tarihYaz(faaliyet.startsAt);
  const imzaAdSoyad = faaliyet.organizerName?.trim() || kullanici.adSoyad;
  const imzaBirim = faaliyet.organizerUnit?.trim() || "GençTek Faaliyet Koordinatörlüğü";

  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "GORUNTULEME",
    hedefTip: "FAALIYET",
    hedefId: faaliyet.id,
    detay: `Toplu ${BELGE_TURU_ETIKETLERI[tur]} üretildi: ${katilimcilar.length} kişi`,
  });

  return (
    <div className="belge-baski-katmani toplu-belge">
      <style>{belgeStilleri()}</style>
      <div className="belge-arac-cubugu">
        <a href={uygulamaYolu(`/panel/faaliyetler/${faaliyet.id}/belgeler`)} className="belge-arac">
          ← Belgeler
        </a>
        <span>{katilimcilar.length} belge · tek PDF</span>
        <YazdirButonu className="belge-arac belge-arac-birincil" />
      </div>
      {katilimcilar.map((katilimci, sira) => {
        const belge = belgeMetniUret({
          tur,
          adSoyad: katilimci.adSoyad,
          faaliyetAdi: faaliyet.title,
          tarihMetni,
          ozelMetin: metin ?? null,
        });
        return (
          <section className="belge-sayfasi" key={katilimci.id} aria-label={`${katilimci.adSoyad} belgesi`}>
            <span className="belge-sira">{sira + 1} / {katilimcilar.length}</span>
            <BelgeKagidi belge={belge} imzaAdSoyad={imzaAdSoyad} imzaBirim={imzaBirim} />
          </section>
        );
      })}
    </div>
  );
}
