const uygulamaOneki = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export function uygulamaYolu(yol: string): string {
  const mutlakYol = yol.startsWith("/") ? yol : `/${yol}`;
  // Ek zaten duruyorsa ikinci kez konmaz: proxy'deki yönlendirme kurallarının
  // hedefi kullanıcı verisi ve ekli de yazılmış olabiliyor.
  if (uygulamaOneki && (mutlakYol === uygulamaOneki || mutlakYol.startsWith(`${uygulamaOneki}/`))) return mutlakYol;
  return `${uygulamaOneki}${mutlakYol}`;
}

/* API uçlarının adresi HER ZAMAN buradan geçmeli.
   next.config.ts'te trailingSlash açık: eğik çizgisiz bir /api adresine
   yapılan çağrı 308 alır ve fetch gövdeyi ikinci kez gönderir — başvuru
   formunun 8 MB'a kadar eki için gerçek bir maliyet. Eğik çizgiyi tek tek
   çağrı yerlerinde hatırlamak yerine burada ekliyoruz ki yeni yazılan bir
   çağrı da sessizce bu tuzağa düşmesin. Sorgu dizesi ayrı eklenir. */
export function apiYolu(yol: string): string {
  const temiz = yol.replace(/\/+$/, "");
  return `${uygulamaYolu(temiz)}/`;
}

// Veritabanında ve içerik dosyalarında duran görsel yolları site köküne göre
// yazılmıştır ("/temalar/espor.jpg"). Uygulama bir alt dizinde yayınlandığında
// bunların önüne ek gelmeli, yoksa tarayıcı görseli alan adının kökünde arar.
//
// uygulamaYolu'ndan ayrı duruyor çünkü burada gelen değer kullanıcı verisi:
// dış adres ya da data: URI olabilir, ve aynı değer iki kez geçebilir.
// Bu yüzden yalnızca site içi yollara, yalnızca bir kez ek uygulanır.
export function gorselYolu(kaynak: string | null | undefined): string {
  const deger = (kaynak ?? "").trim();
  if (!deger) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(deger) || deger.startsWith("//")) return deger;
  if (!deger.startsWith("/")) return deger;
  if (uygulamaOneki && (deger === uygulamaOneki || deger.startsWith(`${uygulamaOneki}/`))) return deger;
  return `${uygulamaOneki}${deger}`;
}

// Sitenin dışarıdan görünen tam adresi: site haritası, robots.txt ve paylaşım
// önizlemeleri (OG) mutlak adres ister. .env'deki APP_URL alt dizin ekini de
// taşır ("https://.../genctekportal"). Tanımsızsa yerel geliştirme adresi.
export function siteAdresi(): string {
  return (process.env.APP_URL ?? "http://localhost:3010").replace(/\/$/, "");
}
