import { redirect } from "next/navigation";

/**
 * KURTARMA KODU EKRANI — İKİ ADIMLI DOĞRULAMAYLA BİRLİKTE BEKLİYOR
 * (5 Eylül 2026 · güvenlik incelemesi).
 *
 * Burada da işlemeyen bir form vardı: "MFA kurulurken verilen tek kullanımlık
 * kodlardan birini girin" diyordu ama MFA hiç kurulmuyor, dolayısıyla kimsenin
 * elinde böyle bir kod yok ve formun `action`'ı da yoktu.
 *
 * Ayrı bir "burası da yok" ekranı basmak yerine /mfa'ya yönlendiriliyor: iki
 * ekranın söyleyeceği aynı şey ve durumun tek bir yerde yazılı olması, akış
 * yazıldığında ikisini birden güncellemeyi unutma riskini kaldırıyor.
 */
export default function KurtarmaSayfasi() {
  redirect("/mfa");
}
