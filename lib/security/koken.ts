/*
 * ROUTE HANDLER'LARDA KÖKEN KONTROLÜ (3 Eylül 2026 · dış güvenlik incelemesi).
 *
 * NİYE YALNIZCA ROUTE HANDLER: Next sunucu eylemlerinde CSRF kontrolünü KENDİSİ
 * yapıyor — isteğin `Origin`'ini `Host` (ya da `X-Forwarded-Host`) ile
 * karşılaştırıp uyuşmazsa reddediyor (bkz. node_modules/next/dist/docs ·
 * guides/server-actions.md "CSRF check"). Route handler'lar bu kontrolün
 * DIŞINDA; POST kabul eden iki ucumuz da orada (medya yükleme ve başvuru
 * formu), yani açık tam olarak oraya düşüyordu.
 *
 * ÇEREZ SameSite=Lax OLDUĞU İÇİN yetmez mi? Yetmiyor. Lax, çapraz SİTE
 * isteklerini keser; ama "site" kayıtlı alan adı demek. Portal
 * aiotechs.cloud/genctekportal adresinde ve aynı alan adında başka uygulamalar
 * da barınıyor (bkz. lib/security/session.ts · çerez adının niye özelleştiği).
 * Onlar Lax'a göre AYNI sitedir, yani çerez gider.
 *
 * ---------------------------------------------------------------------------
 * BU KONTROLÜN SINIRI — ABARTILMAMALI
 * ---------------------------------------------------------------------------
 * `Origin` şema+host+porttan oluşur, YOL İÇERMEZ. Aynı host üzerindeki başka
 * bir uygulama (aiotechs.cloud/baska-uygulama) bu kontrol için AYNI kökendir ve
 * geçer. Yani buradaki kontrol, saldırganın KENDİ alan adından kurduğu klasik
 * CSRF'i kapatır — ki vakaların ezici çoğunluğu odur — ama aynı host'taki bir
 * komşu uygulamadan gelecek isteği ayırt edemez.
 *
 * O senaryoyu bir CSRF JETONU DA ÇÖZMEZ: aynı köken, tarayıcı için tek bir
 * güven alanıdır. Komşu uygulamadaki bir sayfa portalın yanıtlarını okuyabilir
 * (same-origin), çerezlerini görebilir, dolayısıyla jetonu da elde eder.
 * Gerçek ayrım ancak portalı kendi alt alan adına taşımakla kurulur. Bu yüzden
 * Session tablosundaki `csrfHash` bugün de bağlanmadı; gerekçe app/api'deki
 * çağrı yerlerinde değil burada duruyor ki bir dahaki incelemede "unutulmuş"
 * sanılmasın.
 */

export interface KokenKarari {
  gecerliMi: boolean;
  /** Reddedildiyse günlüğe yazılacak kısa sebep. */
  sebep?: string;
}

function hostCoz(adres: string): string | null {
  try {
    return new URL(adres).host || null;
  } catch {
    return null;
  }
}

/**
 * İsteğin kökeni bu siteye mi ait?
 *
 * ORIGIN YOKSA REDDEDİLİR (fail-closed). Tarayıcılar `fetch` ve form
 * gönderimlerinde POST için `Origin`'i HER ZAMAN yollar; başlığın olmaması
 * isteğin tarayıcıdan gelmediği anlamına gelir. İki ucumuz da tarayıcıdan
 * çağrılıyor (medya: components/gorsel-secici.tsx, başvuru: form sayfası),
 * dolayısıyla eksik başlığı geçirmenin bir bedeli yok ama kapatmanın kazancı
 * var: başlıksız istek üretmek, kontrolü atlamanın en kolay yoludur.
 *
 * @param siteAdresi Uygulamanın dışarıdan görünen adresi (lib/ortam ·
 *   siteAdresi()). Host başlığına ek olarak buna da bakılıyor: ikisi de
 *   isteğin kendisinden geldiği için tek başına biri yeterince sağlam değil.
 */
export function istekKokeniGecerliMi(
  basliklar: Headers,
  siteAdresi: string,
): KokenKarari {
  const koken = basliklar.get("origin");
  if (!koken) return { gecerliMi: false, sebep: "Origin başlığı yok" };

  const kokenHost = hostCoz(koken);
  if (!kokenHost) return { gecerliMi: false, sebep: "Origin çözümlenemedi" };

  const beklenen = new Set<string>();

  const yapilandirilan = hostCoz(siteAdresi);
  if (yapilandirilan) beklenen.add(yapilandirilan);

  // Vekil arkasında Host, Apache'nin yazdığı değerdir. X-Forwarded-Host varsa
  // zincirin İLKİ istenen host'tur (bu başlık ekleme zinciri değil, vekilin
  // koruduğu özgün istek bilgisidir).
  const iletilenHost = basliklar.get("x-forwarded-host");
  if (iletilenHost) {
    const ilk = iletilenHost.split(",")[0]?.trim();
    if (ilk) beklenen.add(ilk);
  }

  const host = basliklar.get("host");
  if (host) beklenen.add(host);

  if (!beklenen.has(kokenHost)) {
    return { gecerliMi: false, sebep: `Origin bu siteye ait değil (${kokenHost})` };
  }

  return { gecerliMi: true };
}
