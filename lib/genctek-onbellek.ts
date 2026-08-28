/**
 * GENÇTEK UYGULAMASINDAN OKUNANLARIN ÖNBELLEĞİ (28 Ağustos 2026 · istek: "ilk
 * açılışta hata veriyor bide" — sunucu günlüğü `TypeError: fetch failed /
 * ECONNREFUSED` ile doluyordu).
 *
 * NEDEN NEXT'İN KENDİ `fetch` ÖNBELLEĞİ KULLANILMIYOR: `next: { revalidate }`
 * ile okunan bir adres bayatladığında Next tazelemeyi ARKA PLANDA yapıyor ve o
 * isteğin hatasını kendi eliyle `console.error`'a yazıyor
 * (node_modules/next/dist/server/lib/patch-fetch.js · `pendingRevalidate
 * .catch(console.error)`). O çağrı bizim `try/catch`imizin İÇİNDEN GEÇMEZ:
 * platform kapalıyken sayfa sorunsuz 200 dönüyor ama günlüğe, kimsenin
 * bakmadığı ve hiçbir şeyi bozmayan yığınlarca hata basılıyordu. Gerçek bir
 * arıza günlüğe düştüğünde bu gürültünün arasında kaybolurdu.
 *
 * BURADAKİ ÖNBELLEK SÜREÇ İÇİNDE, tek bir Node süreci için geçerli. Birden çok
 * kopya çalıştığında her kopya kendi kopyasını tutar; sayılar zaten birkaç
 * dakikalık toplamlar, kopyalar arası saniyelik fark önemsiz. Paylaşımlı bir
 * önbellek (Redis vb.) bu iş için fazlasıyla ağır olurdu.
 *
 * `globalThis` ÜZERİNDE DURUYOR: `next dev` modülleri sık yeniden yüklüyor,
 * modül düzeyinde tutulan bir Map her yenilemede sıfırlanır ve önbellek
 * geliştirmede hiç ısınmazdı (aynı gerekçe: gençtek uygulamasında lib/db.ts).
 */

type Kayit = { deger: unknown; gecerlilik: number };

const kap = globalThis as unknown as { genctekOnbellek?: Map<string, Kayit> };
const onbellek = (kap.genctekOnbellek ??= new Map<string, Kayit>());

/**
 * BAŞARISIZLIK DA ÖNBELLEKLENİR, AMA KISA SÜRE.
 *
 * Platform kapalıyken her sayfa gösterimi yeniden bağlanmayı denerdi: ana
 * sayfada iki ayrı okuma var ve her tazelemede ikisi de sıfırdan çakılırdı.
 * On saniye, uygulama ayağa kalktıktan sonra portalın onu fark etmesi için
 * yeterince kısa, boşuna denemeleri kesmek için yeterince uzun.
 */
const HATA_SANIYE = 10;

/**
 * `uretici`nin sonucunu `saniye` boyunca saklar.
 *
 * `uretici` HATA YUTAR, FIRLATMAZ: ağ hatasını `null`/boş listeye çeviren yer
 * çağıranın kendisidir (genctek-istatistik, genctek-etkinlik). Bu katman
 * "değer var mı yok mu" ile ilgilenir, hatanın ne olduğuyla değil — bu yüzden
 * burada ikinci bir `try/catch` yok; olmayan bir hatayı yutan sarmalayıcı,
 * ileride gerçekten fırlayan bir hatayı da sessizce örterdi.
 *
 * BOŞ SONUÇ (null / boş dizi) KISA SÜRE TUTULUR: platform o an cevap
 * veremediyse beş dakika boyunca "veri yok" demeye devam etmenin anlamı yok —
 * `doluMu` bu ayrımı çağırana bırakıyor, çünkü "dolu" her okumada başka şey:
 * sayılar için nesnenin kendisi, etkinlikler için listenin boş olmaması.
 */
export async function onbellekliOku<T>(
  anahtar: string,
  saniye: number,
  uretici: () => Promise<T>,
  doluMu: (deger: T) => boolean,
): Promise<T> {
  const simdi = Date.now();
  const kayitli = onbellek.get(anahtar);
  if (kayitli && kayitli.gecerlilik > simdi) return kayitli.deger as T;

  const deger = await uretici();
  const omur = (doluMu(deger) ? saniye : HATA_SANIYE) * 1000;
  onbellek.set(anahtar, { deger, gecerlilik: simdi + omur });
  return deger;
}
