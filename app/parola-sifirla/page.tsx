import Link from "next/link";
import { ayarlariOkuSessiz } from "@/lib/yonetim/ayar";

/**
 * PAROLA SIFIRLAMA — HENÜZ AÇIK DEĞİL (5 Eylül 2026).
 *
 * Sayfa "tek kullanımlık bağlantıyı e-posta adresinize göndereceğiz" diyen bir
 * form basıyordu ama ARKASINDA HİÇBİR ŞEY YOKTU: formun `action`'ı, sunucu
 * eylemi ve API ucu yoktu, `SMTP_URL` de boş (YAPILACAKLAR.md §3). Gönder'e
 * basan kişi sayfanın yeniden yüklenmesinden başka bir şey görmüyor, sonra da
 * gelmeyecek bir e-postayı bekliyordu.
 *
 * Çalışmayan bir formu çalışıyormuş gibi göstermek, kullanıcıyı bekleteceği
 * için sessiz bir hata değil YANLIŞ BİLGİDİR. Form kaldırıldı; yerine ne
 * yapılacağını söyleyen bir yönlendirme kondu. Akış yazıldığında (PasswordReset
 * tablosu şemada hazır duruyor) form geri gelir.
 *
 * İLETİŞİM ADRESİ GENEL AYARLARDAN: buraya elle bir adres yazılsaydı, kurum
 * adresi değiştiği gün bu sayfa eskimiş adrese yollamaya devam ederdi.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Parola sıfırlama · GençTek",
  description: "Panel parolanızı sıfırlamak için izlenecek yol.",
};

export default async function ForgotPasswordPage() {
  const ayarlar = await ayarlariOkuSessiz();
  const eposta = ayarlar["iletisim.eposta"];

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/">
          <span className="brand-mark">G</span>
          <span>GENÇ<span className="brand-accent">TEK</span></span>
        </Link>

        <div>
          <span className="eyebrow">Hesap kurtarma</span>
          <h1>Parola sıfırlama henüz açık değil.</h1>
          <p>
            Kendi kendine sıfırlama akışı kurulmadı: panel hesapları e-posta ile parola
            sıfırlayamıyor. Parolanızı unuttuysanız sistem yöneticinize başvurun, hesabınıza
            yeni bir parola tanımlasın.
          </p>
        </div>

        <div className="info-banner">
          <strong>Sistem yöneticisiyseniz:</strong> parolayı sunucuda{" "}
          <code>npm run parola -- &lt;e-posta&gt;</code> komutuyla değiştirebilirsiniz. Komut
          hesabın açık oturumlarını da kapatır ve denetim kaydına satır bırakır.
        </div>

        {eposta ? (
          <p>
            İletişim: <a href={`mailto:${eposta}`}>{eposta}</a>
          </p>
        ) : null}

        <Link className="text-link" href="/giris">Giriş ekranına dön</Link>
      </section>
    </main>
  );
}
