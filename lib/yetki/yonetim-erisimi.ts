import type { RoleCode } from "@prisma/client";
import { oturumKullanicisi } from "@/lib/auth/oturum";

/*
 * YÖNETİM YAZMA UÇLARININ KAPISI.
 *
 * proxy.ts /yonetim SAYFALARINI üretimde oturum çerezine bağlıyor ama iki delik
 * vardı (27 Ağustos 2026 güvenlik denetimi):
 *   1. /api yolları proxy kontrolünün dışında.
 *   2. Kontrolün kendisi çerezin YALNIZCA VARLIĞINA bakıyordu; içeriğinin
 *      geçerli bir oturuma karşılık gelip gelmediğine değil.
 *
 * İkincisi ölümcüldü: `Cookie: __Host-genctekportal_session=herhangi-bir-sey`
 * gönderen biri sahte çerezle kapıyı geçiyor, medya listesini/yüklemesini ve
 * yetkisi kendi içinde sorulmayan sunucu eylemlerini (tema, haber, etkinlik,
 * yönlendirme) çalıştırabiliyordu. Artık çerezin değeri gerçek, süresi geçmemiş
 * ve iptal edilmemiş bir oturuma karşılık gelmek zorunda.
 *
 * Geliştirmede kapı açık: giriş formu yerelde çoğu zaman veritabanına bağlı
 * değil ve panel login olmadan denenebiliyor.
 */
export async function yonetimErisimiVarMi(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return true;
  return (await oturumKullanicisi()) !== null;
}

// İçerik (tema, haber, etkinlik, yönlendirme) düzenleyebilen roller. Şu an tek
// yönetici SYSTEM_ADMIN; diğerleri ileride bu işleri devralabilsin diye burada.
const ICERIK_ROLLERI: RoleCode[] = ["SYSTEM_ADMIN", "CONTENT_MANAGER", "EDITOR", "PUBLISHER"];

/*
 * İçerik yazan sunucu eylemleri için guard. yonetimErisimiVarMi yalnızca
 * "geçerli oturum var mı" der; bu ayrıca "bu oturumun içerik yetkisi var mı"
 * diye sorar. Eylemler hata mesajı taşıyamadığı için çağıran taraf, false
 * dönünce sessizce çıkar (işlem yapılmaz, sayfa eski hâliyle tazelenir).
 */
export async function icerikYonetebilirMi(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return true;
  const kullanici = await oturumKullanicisi();
  return Boolean(kullanici) && kullanici!.roller.some((rol) => ICERIK_ROLLERI.includes(rol));
}
