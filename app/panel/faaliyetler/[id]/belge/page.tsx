import { notFound } from "next/navigation";
import { YazdirButonu } from "@/components/YazdirButonu";
import { BelgeKagidi } from "@/components/belge/BelgeKagidi";
import { belgeStilleri } from "@/components/belge/belge-stilleri";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import { aliciAdiniCoz, belgeMetniUret, belgeTuruMu } from "@/lib/belge/kurallar";
import { faaliyetKapsamiCikar, gorunurFaaliyetGetir } from "@/lib/faaliyet/erisim";
import { uygulamaYolu } from "@/lib/ortam";
import { tarihYaz } from "@/lib/tarih";
import { faaliyetRaporuYazabilirMi } from "@/lib/yetki/izinler";
import { erisimLogla } from "@/lib/yetki/log";

export const dynamic = "force-dynamic";

export default async function BelgeSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tur?: string; ad?: string; metin?: string }>;
}) {
  const [{ id }, { tur, ad, metin }] = await Promise.all([params, searchParams]);
  const kullanici = await oturumKullanicisiZorunlu();
  const faaliyet = await gorunurFaaliyetGetir(kullanici, id);
  if (!faaliyet) notFound();
  if (!faaliyetRaporuYazabilirMi(kullanici, faaliyetKapsamiCikar(faaliyet))) notFound();
  if (!tur || !belgeTuruMu(tur) || (metin?.length ?? 0) > 300) notFound();

  const alici = aliciAdiniCoz(ad ?? "");
  if (!alici.olurMu) notFound();

  const belge = belgeMetniUret({
    tur,
    adSoyad: alici.adSoyad,
    faaliyetAdi: faaliyet.title,
    tarihMetni: tarihYaz(faaliyet.startsAt),
    ozelMetin: metin ?? null,
  });
  const imzaAdSoyad = faaliyet.organizerName?.trim() || kullanici.adSoyad;
  const imzaBirim = faaliyet.organizerUnit?.trim() || "GençTek Faaliyet Koordinatörlüğü";

  await erisimLogla({
    kullaniciId: kullanici.id,
    islem: "GORUNTULEME",
    hedefTip: "FAALIYET",
    hedefId: faaliyet.id,
    detay: `${belge.baslik} üretildi: ${belge.adSoyad}`,
  });

  return (
    <div className="belge-baski-katmani tek-belge">
      <style>{belgeStilleri()}</style>
      <div className="belge-arac-cubugu">
        <a href={uygulamaYolu(`/panel/faaliyetler/${faaliyet.id}/belgeler`)} className="belge-arac">
          ← Belgeler
        </a>
        <YazdirButonu className="belge-arac belge-arac-birincil" />
      </div>
      <section className="belge-sayfasi" aria-label={`${belge.adSoyad} belgesi`}>
        <BelgeKagidi belge={belge} imzaAdSoyad={imzaAdSoyad} imzaBirim={imzaBirim} />
      </section>
    </div>
  );
}
