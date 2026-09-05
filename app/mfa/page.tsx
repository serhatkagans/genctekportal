import Link from "next/link";

/**
 * İKİ ADIMLI DOĞRULAMA — HENÜZ KURULMADI (5 Eylül 2026 · güvenlik incelemesi).
 *
 * Bu sayfa altı haneli kod isteyen bir form basıyordu ama `action`'ı yoktu:
 * hiçbir uca bağlı değildi, "Doğrula" düğmesi sayfayı yeniden yüklüyordu.
 * Girişte de `mfaEnabled` okunuyor ama sorulmuyordu — yani ikinci adım
 * varmış gibi görünüyor, gerçekte hiç uygulanmıyordu.
 *
 * Var olmayan bir korumayı varmış gibi göstermek, olmayan bir korumadan daha
 * kötüdür: yönetici ona güvenip parola politikasını gevşetebilir. Form
 * kaldırıldı; giriş tarafı da artık bayrağı görünce sessizce geçmek yerine
 * reddediyor (lib/auth/giris.ts).
 *
 * TOTP altyapısı hazır duruyor (lib/security/totp.ts · createTotpEnrollment,
 * verifyTotp, kurtarma kodları) ve şemada `totpSecretEncrypted` alanı var;
 * eksik olan kayıt akışı, giriş dalı ve bu ekran.
 */
export const metadata = {
  title: "İki adımlı doğrulama · GençTek",
  description: "İki adımlı doğrulamanın portaldaki durumu.",
};

export default function MfaSayfasi() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/">
          <span className="brand-mark">G</span>
          <span>GENÇ<span className="brand-accent">TEK</span></span>
        </Link>

        <div>
          <span className="eyebrow">İki adımlı doğrulama</span>
          <h1>İki adımlı doğrulama henüz kurulmadı.</h1>
          <p>
            Portalda ikinci adım sorulmuyor; giriş yalnızca e-posta ve parolayla yapılıyor.
            Bu ekran, doğrulama akışı yazıldığında kod isteyecek.
          </p>
        </div>

        <div className="info-banner">
          Hesabınızı korumak için uzun ve size özel bir parola kullanın. Art arda beş hatalı
          denemede hesap 15 dakika kilitlenir; girişler denetim kaydına yazılır.
        </div>

        <Link className="text-link" href="/giris">Giriş ekranına dön</Link>
      </section>
    </main>
  );
}
