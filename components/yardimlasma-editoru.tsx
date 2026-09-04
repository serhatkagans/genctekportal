"use client";
import Link from "next/link";
import { GorselAlani } from "./gorsel-alani";
import type { YardimlasmaGrubu } from "@/lib/yardimlasma-govde";
import {
  yardimlasmaKaydetAction,
  yardimlasmaOlusturAction,
  yardimlasmaSilAction,
} from "@/app/yonetim/yardimlasma/actions";

/**
 * YARDIMLAŞMA GRUBU EDİTÖRÜ (4 Eylül 2026 · istek: "alttaki yardımlaşma
 * gruplarını düzenleyemiyor yenisini ekleyemiyorum panelde").
 *
 * Tema editörünün kardeşi: alan sayısı az olduğu için blok listesi yok, düz bir
 * form. Metin tek kutuya yazılıyor ve sitede boş satırlardan paragraflara
 * bölünüyor — grup sayfalarında başka bir yapı yok.
 */
export function YardimlasmaEditoru({ grup, kaydedildi }: { grup?: YardimlasmaGrubu; kaydedildi?: boolean }) {
  const yeniMi = !grup;

  return (
    <>
      {kaydedildi ? <div className="info-banner">Grup kaydedildi ve sitede yayımlandı.</div> : null}

      <form action={yeniMi ? yardimlasmaOlusturAction : yardimlasmaKaydetAction} className="editor-layout">
        <section className="admin-panel editor-fields">
          {grup ? <input type="hidden" name="id" value={grup.id} /> : null}

          <label>
            Grup adı <span aria-hidden="true">*</span>
            <input name="ad" defaultValue={grup?.ad ?? ""} required placeholder="Örnek: TEKNOFEST" />
          </label>

          <label>
            Adres (slug)
            <input name="slug" defaultValue={grup?.slug ?? ""} placeholder="bos-birakilirsa-addan-uretilir" />
            <small>
              Sayfa <code>/yardimlasma/{grup?.slug ?? "adres"}</code> adresinde yayımlanır. Değiştirirsen eski
              adres 404 döner; çakışırsa sonuna sayı eklenir.
            </small>
          </label>

          <label>
            Tanıtım metni
            <textarea name="metin" rows={12} defaultValue={grup?.metin ?? ""}
              placeholder="Paragrafları boş satırla ayır." />
            <small>
              Grubun kendi sayfasında basılır. Boş bırakılırsa sayfa “tanıtım metni hazırlanıyor” satırını
              gösterir — kart ve adres yine çalışır.
            </small>
          </label>
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Yayın</h2>
          <dl>
            <div>
              <dt>Durum</dt>
              <dd>
                <span className={`status ${grup && !grup.yayinda ? "status-draft" : "status-published"}`}>
                  {yeniMi ? "Yeni" : grup!.yayinda ? "Yayında" : "Taslak"}
                </span>
              </dd>
            </div>
            {grup ? <div><dt>Adres</dt><dd><code>/yardimlasma/{grup.slug}</code></dd></div> : null}
          </dl>

          <label className="blok-sutun">
            <input type="checkbox" name="yayinda" defaultChecked={grup ? grup.yayinda : true} />
            Yayında (Çalışma Grupları sayfasında göster)
          </label>

          <GorselAlani
            name="gorsel"
            baslangic={grup?.gorsel ?? ""}
            etiket="Kart görseli"
            yardim="Çalışma Grupları sayfasındaki kartın kapağı."
            seciciBasligi="Yardımlaşma grubu görseli seç"
          />

          <button className="button button-primary" type="submit">
            {yeniMi ? "Grubu oluştur" : "Değişiklikleri kaydet"}
          </button>
          {grup ? (
            <Link className="button button-secondary" href={`/yardimlasma/${grup.slug}`} target="_blank">Sitede gör</Link>
          ) : null}
          <Link href="/yonetim/yardimlasma">Vazgeç</Link>
        </aside>
      </form>

      {grup ? (
        <form action={yardimlasmaSilAction} className="admin-panel editor-tehlike">
          <input type="hidden" name="id" value={grup.id} />
          <div>
            <h3>Grubu sil</h3>
            <p>
              Kart Çalışma Grupları sayfasından kalkar ve <code>/yardimlasma/{grup.slug}</code> adresi 404 döner.
              Geçici olarak gizlemek yeterliyse silmek yerine “Yayında” kutusunu boşalt.
            </p>
          </div>
          <button className="koordinator-sil" type="submit">Bu grubu sil</button>
        </form>
      ) : null}
    </>
  );
}
