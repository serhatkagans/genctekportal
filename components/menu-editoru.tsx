"use client";
import { useState } from "react";
import { Icon } from "./icons";
import type { Menu, MenuOgesi } from "@/lib/menu-govde";
import { menuKaydetAction } from "@/app/yonetim/menu/actions";

/**
 * ÜST MENÜ EDİTÖRÜ (4 Eylül 2026 · istek: "menülerin de ismi değişebilir
 * olabilir mi").
 *
 * Öğeler tek bir gizli alanda JSON olarak taşınıyor — sıralama değiştiğinde
 * form alan adlarını yeniden numaralamak gerekmesin diye (Hakkında ve zirve
 * editörlerindeki aynı karar).
 *
 * AÇILIR LİSTELERİN İÇERİĞİ BURADA DÜZENLENMİYOR: "Hakkında"nın altındaki
 * başlıklar Hakkında sayfalarından, "GençTek Zirvesi"nin altındakiler zirve
 * kayıtlarından geliyor. Editör bunu her öğenin altında söylüyor ki "alt
 * başlığı buradan ekleyeyim" diye aranmasın.
 */

const TUR_ADLARI: Record<MenuOgesi["tur"], string> = {
  baglanti: "Bağlantı",
  hakkinda: "Hakkında açılır listesi",
  zirveler: "Zirveler açılır listesi",
};

export function MenuEditoru({ menu, kaydedildi }: { menu: Menu; kaydedildi?: boolean }) {
  const [ogeler, setOgeler] = useState<MenuOgesi[]>(menu.ogeler);

  function tasi(sira: number, yon: -1 | 1) {
    setOgeler((eski) => {
      const hedef = sira + yon;
      if (hedef < 0 || hedef >= eski.length) return eski;
      const kopya = [...eski];
      [kopya[sira], kopya[hedef]] = [kopya[hedef], kopya[sira]];
      return kopya;
    });
  }

  // Açılır listeler içeriklerini tek bir kaynaktan alıyor; ikinci bir "Hakkında"
  // menüsü aynı listeyi iki kez basardı.
  const varOlanTur = (tur: MenuOgesi["tur"]) => ogeler.some((o) => o.tur === tur);

  return (
    <>
      {kaydedildi ? <div className="info-banner">Menü kaydedildi ve sitede yayımlandı.</div> : null}
      <div className="info-banner">
        Üst menü sitenin her sayfasında görünür. Açılır listelerin <strong>alt başlıkları</strong> kendi
        ekranlarından gelir: “Hakkında” altındakiler <strong>Hakkında sayfaları</strong>, “GençTek Zirvesi”
        altındakiler <strong>Zirveler</strong> ekranından. Buradan yalnızca başlıkları ve sıraları değişir.
      </div>

      <form action={menuKaydetAction} className="admin-panel">
        <input type="hidden" name="ogeler" value={JSON.stringify(ogeler)} />

        <div className="blok-editor">
          <div className="blok-editor-baslik">
            <h2>Menü başlıkları</h2>
            <span>{ogeler.length} öğe</span>
          </div>

          {ogeler.map((oge, i) => (
            <article className="blok-kutusu" key={i}>
              <header className="blok-kutusu-ust">
                <strong>{String(i + 1).padStart(2, "0")} · {TUR_ADLARI[oge.tur]}</strong>
                <div className="blok-araclar">
                  <button type="button" onClick={() => tasi(i, -1)} disabled={i === 0} aria-label="Sola al">↑</button>
                  <button type="button" onClick={() => tasi(i, 1)} disabled={i === ogeler.length - 1} aria-label="Sağa al">↓</button>
                  <button type="button" className="blok-sil" aria-label="Öğeyi sil"
                    onClick={() => setOgeler(ogeler.filter((_, j) => j !== i))}>✕</button>
                </div>
              </header>

              <label>
                Başlık
                <input value={oge.etiket} placeholder="Örnek: Haberler"
                  onChange={(e) => setOgeler(ogeler.map((o, j) => j === i ? { ...o, etiket: e.target.value } : o))} />
              </label>

              {oge.tur === "baglanti" ? (
                <label>
                  Adres
                  <input value={oge.adres} placeholder="/haberler"
                    onChange={(e) => setOgeler(ogeler.map((o, j) => j === i ? { ...o, adres: e.target.value } : o))} />
                  <small>Site içi yol (<code>/haberler</code>) ya da tam adres. Boş bırakılan öğe menüde basılmaz.</small>
                </label>
              ) : (
                <p className="ayar-aciklama">
                  {oge.tur === "hakkinda"
                    ? "Alt başlıklar Hakkında sayfalarından geliyor; başlığa tıklayan ana sayfadaki kart bölümüne iner."
                    : "Alt başlıklar zirve kayıtlarından geliyor (en güncel zirve en üstte)."}
                </p>
              )}
            </article>
          ))}

          <div className="blok-ekle">
            <button type="button" className="button button-secondary"
              onClick={() => setOgeler([...ogeler, { tur: "baglanti", etiket: "", adres: "" }])}>
              <Icon name="plus" />Bağlantı ekle
            </button>
            <button type="button" className="button button-secondary" disabled={varOlanTur("hakkinda")}
              onClick={() => setOgeler([...ogeler, { tur: "hakkinda", etiket: "Hakkında", adres: "" }])}>
              <Icon name="plus" />Hakkında listesi
            </button>
            <button type="button" className="button button-secondary" disabled={varOlanTur("zirveler")}
              onClick={() => setOgeler([...ogeler, { tur: "zirveler", etiket: "GençTek Zirvesi", adres: "" }])}>
              <Icon name="plus" />Zirveler listesi
            </button>
          </div>
        </div>

        <label>
          Giriş düğmesinin yazısı
          <input name="girisEtiketi" defaultValue={menu.girisEtiketi} placeholder="Giriş" />
          <small>
            Menünün sağındaki kırmızı düğme. Hedefi GençTek platformudur ve adresi sunucu ayarından gelir —
            buradan yalnızca yazısı değişir.
          </small>
        </label>

        <div className="blok-ekle">
          <button className="button button-primary" type="submit">Değişiklikleri kaydet</button>
        </div>
      </form>
    </>
  );
}
