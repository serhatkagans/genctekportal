"use client";
import { useState } from "react";
import { GorselSecici } from "./gorsel-secici";
import { Icon } from "./icons";
// Veritabanına dokunan lib/altbilgi.ts değil, saf tip dosyası: bu bileşen
// istemcide çalışıyor ve postgres sürücüsü tarayıcı paketine girmemeli.
import type { Altbilgi, AltbilgiBaglantisi, AltbilgiMarkasi } from "@/lib/altbilgi-govde";
import { altbilgiKaydetAction } from "@/app/yonetim/altbilgi/actions";

/**
 * ALT BİLGİ EDİTÖRÜ (4 Eylül 2026 · istek: "footer için de ayar yap").
 *
 * İki liste var: üstteki marka sütunları ve alttaki bağlantı satırı. Her ikisi
 * de tek bir gizli alanda JSON olarak taşınıyor — sıralama değiştiğinde form
 * alan adlarını yeniden numaralamak gerekmesin diye.
 *
 * E-POSTA BURADA AMA KAYDI GENEL AYARLARDA: alt bilgiyi düzenleyen kişi
 * adresi de burada görsün diye alan bu ekranda, ama değer GlobalSetting'e
 * yazılıyor — aynı bilgi iki yerde tutulmuyor (bkz. lib/altbilgi.ts).
 */

type Props = { altbilgi: Altbilgi; eposta: string; kaydedildi?: boolean };

export function AltbilgiEditoru({ altbilgi, eposta, kaydedildi }: Props) {
  const [markalar, setMarkalar] = useState<AltbilgiMarkasi[]>(altbilgi.markalar);
  const [baglantilar, setBaglantilar] = useState<AltbilgiBaglantisi[]>(altbilgi.baglantilar);
  const [secici, setSecici] = useState<number | null>(null);

  function tasi<T>(liste: T[], sira: number, yon: -1 | 1): T[] {
    const hedef = sira + yon;
    if (hedef < 0 || hedef >= liste.length) return liste;
    const kopya = [...liste];
    [kopya[sira], kopya[hedef]] = [kopya[hedef], kopya[sira]];
    return kopya;
  }

  return (
    <>
      {kaydedildi ? <div className="info-banner">Alt bilgi kaydedildi ve sitede yayımlandı.</div> : null}
      <div className="info-banner">
        Alt bilgi sitenin HER SAYFASINDA görünür. Üstteki sütunlar kurum logoları ve GençTek markası,
        alttaki satır ise bağlantılar ve iletişim adresidir.
      </div>

      <form action={altbilgiKaydetAction} className="admin-panel">
        <input type="hidden" name="govde" value={JSON.stringify({ markalar, baglantilar })} />

        {/* MARKA SÜTUNLARI: soldan sağa bu sırayla basılıyor. */}
        <div className="blok-editor">
          <div className="blok-editor-baslik">
            <h2>Marka sütunları</h2>
            <span>{markalar.length} sütun</span>
          </div>

          {markalar.map((marka, i) => (
            <article className="blok-kutusu" key={i}>
              <header className="blok-kutusu-ust">
                <strong>
                  {String(i + 1).padStart(2, "0")} · {marka.tur === "genctek" ? "GençTek markası" : "Kurum logosu"}
                </strong>
                <div className="blok-araclar">
                  <button type="button" onClick={() => setMarkalar(tasi(markalar, i, -1))} disabled={i === 0} aria-label="Sola al">↑</button>
                  <button type="button" onClick={() => setMarkalar(tasi(markalar, i, 1))} disabled={i === markalar.length - 1} aria-label="Sağa al">↓</button>
                  <button type="button" className="blok-sil" aria-label="Sütunu sil"
                    onClick={() => setMarkalar(markalar.filter((_, j) => j !== i))}>✕</button>
                </div>
              </header>

              {marka.tur === "genctek" ? (
                <p className="ayar-aciklama">
                  Sitenin kendi yazı markası; görseli yok, yazıyla basılır. Yalnızca sırası ve gittiği
                  adres değiştirilebilir.
                </p>
              ) : (
                <>
                  <label>
                    Kurum adı
                    <input value={marka.ad} placeholder="MEB YEĞİTEK"
                      onChange={(e) => setMarkalar(markalar.map((m, j) => j === i ? { ...m, ad: e.target.value } : m))} />
                    <small>Logo dosyası bulunamazsa bu ad yazıyla basılır; alternatif metin olarak da kullanılır.</small>
                  </label>
                  <label>
                    Logo yolu
                    <input value={marka.logo} placeholder="/logo-yegitek.png"
                      onChange={(e) => setMarkalar(markalar.map((m, j) => j === i ? { ...m, logo: e.target.value } : m))} />
                  </label>
                  {marka.logo ? <img className="altbilgi-logo-onizleme" src={marka.logo} alt="" /> : null}
                  <div className="blok-ekle">
                    <button type="button" className="button button-secondary" onClick={() => setSecici(i)}>
                      <Icon name="image" />Kütüphaneden seç
                    </button>
                  </div>
                </>
              )}

              <label>
                Bağlantı adresi
                <input value={marka.adres} placeholder="https://yegitek.meb.gov.tr"
                  onChange={(e) => setMarkalar(markalar.map((m, j) => j === i ? { ...m, adres: e.target.value } : m))} />
                <small>Dış adresler yeni sekmede açılır. Boş bırakılırsa sütun tıklanamaz olur.</small>
              </label>
            </article>
          ))}

          <div className="blok-ekle">
            <button type="button" className="button button-secondary"
              onClick={() => setMarkalar([...markalar, { tur: "logo", ad: "", logo: "", adres: "" }])}>
              <Icon name="plus" />Kurum logosu ekle
            </button>
            <button type="button" className="button button-secondary"
              onClick={() => setMarkalar([...markalar, { tur: "genctek", ad: "GençTek", logo: "", adres: "/" }])}>
              <Icon name="plus" />GençTek markası ekle
            </button>
          </div>
        </div>

        {/* ALT SATIR: bağlantılar ve e-posta yan yana basılıyor. */}
        <div className="blok-editor">
          <div className="blok-editor-baslik">
            <h2>Alt satır bağlantıları</h2>
            <span>{baglantilar.length} bağlantı</span>
          </div>
          <div className="blok-ogeler">
            {baglantilar.map((baglanti, i) => (
              <div className="blok-oge" key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div className="editor-ikili">
                  <input value={baglanti.etiket} placeholder="KVKK ve Gizlilik"
                    onChange={(e) => setBaglantilar(baglantilar.map((b, j) => j === i ? { ...b, etiket: e.target.value } : b))} />
                  <input value={baglanti.adres} placeholder="/kvkk"
                    onChange={(e) => setBaglantilar(baglantilar.map((b, j) => j === i ? { ...b, adres: e.target.value } : b))} />
                </div>
                <button type="button" className="blok-sil" aria-label="Bağlantıyı sil"
                  onClick={() => setBaglantilar(baglantilar.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button type="button" className="button button-secondary"
              onClick={() => setBaglantilar([...baglantilar, { etiket: "", adres: "" }])}>
              <Icon name="plus" />Bağlantı ekle
            </button>
            <small>Etiketi ya da adresi boş bırakılan satır basılmaz.</small>
          </div>

          <label>
            İletişim e-postası
            <input name="eposta" defaultValue={eposta} placeholder="genctek@eba.gov.tr" />
            <small>
              Bağlantıların yanında görünür. Bu değer <strong>Genel ayarlar</strong> ekranındaki
              iletişim e-postasıyla aynıdır; birinden değiştirmek ikisini birden değiştirir.
            </small>
          </label>
        </div>

        <div className="blok-ekle">
          <button className="button button-primary" type="submit">Değişiklikleri kaydet</button>
        </div>
      </form>

      {secici !== null ? (
        <GorselSecici
          baslik="Kurum logosu seç"
          onSec={(oge) => {
            setMarkalar((eski) => eski.map((m, j) => (j === secici ? { ...m, logo: oge.url } : m)));
            setSecici(null);
          }}
          onKapat={() => setSecici(null)}
        />
      ) : null}
    </>
  );
}
