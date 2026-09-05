"use client";
import { useState } from "react";
import { Icon } from "./icons";
// Veritabanına dokunan lib/sayfa-metni.ts değil, saf tip dosyası: bu bileşen
// istemcide çalışıyor ve postgres sürücüsü tarayıcı paketine girmemeli.
import type { KvkkBolumu, KvkkMetni } from "@/lib/sayfa-metni-govde";
import { kvkkKaydetAction } from "@/app/yonetim/kvkk/actions";

/**
 * KVKK AYDINLATMA METNİ EDİTÖRÜ (5 Eylül 2026 · istek: "hepsini yap").
 *
 * Bölümler, maddeler ve başvuru satırları tek bir gizli alanda JSON olarak
 * taşınıyor — sıralama değiştiğinde form alan adlarını yeniden numaralamak
 * gerekmesin diye (alt bilgi editöründeki kalıp).
 *
 * BÖLÜM NUMARASI BAŞLIĞIN PARÇASI: "1. Veri Sorumlusu". Otomatik numaralama
 * yapılmıyor, çünkü hukuki metinde madde numarası bir atıf — araya bölüm
 * eklendiğinde numaraları yazan kişi bilerek düzeltmeli.
 */

type Props = { metin: KvkkMetni; kaydedildi?: boolean };

const BOS_BOLUM: KvkkBolumu = { baslik: "", giris: "", maddeler: [], satirlar: [] };

export function KvkkEditoru({ metin, kaydedildi }: Props) {
  const [bolumler, setBolumler] = useState<KvkkBolumu[]>(metin.bolumler);

  function bolumuDegistir(sira: number, yeni: Partial<KvkkBolumu>) {
    setBolumler(bolumler.map((b, i) => (i === sira ? { ...b, ...yeni } : b)));
  }

  function tasi(sira: number, yon: -1 | 1) {
    const hedef = sira + yon;
    if (hedef < 0 || hedef >= bolumler.length) return;
    const kopya = [...bolumler];
    [kopya[sira], kopya[hedef]] = [kopya[hedef], kopya[sira]];
    setBolumler(kopya);
  }

  return (
    <>
      {kaydedildi ? <div className="info-banner">Aydınlatma metni kaydedildi ve sitede yayımlandı.</div> : null}
      <div className="info-banner">
        <code>/kvkk</code> adresindeki aydınlatma metni. Bu bir <strong>hukuki metindir</strong>: bölüm
        numaraları başlığın parçası ve metne atıf yapan başka belgeler olabilir — bölüm eklerken ya da
        silerken numaraları elle düzeltin.
      </div>

      <form action={kvkkKaydetAction} className="admin-panel">
        <input type="hidden" name="bolumler" value={JSON.stringify(bolumler)} />

        <div className="blok-editor">
          <div className="blok-editor-baslik"><h2>Sayfa başlığı</h2><span>Metnin üstündeki blok</span></div>

          <label>
            Üst etiket
            <input name="ustEtiket" defaultValue={metin.ustEtiket} placeholder="Yasal bilgiler" />
          </label>
          <label>
            Başlık
            <input name="baslik" defaultValue={metin.baslik} placeholder="Kişisel Verilerin İşlenmesi Aydınlatma Metni" />
          </label>
          <label>
            Spot metin
            <textarea name="spot" rows={4} defaultValue={metin.spot} />
            <small>Başlığın altındaki giriş paragrafı.</small>
          </label>

          <div className="editor-ikili">
            <label>
              Tarayıcı sekmesi başlığı
              <input name="seoBaslik" defaultValue={metin.seoBaslik} placeholder="KVKK Aydınlatma Metni · GençTek" />
            </label>
            <label>
              Arama motoru açıklaması
              <input name="seoAciklama" defaultValue={metin.seoAciklama} />
            </label>
          </div>
        </div>

        <div className="blok-editor">
          <div className="blok-editor-baslik">
            <h2>Bölümler</h2>
            <span>{bolumler.length} bölüm</span>
          </div>

          {bolumler.map((bolum, i) => (
            <article className="blok-kutusu" key={i}>
              <header className="blok-kutusu-ust">
                <strong>{String(i + 1).padStart(2, "0")} · {bolum.baslik || "Başlıksız bölüm"}</strong>
                <div className="blok-araclar">
                  <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0} aria-label="Yukarı al">↑</button>
                  <button type="button" onClick={() => tasi(i, 1)} disabled={i === bolumler.length - 1} aria-label="Aşağı al">↓</button>
                  <button type="button" className="blok-sil" aria-label="Bölümü sil"
                    onClick={() => setBolumler(bolumler.filter((_, j) => j !== i))}>✕</button>
                </div>
              </header>

              <label>
                Bölüm başlığı
                <input value={bolum.baslik} placeholder="1. Veri Sorumlusu"
                  onChange={(e) => bolumuDegistir(i, { baslik: e.target.value })} />
                <small>Numarayı da siz yazarsınız; sıra değiştiğinde kendiliğinden güncellenmez.</small>
              </label>

              <label>
                Paragraflar
                <textarea rows={4} value={bolum.giris}
                  onChange={(e) => bolumuDegistir(i, { giris: e.target.value })} />
                <small>Bir satır boş bırakıldığında yeni paragraf başlar. Listenin üstünde basılır.</small>
              </label>

              {/* MADDE LİSTESİ: başlığı olan madde kalın etiketle basılır
                  ("Hizmet Sunumu: …"), olmayan düz cümledir. */}
              <div className="blok-ogeler">
                <strong className="ayar-aciklama">Madde listesi ({bolum.maddeler.length})</strong>
                {bolum.maddeler.map((madde, j) => (
                  <div className="blok-oge" key={j}>
                    <span>{String(j + 1).padStart(2, "0")}</span>
                    <div className="editor-ikili">
                      <input value={madde.baslik} placeholder="Kalın etiket (boş bırakılabilir)"
                        onChange={(e) => bolumuDegistir(i, {
                          maddeler: bolum.maddeler.map((m, k) => (k === j ? { ...m, baslik: e.target.value } : m)),
                        })} />
                      <input value={madde.metin} placeholder="Madde metni"
                        onChange={(e) => bolumuDegistir(i, {
                          maddeler: bolum.maddeler.map((m, k) => (k === j ? { ...m, metin: e.target.value } : m)),
                        })} />
                    </div>
                    <button type="button" className="blok-sil" aria-label="Maddeyi sil"
                      onClick={() => bolumuDegistir(i, { maddeler: bolum.maddeler.filter((_, k) => k !== j) })}>✕</button>
                  </div>
                ))}
                <button type="button" className="button button-secondary"
                  onClick={() => bolumuDegistir(i, { maddeler: [...bolum.maddeler, { baslik: "", metin: "" }] })}>
                  <Icon name="plus" />Madde ekle
                </button>
              </div>

              {/* BAŞVURU SATIRLARI: adres bloğu, madde imsiz tek paragrafta
                  alt alta basılır (7. bölümdeki iletişim bilgileri). */}
              <div className="blok-ogeler">
                <strong className="ayar-aciklama">Adres/iletişim satırları ({bolum.satirlar.length})</strong>
                {bolum.satirlar.map((satir, j) => (
                  <div className="blok-oge" key={j}>
                    <span>{String(j + 1).padStart(2, "0")}</span>
                    <div className="editor-ikili">
                      <input value={satir.metin} placeholder="Düz metin (örn. Telefon:)"
                        onChange={(e) => bolumuDegistir(i, {
                          satirlar: bolum.satirlar.map((s, k) => (k === j ? { ...s, metin: e.target.value } : s)),
                        })} />
                      <input value={satir.baglantiMetni} placeholder="Bağlantı yazısı (boş bırakılabilir)"
                        onChange={(e) => bolumuDegistir(i, {
                          satirlar: bolum.satirlar.map((s, k) => (k === j ? { ...s, baglantiMetni: e.target.value } : s)),
                        })} />
                      <input value={satir.adres} placeholder="mailto: · tel: · https://"
                        onChange={(e) => bolumuDegistir(i, {
                          satirlar: bolum.satirlar.map((s, k) => (k === j ? { ...s, adres: e.target.value } : s)),
                        })} />
                    </div>
                    <button type="button" className="blok-sil" aria-label="Satırı sil"
                      onClick={() => bolumuDegistir(i, { satirlar: bolum.satirlar.filter((_, k) => k !== j) })}>✕</button>
                  </div>
                ))}
                <button type="button" className="button button-secondary"
                  onClick={() => bolumuDegistir(i, { satirlar: [...bolum.satirlar, { metin: "", baglantiMetni: "", adres: "" }] })}>
                  <Icon name="plus" />Satır ekle
                </button>
                <small>Adres alanı yalnızca site içi yol, <code>https://</code>, <code>mailto:</code> ve <code>tel:</code> kabul eder.</small>
              </div>
            </article>
          ))}

          <div className="blok-ekle">
            <button type="button" className="button button-secondary"
              onClick={() => setBolumler([...bolumler, { ...BOS_BOLUM }])}>
              <Icon name="plus" />Bölüm ekle
            </button>
          </div>
        </div>

        <div className="blok-ekle">
          <button className="button button-primary" type="submit">Değişiklikleri kaydet</button>
        </div>
      </form>
    </>
  );
}
