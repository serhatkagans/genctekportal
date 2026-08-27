import type { ReactNode } from "react";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";

/*
 * /yonetim'İN TEK KAPISI (27 Ağustos 2026 güvenlik denetimi).
 *
 * proxy.ts yönetim yollarını yalnızca çerezin VARLIĞINA bakarak koruyordu;
 * `Cookie: __Host-genctekportal_session=herhangi-bir-sey` ile aşılabiliyordu.
 * Duyarlı sayfalar (başvurular, kullanıcılar, denetim, ayarlar) kendi içinde
 * gerçek oturumu doğruluyordu ama içerik listeleri, medya, koordinatör ve
 * belge sayfaları yalnızca proxy'ye güveniyordu.
 *
 * Bu layout /yonetim altındaki HER sayfadan önce sunucuda çalışır ve değeri
 * doğrulanmış, süresi geçmemiş bir oturum şart koşar; yoksa /giris'e
 * yönlendirir. Böylece tek tek sayfa korumasına gerek kalmaz ve ileride
 * eklenen bir yönetim sayfası da kapının dışında kalamaz.
 *
 * Yazma işlemleri ayrıca kendi eylemlerinde yetkiye göre korunuyor (savunma
 * derinliği): bu layout "giriş yapmış mı", eylemler "bu işi yapabilir mi" der.
 */
export const dynamic = "force-dynamic";

export default async function YonetimLayout({ children }: { children: ReactNode }) {
  await oturumKullanicisiZorunlu();
  return <>{children}</>;
}
