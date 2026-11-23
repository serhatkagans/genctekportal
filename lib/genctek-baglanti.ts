/**
 * GENÇTEK UYGULAMASINA (PLATFORMA) AÇILAN KAPILAR.
 *
 * Portal tanıtım sitesidir: kayıt, başvuru ve katılım işleri ayrı bir
 * uygulamada — GençTek panelinde — yürüyor. Buradan oraya giden her bağlantı
 * bu dosyadan geçer ki adres tek yerde dursun; iki üç bileşende ayrı ayrı
 * yazılsaydı, alan adı değiştiğinde biri geride kalır ve kimse fark etmezdi.
 */

/*
 * Uygulamanın dışarıdan görünen adresi. Portal ile aynı sunucuda olmak zorunda
 * değil, o yüzden ortamdan geliyor (bkz. .env.example · GENCTEK_APP_URL).
 */
export const GENCTEK_ADRESI = (process.env.GENCTEK_APP_URL ?? "")
  .trim()
  .replace(/\/$/, "");

/**
 * Platforma giriş kapısı.
 *
 * `nereye` yoksa (üst menü, "Ekosisteme Katıl" kartları) platformun KÖKÜNE
 * gidilir: orası giriş ve kayıt düğmelerini birlikte sunan vitrin sayfası.
 * Doğrudan /giris'e atmak kayıt olmamış ziyaretçiyi yanlış kapıya koyuyordu.
 *
 * `nereye` verilirse (etkinlik kartları) giriş ekranına gidilir ve kişi
 * girişten SONRA oraya bırakılır — uygulamanın giriş ekranı bu parametreyi
 * tanıyor ve uygulama dışına çıkan değerleri eliyor (bkz. uygulamada
 * lib/auth/donus-yolu.ts). Vitrin bu parametreyi taşımaz, o yüzden burada
 * kök kullanılamaz.
 *
 * Adres tanımlanmamışsa portalın kendi katılım sayfasına düşülür: tanıtım
 * sitesindeki bir düğmenin hiçbir yere gitmemesi, yanlış yere gitmesinden de
 * kötüdür.
 */
export function genctekGirisAdresi(nereye?: string): string {
  if (!GENCTEK_ADRESI) return "/katilim";
  if (!nereye) return GENCTEK_ADRESI;
  return `${GENCTEK_ADRESI}/giris?nereye=${encodeURIComponent(nereye)}`;
}
