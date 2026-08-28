/**
 * GENÇTEK UYGULAMASINDAKİ ETKİNLİKLER (20 Ağustos 2026 · istek: "ana sayfada
 * Üretim temaları yerine az önce oluşturulan etkinlikler gelecek, oradan takip
 * edilebilecek etkinlikler").
 *
 * Etkinlik kaydının sahibi PORTAL DEĞİL, gençtek uygulamasıdır: etkinlik orada
 * açılıyor, orada onaylanıyor, başvuru orada alınıyor. Portal onu kopyalamaz,
 * her istekte oradaki herkese açık uçtan (`/api/acik-etkinlikler`) okur. İki
 * tarafta iki kopya tutulsaydı, orada iptal edilen bir etkinlik burada
 * "başvurabilirsiniz" demeye devam ederdi.
 *
 * PORTALIN KENDİ `Event` TABLOSU AYRI DURUYOR ve bu bölüm onu kullanmıyor. O
 * tablo yönetim panelinden girilen portal etkinliklerinindir; burada
 * listelenen şey gençtek panelinde açılmış etkinliklerdir. İkisini tek listede
 * karıştırmak, "bu etkinliğe nereden başvurulur" sorusunu cevapsız bırakırdı.
 *
 * BAĞLANTI KOPUKSA PORTAL ÇÖKMEZ: uç kapalıysa, yavaşsa ya da adres hiç
 * tanımlanmamışsa boş liste döner ve ana sayfa bölümü "şu an listelenecek
 * etkinlik yok" der. Tanıtım sitesinin tamamı, başka bir uygulamanın ayakta
 * olmasına bağlanamaz.
 */

import { GENCTEK_ADRESI, genctekGirisAdresi } from "./genctek-baglanti";
import { onbellekliOku } from "./genctek-onbellek";

export type BasvuruDurumu = "ACILMADI" | "ACIK" | "KAPANDI";

export type AcikEtkinlik = {
  id: number;
  ad: string;
  aciklama: string;
  tarih: Date;
  bitisTarihi: Date | null;
  kapsamEtiketi: string;
  il: string | null;
  duzenleyenBirim: string;
  basvuruBitis: Date;
  basvuruDurumu: BasvuruDurumu;
  /**
   * Başvuru yolu — gençtek uygulamasının GİRİŞ ekranı üzerinden etkinliğin
   * sayfasına gider (bkz. aşağıdaki `katilimAdresi` notu).
   */
  katilimAdresi: string;
};

/*
 * Uç yanıt vermiyorsa ana sayfa onu beklemesin: ziyaretçi, başka bir sistemin
 * arızası yüzünden boş ekrana bakmamalı. Dört saniye, sağlıklı bir yanıt için
 * fazlasıyla yeterli.
 */
const ZAMAN_ASIMI_MS = 4000;

/*
 * Yanıt bir dakika önbelleklenir: her ziyaretçi için ayrı istek atmak gereksiz,
 * ama yeni açılan bir etkinliğin de saatlerce görünmemesi olmaz. Uç da aynı
 * süreyi öneriyor (Cache-Control).
 *
 * ÖNBELLEK NEXT'İN DEĞİL, BİZİM: `next: { revalidate }` bayat kaydı arka planda
 * tazeliyor ve o denemenin hatasını doğrudan günlüğe yazıyordu — platform
 * kapalıyken sunucu çıktısı `ECONNREFUSED` ile doluyordu (bkz.
 * genctek-onbellek.ts). `no-store` ile istek Next'in önbelleğine hiç girmiyor.
 */
const ONBELLEK_SANIYE = 60;

/** Uçtan gelen ham satır; alan adları gençtek uygulamasının sözlüğündedir. */
type HamEtkinlik = {
  id: number;
  ad: string;
  aciklama: string;
  tarih: string;
  bitisTarihi: string | null;
  kapsamEtiketi: string;
  il: string | null;
  duzenleyenBirim: string;
  basvuruBitis: string;
  basvuruDurumu: BasvuruDurumu;
  katilimYolu: string;
};

const BASVURU_DURUMLARI: BasvuruDurumu[] = ["ACILMADI", "ACIK", "KAPANDI"];

/*
 * Gelen veri BAŞKA BİR UYGULAMANIN çıktısıdır: sürümü ayrı ilerler, alanı
 * yeniden adlandırabilir. Bu yüzden "geldiği gibi kullan" değil, "beklediğim
 * biçimde mi" diye bakılıyor; uymayan satır atılır, sayfa yine basılır.
 */
function satiriCoz(ham: unknown): AcikEtkinlik | null {
  if (typeof ham !== "object" || ham === null) return null;
  const kayit = ham as Partial<HamEtkinlik>;

  if (typeof kayit.id !== "number") return null;
  if (typeof kayit.ad !== "string" || kayit.ad === "") return null;
  if (typeof kayit.katilimYolu !== "string" || !kayit.katilimYolu.startsWith("/")) {
    return null;
  }

  const tarih = new Date(String(kayit.tarih));
  const basvuruBitis = new Date(String(kayit.basvuruBitis));
  if (Number.isNaN(tarih.getTime()) || Number.isNaN(basvuruBitis.getTime())) {
    return null;
  }
  const bitisTarihi = kayit.bitisTarihi ? new Date(kayit.bitisTarihi) : null;

  return {
    id: kayit.id,
    ad: kayit.ad,
    aciklama: typeof kayit.aciklama === "string" ? kayit.aciklama : "",
    tarih,
    bitisTarihi:
      bitisTarihi && !Number.isNaN(bitisTarihi.getTime()) ? bitisTarihi : null,
    kapsamEtiketi:
      typeof kayit.kapsamEtiketi === "string" ? kayit.kapsamEtiketi : "Etkinlik",
    il: typeof kayit.il === "string" ? kayit.il : null,
    duzenleyenBirim:
      typeof kayit.duzenleyenBirim === "string" ? kayit.duzenleyenBirim : "",
    basvuruBitis,
    basvuruDurumu: BASVURU_DURUMLARI.includes(kayit.basvuruDurumu as BasvuruDurumu)
      ? (kayit.basvuruDurumu as BasvuruDurumu)
      : "KAPANDI",
    /*
     * ADRES GİRİŞ EKRANINDAN GEÇER, doğrudan etkinlik sayfasına değil.
     *
     * Etkinlik sayfası oturum ister (istek: "herkes başvuramayacak, az önceki
     * uygulamadaki sayfaya gitmesi gerek ama girişten sonra") ve uygulamanın
     * panel düzeni oturumsuz ziyaretçiyi ETKİNLİĞİ UNUTARAK /giris'e atıyor.
     * `?nereye=` ile gidildiğinde giriş ekranı hedefi taşıyor ve kişi girişten
     * sonra tam da tıkladığı etkinlikte açılıyor. Zaten oturumu olan ziyaretçi
     * giriş ekranını hiç görmez, doğrudan etkinliğe düşer.
     */
    katilimAdresi: genctekGirisAdresi(kayit.katilimYolu),
  };
}

/**
 * Platformdaki etkinlikler.
 *
 * `gecmis` VERİLDİĞİNDE tarihi geçmiş etkinlikler, en yeniden eskiye gelir;
 * verilmediğinde süren ve yaklaşanlar, en yakın tarihten uzağa. İki liste ayrı
 * çağrılır çünkü sıralamaları ters — tek listede birleştirilseydi, listenin
 * ortasında sıralama yön değiştirirdi (20 Ağustos 2026 · istek: "etkinlik
 * sayfasında platformdaki tüm etkinlikler görülebilecekti").
 */
export async function genctekEtkinlikleriOku(
  adet = 6,
  secenekler: { gecmis?: boolean } = {},
): Promise<AcikEtkinlik[]> {
  if (!GENCTEK_ADRESI) return [];

  const sorgu = new URLSearchParams({ adet: String(adet) });
  if (secenekler.gecmis) sorgu.set("gecmis", "1");

  /*
   * ÖNBELLEK ANAHTARI SORGUYU İÇERİR: ana sayfa altı yaklaşan etkinlik,
   * etkinlik sayfası hem yaklaşanları hem geçmişi ayrı ayrı istiyor. Tek
   * anahtar kullanılsaydı biri diğerinin listesini görürdü.
   */
  return onbellekliOku(
    `etkinlikler?${sorgu}`,
    ONBELLEK_SANIYE,
    () => ucuOku(sorgu),
    (liste) => liste.length > 0,
  );
}

async function ucuOku(sorgu: URLSearchParams): Promise<AcikEtkinlik[]> {
  try {
    const yanit = await fetch(
      `${GENCTEK_ADRESI}/api/acik-etkinlikler?${sorgu.toString()}`,
      {
        signal: AbortSignal.timeout(ZAMAN_ASIMI_MS),
        cache: "no-store",
      },
    );
    if (!yanit.ok) return [];

    const govde = (await yanit.json()) as { etkinlikler?: unknown };
    if (!Array.isArray(govde.etkinlikler)) return [];

    return govde.etkinlikler
      .map(satiriCoz)
      .filter((etkinlik): etkinlik is AcikEtkinlik => etkinlik !== null);
  } catch {
    /*
     * Yutulan hata BİLİNÇLİ: ağ hatası, zaman aşımı ve bozuk JSON'un üçü de
     * aynı sonuca varır — portalda gösterilecek etkinlik yoktur. Ziyaretçiye
     * başka bir sistemin arızasını anlatmanın anlamı yok; bölüm boş durumunu
     * basar.
     */
    return [];
  }
}
