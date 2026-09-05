/**
 * SİTE İÇİ YOL TESTİ — TEK YERDE (5 Eylül 2026 · güvenlik incelemesi).
 *
 * Panelden girilen adresleri süzen yedi ayrı fonksiyon vardı (alt bilgi, üst
 * menü, Hakkında, zirve, temel etkinlik, yardımlaşma, sabit sayfa metinleri) ve
 * hepsi aynı kuralı kendi içinde yazıyordu: `metin.startsWith("/")` ise site
 * içi yoldur, geçir.
 *
 * BU KURAL EKSİKTİ. `//kotu.example` de eğik çizgiyle başlar ama tarayıcı için
 * site içi bir yol DEĞİL, şema-göreli bir DIŞ adrestir: `<a href="//kotu.example">`
 * kullanıcıyı doğrudan o siteye götürür. `/\kotu.example` de aynı kapıya çıkar,
 * çünkü tarayıcılar ters eğik çizgiyi eğik çizgiye normalleştirir.
 *
 * Sonuç, panel yetkisi olan birinin sitenin herhangi bir bağlantısını (alt
 * bilgi her sayfada, üst menü her sayfada) sessizce dışarı yönlendirebilmesiydi
 * — Hakkında kartının `adres` alanında ise sunucu tarafında `redirect()`
 * çağrıldığı için açık yönlendirmeye dönüşüyordu. Yetki gerektirdiği için
 * uzaktan sömürülebilir bir açık değil; ama içerik editörünün yetkisi "sayfa
 * yazmak"tır, "ziyaretçiyi başka siteye göndermek" değil.
 *
 * Dış adres yasak değil: `https://` yazan açıkça dış adres yazmış olur ve
 * arayüzde de öyle görünür. Kapatılan, dış adresin site içi yol KILIĞINDA
 * girilmesi.
 */

/** Değer, gerçekten site içi bir yol mu? Şema-göreli adresler (`//host`,
    `/\host`) dış adres sayılır ve buradan geçmez. */
export function siteIciYolMu(metin: string): boolean {
  if (!metin.startsWith("/")) return false;
  const ikinci = metin[1];
  return ikinci !== "/" && ikinci !== "\\";
}
