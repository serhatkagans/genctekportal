import { Icon } from "./icons";
import type { AcikEtkinlik } from "@/lib/genctek-etkinlik";
import { tarihYaz } from "@/lib/tarih";

/**
 * GENÇTEK ETKİNLİK KARTI — ana sayfadaki "Takip edilebilecek etkinlikler".
 *
 * Kart, portalın kendi içine değil GENÇTEK UYGULAMASINA bağlanır; başvuru orada
 * alınıyor ve o sayfa GİRİŞ İSTİYOR (20 Ağustos 2026 · istek: "herkes
 * başvuramayacak, az önceki uygulamadaki sayfaya gitmesi gerek ama girişten
 * sonra"). Bu yüzden bağlantının altında ne olacağı açıkça yazılı: ziyaretçi
 * tıkladığında giriş ekranıyla karşılaşacağını önceden bilmeli, yoksa bağlantı
 * bozuk sanılır.
 *
 * `rel="noreferrer"` DEĞİL ama `noopener` var: hedef aynı kurumun uygulaması,
 * yönlendiren bilgisini gizlemeye gerek yok; yeni sekmenin bu sayfaya
 * `window.opener` üzerinden erişmesine ise hiçbir koşulda gerek yok.
 *
 * Sınıflar portalın mevcut kart dilinden (`content-card`, `card-body`, `chip`,
 * `meta-row`): haber kartlarıyla aynı ızgarada aynı görünsün diye yeni bir
 * görsel dil açılmadı.
 */

const DURUM_ETIKETLERI: Record<AcikEtkinlik["basvuruDurumu"], string> = {
  ACIK: "Başvuru açık",
  ACILMADI: "Başvuru yakında",
  KAPANDI: "Başvuru kapandı",
};

export function EtkinlikKarti({ etkinlik }: { etkinlik: AcikEtkinlik }) {
  /*
   * Çok günlü etkinlikte iki tarih birden yazılır: "13 Nisan 2026" diyen bir
   * kart, üç gün sürecek bir programı tek güne indirirdi.
   */
  const tarihMetni = etkinlik.bitisTarihi
    ? `${tarihYaz(etkinlik.tarih)} – ${tarihYaz(etkinlik.bitisTarihi)}`
    : tarihYaz(etkinlik.tarih);

  return (
    <a
      className="content-card etkinlik-karti"
      href={etkinlik.katilimAdresi}
      target="_blank"
      rel="noopener"
    >
      <div className="card-visual visual-1">{tarihYaz(etkinlik.tarih)}</div>
      <div className="card-body">
        <span className="chip">
          {DURUM_ETIKETLERI[etkinlik.basvuruDurumu]}
        </span>
        <h3>{etkinlik.ad}</h3>
        {etkinlik.aciklama ? <p>{etkinlik.aciklama}</p> : null}
        <div className="meta-row">
          <span>
            <Icon name="location" />
            {etkinlik.kapsamEtiketi}
            {etkinlik.il ? ` · ${etkinlik.il}` : ""}
          </span>
          <span>
            <Icon name="calendar" />
            {tarihMetni}
          </span>
          {etkinlik.basvuruDurumu === "ACIK" ? (
            <span>Son başvuru {tarihYaz(etkinlik.basvuruBitis)}</span>
          ) : null}
        </div>
        {/*
          Giriş uyarısı kartın SON satırı: kişi başlığı ve tarihi okuduktan
          sonra "peki nasıl katılırım" diye sorduğunda cevabı orada bulur.
        */}
        <span className="etkinlik-giris-notu">
          Başvuru GençTek uygulamasında; giriş yaptıktan sonra bu etkinliğin
          sayfası açılır.
        </span>
      </div>
    </a>
  );
}
