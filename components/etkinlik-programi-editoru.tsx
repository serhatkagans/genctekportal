"use client";
import Link from "next/link";
import { useState } from "react";
import { GorselSecici } from "./gorsel-secici";
import { Icon } from "./icons";
import type { EtkinlikGorseli, TemelEtkinlik } from "@/lib/temel-etkinlik-govde";
import {
  etkinlikKaydetAction,
  etkinlikOlusturAction,
  etkinlikSilAction,
} from "@/app/yonetim/temel-etkinlikler/actions";

/**
 * TEMEL ETKİNLİK EDİTÖRÜ (4 Eylül 2026 · istek: "temel etkinlik düzelt ekle de
 * yapalım panelde").
 *
 * Adı "etkinlik-programi-editoru": components/etkinlik-editoru.tsx BAŞKA BİR
 * ŞEY — o, tarihli etkinlik kayıtlarının (Event) editörü. Buradakiler her yıl
 * tekrarlanan program aileleri.
 *
 * Galeri zirve editöründeki kalıbın aynısı: kütüphaneden toplu ekleme, sıra ve
 * alternatif metin. İlk kare kartın kapağı olduğu için sıra anlamlı.
 */

type Props = { etkinlik?: TemelEtkinlik; kaydedildi?: boolean };

// Metni ve galerisi Zirveler ekranından gelen kayıt; editörde uyarı gösteriyor.
const ZIRVE_KAYDI = "genctek-zirvesi";

export function EtkinlikProgramiEditoru({ etkinlik, kaydedildi }: Props) {
  const yeniMi = !etkinlik;
  const zirveKaydiMi = etkinlik?.slug === ZIRVE_KAYDI;
  const [gorseller, setGorseller] = useState<EtkinlikGorseli[]>(etkinlik?.gorseller ?? []);
  const [secici, setSecici] = useState(false);

  function tasi(sira: number, yon: -1 | 1) {
    setGorseller((eski) => {
      const hedef = sira + yon;
      if (hedef < 0 || hedef >= eski.length) return eski;
      const kopya = [...eski];
      [kopya[sira], kopya[hedef]] = [kopya[hedef], kopya[sira]];
      return kopya;
    });
  }

  return (
    <>
      {kaydedildi ? <div className="info-banner">Etkinlik kaydedildi ve sitede yayımlandı.</div> : null}
      <div className="info-banner">
        Bu liste GençTek platformundaki <code>temel_etkinlik_programi</code> tablosuyla aynı olmalı: etkinlik
        açan kişi program adını oradan seçiyor. <strong>Ad değiştirir ya da yeni program eklersen platform
        tarafının da güncellenmesi gerekir.</strong>
      </div>
      {zirveKaydiMi ? (
        <div className="info-banner">
          Bu kaydın <strong>metni ve fotoğrafları Zirveler ekranından</strong> geliyor; buradaki açıklama ve
          galeri alanları sayfada görünmez. Zirve metnini değiştirmek için Yönetim → Zirveler.
        </div>
      ) : null}

      <form action={yeniMi ? etkinlikOlusturAction : etkinlikKaydetAction} className="editor-layout">
        <section className="admin-panel editor-fields">
          {etkinlik ? <input type="hidden" name="id" value={etkinlik.id} /> : null}
          <input type="hidden" name="gorseller" value={JSON.stringify(gorseller)} />

          <label>
            Program adı <span aria-hidden="true">*</span>
            <input name="ad" defaultValue={etkinlik?.ad ?? ""} required placeholder="Örnek: Genç Gölge" />
          </label>

          <label>
            Adres (slug)
            <input name="slug" defaultValue={etkinlik?.slug ?? ""} placeholder="bos-birakilirsa-addan-uretilir" />
            <small>
              Sayfa <code>/hakkinda/temel-etkinlikler/{etkinlik?.slug ?? "adres"}</code> adresinde yayımlanır.
              Değiştirirsen eski adres 404 döner; çakışırsa sonuna sayı eklenir.
            </small>
          </label>

          <label>
            Liste
            <select name="liste" defaultValue={etkinlik?.liste ?? "temel"}>
              <option value="temel">Temel GençTek etkinliği</option>
              <option value="grup">Çalışma grubu etkinliği</option>
            </select>
            <small>
              Temel etkinlikler <code>/hakkinda/temel-etkinlikler</code> sayfasında kart olarak listelenir.
              Çalışma grubu etkinlikleri şu an hiçbir listede görünmüyor (1 Eylül 2026'da kaldırıldı) ama
              kendi sayfaları açılıyor — paylaşılmış bağlantılar çalışsın diye.
            </small>
          </label>

          <label>
            Açıklama
            <textarea name="aciklama" rows={12} defaultValue={etkinlik?.aciklama ?? ""}
              disabled={zirveKaydiMi}
              placeholder="Paragrafları boş satırla ayır." />
            <small>
              Boş satır bırakılan her yerde yeni paragraf başlar. 60 karakterden kısa satırlar ara başlık
              olarak basılır. Kart özeti ilk uzun paragraftan alınır.
            </small>
          </label>

          {/* GALERİ: ilk kare kartın kapağı, kalanı detay sayfasında. */}
          <div className="blok-editor">
            <div className="blok-editor-baslik">
              <h2>Fotoğraflar</h2>
              <span>{gorseller.length} kare</span>
            </div>
            <div className="blok-ogeler">
              {gorseller.map((gorsel, i) => (
                <div className="blok-oge zirve-gorsel-satiri" key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    {gorsel.url ? <img className="zirve-gorsel-onizleme" src={gorsel.url} alt="" loading="lazy" /> : null}
                    <input value={gorsel.url} placeholder="/medya/temel-etkinlikler/ornek.webp"
                      onChange={(e) => setGorseller(gorseller.map((g, j) => j === i ? { ...g, url: e.target.value } : g))} />
                    <input value={gorsel.alt} placeholder="Fotoğrafta ne olduğunu anlatan cümle"
                      onChange={(e) => setGorseller(gorseller.map((g, j) => j === i ? { ...g, alt: e.target.value } : g))} />
                  </div>
                  <div className="blok-araclar">
                    <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0} aria-label="Öne al">↑</button>
                    <button type="button" onClick={() => tasi(i, 1)} disabled={i === gorseller.length - 1} aria-label="Geri al">↓</button>
                    <button type="button" className="blok-sil" aria-label="Fotoğrafı sil"
                      onClick={() => setGorseller(gorseller.filter((_, j) => j !== i))}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="blok-ekle">
              <button type="button" className="button button-secondary" onClick={() => setSecici(true)}>
                <Icon name="image" />Kütüphaneden ekle
              </button>
              <button type="button" className="button button-secondary"
                onClick={() => setGorseller([...gorseller, { url: "", alt: "" }])}>
                <Icon name="plus" />Boş satır ekle
              </button>
            </div>
            <small>
              İlk kare listedeki kartın kapağıdır — kapak karesinin alternatif metni boş bırakılır, kartın
              adı zaten yanında yazıyor. Kalan karelerin alt metnini yaz.
            </small>
          </div>
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Yayın</h2>
          <dl>
            <div>
              <dt>Durum</dt>
              <dd>
                <span className={`status ${etkinlik && !etkinlik.yayinda ? "status-draft" : "status-published"}`}>
                  {yeniMi ? "Yeni" : etkinlik!.yayinda ? "Yayında" : "Taslak"}
                </span>
              </dd>
            </div>
            {etkinlik ? (
              <div><dt>Adres</dt><dd><code>/hakkinda/temel-etkinlikler/{etkinlik.slug}</code></dd></div>
            ) : null}
          </dl>

          <label className="blok-sutun">
            <input type="checkbox" name="yayinda" defaultChecked={etkinlik ? etkinlik.yayinda : true} />
            Yayında (listede ve sayfasında göster)
          </label>

          <button className="button button-primary" type="submit">
            {yeniMi ? "Programı oluştur" : "Değişiklikleri kaydet"}
          </button>
          {etkinlik ? (
            <Link className="button button-secondary" href={`/hakkinda/temel-etkinlikler/${etkinlik.slug}`} target="_blank">
              Sitede gör
            </Link>
          ) : null}
          <Link href="/yonetim/temel-etkinlikler">Vazgeç</Link>
        </aside>
      </form>

      {etkinlik ? (
        <form action={etkinlikSilAction} className="admin-panel editor-tehlike">
          <input type="hidden" name="id" value={etkinlik.id} />
          <div>
            <h3>Programı sil</h3>
            <p>
              Kart listeden kalkar ve <code>/hakkinda/temel-etkinlikler/{etkinlik.slug}</code> adresi 404 döner.
              Platformdaki referans tablosunda aynı ad duruyorsa orada da kaldırılmalı.
            </p>
          </div>
          <button className="koordinator-sil" type="submit">Bu programı sil</button>
        </form>
      ) : null}

      {secici ? (
        <GorselSecici
          baslik="Etkinlik fotoğrafı seç"
          onSec={(oge) => setGorseller((eski) => [...eski, { url: oge.url, alt: "" }])}
          onKapat={() => setSecici(false)}
        />
      ) : null}
    </>
  );
}
