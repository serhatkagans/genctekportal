"use client";
import Link from "next/link";
import { useState } from "react";
import { GorselSecici } from "./gorsel-secici";
import { Icon } from "./icons";
// Veritabanına dokunan lib/hakkinda.ts değil, saf tip dosyası: bu bileşen
// istemcide çalışıyor ve postgres sürücüsü tarayıcı paketine girmemeli.
import { HAKKINDA_IKONLARI, type HakkindaBlogu, type HakkindaSayfasi } from "@/lib/hakkinda-govde";
import {
  hakkindaKaydetAction,
  hakkindaOlusturAction,
  hakkindaSilAction,
} from "@/app/yonetim/hakkinda/actions";

/**
 * HAKKINDA SAYFASI EDİTÖRÜ (4 Eylül 2026 · istek: "yap tam çözüm").
 *
 * Gövde serbest HTML kutusu DEĞİL, blok listesi: her blok kendi alanlarını
 * gösteriyor ve sitede kendi kalıbıyla basılıyor (bkz. hakkinda-govdesi.tsx).
 * Zengin metin editörü yerine bunun seçilmesinin iki nedeni var — yazarın
 * eline ham HTML geçmiyor (script riski hiç doğmuyor) ve sayfalar birbirinin
 * aynı görünüyor: başlık her yerde aynı başlık, liste her yerde aynı liste.
 *
 * Bloklar tek bir gizli alanda JSON olarak taşınıyor. Alternatifi her blok için
 * numaralı form alanları üretmekti (blok0-metin, blok1-ad…); sıralama
 * değiştiğinde adları yeniden numaralamak gerekirdi.
 */

type Props = { sayfa?: HakkindaSayfasi; kaydedildi?: boolean };

const BLOK_ADLARI: Record<HakkindaBlogu["tur"], string> = {
  baslik: "Başlık",
  metin: "Metin",
  liste: "Numaralı liste",
  gorsel: "Görsel",
  video: "Video",
  kartlar: "İndirme kartları",
  not: "Küçük not",
};

function bosBlok(tur: HakkindaBlogu["tur"]): HakkindaBlogu {
  switch (tur) {
    case "baslik": return { tur, metin: "" };
    case "metin": return { tur, metin: "" };
    case "not": return { tur, metin: "" };
    case "gorsel": return { tur, url: "", alt: "" };
    case "video": return { tur, url: "" };
    case "liste": return { tur, ogeler: [{ baslik: "", metin: "" }] };
    case "kartlar": return { tur, ogeler: [{ ad: "", aciklama: "", dosya: "" }] };
  }
}

export function HakkindaEditoru({ sayfa, kaydedildi }: Props) {
  const yeniMi = !sayfa;
  const [bloklar, setBloklar] = useState<HakkindaBlogu[]>(sayfa?.bloklar ?? []);
  const [duzen, setDuzen] = useState(sayfa?.duzen ?? "tek");
  const [adres, setAdres] = useState(sayfa?.adres ?? "");
  const [secici, setSecici] = useState<number | null>(null);

  const baglantiKarti = adres.trim().length > 0;

  function degistir(sira: number, yeni: HakkindaBlogu) {
    setBloklar((eski) => eski.map((b, i) => (i === sira ? yeni : b)));
  }
  function tasi(sira: number, yon: -1 | 1) {
    setBloklar((eski) => {
      const hedef = sira + yon;
      if (hedef < 0 || hedef >= eski.length) return eski;
      const kopya = [...eski];
      [kopya[sira], kopya[hedef]] = [kopya[hedef], kopya[sira]];
      return kopya;
    });
  }

  // Liste ve kart bloklarının maddeleri: ikisi de "ogeler" dizisi taşıdığı için
  // ekleme/silme/taşıma tek yerden yürüyor.
  function ogeleriDegistir(sira: number, blok: HakkindaBlogu, ogeler: unknown[]) {
    degistir(sira, { ...blok, ogeler } as HakkindaBlogu);
  }

  return (
    <>
      {kaydedildi ? <div className="info-banner">Sayfa kaydedildi ve sitede yayımlandı.</div> : null}

      <form action={yeniMi ? hakkindaOlusturAction : hakkindaKaydetAction} className="editor-layout">
        <section className="admin-panel editor-fields">
          {sayfa ? <input type="hidden" name="id" value={sayfa.id} /> : null}
          <input type="hidden" name="bloklar" value={JSON.stringify(bloklar)} />

          <label>
            Kart başlığı <span aria-hidden="true">*</span>
            <input name="baslik" defaultValue={sayfa?.baslik ?? ""} required placeholder="Örnek: GençTek Nedir?" />
            <small>Ana sayfadaki kartta ve üst menüdeki “Hakkında” listesinde görünen ad.</small>
          </label>

          <label>
            Kart özeti <span aria-hidden="true">*</span>
            <textarea name="ozet" rows={2} required defaultValue={sayfa?.ozet ?? ""}
              placeholder="Kartın altındaki tek cümle" />
          </label>

          <label>
            Adres (slug)
            <input name="slug" defaultValue={sayfa?.slug ?? ""} placeholder="bos-birakilirsa-basliktan-uretilir" />
            <small>
              Sayfa <code>/hakkinda/{sayfa?.slug ?? "adres"}</code> adresinde yayımlanır. Değiştirirsen eski adres
              404 döner; çakışırsa sonuna sayı eklenir.
            </small>
          </label>

          <label>
            Başka bir sayfaya bağla
            <input name="adres" value={adres} onChange={(e) => setAdres(e.target.value)}
              placeholder="/temalar · boş bırakılırsa kartın kendi sayfası olur" />
            <small>
              Doldurulursa kart bu adrese gider ve aşağıdaki gövde hiç basılmaz. “Çalışma Grupları” kartı
              böyle çalışıyor: içerik <code>/temalar</code> ekranında duruyor, burada ikinci kez tutulmuyor.
            </small>
          </label>

          {baglantiKarti ? (
            <div className="info-banner">
              Bu bir <strong>bağlantı kartı</strong>: aşağıdaki başlık, gövde ve SEO alanları kullanılmaz.
            </div>
          ) : (
            <>
              <label>
                Sayfa başlığı (H1)
                <input name="sayfaBasligi" defaultValue={sayfa?.sayfaBasligi ?? ""}
                  placeholder="Boş bırakılırsa kart başlığı kullanılır" />
                <small>Kart “GençTek Nedir?” derken sayfanın kendi başlığı “GençTek” olabilir.</small>
              </label>

              <label>
                Üst etiket
                <input name="ustEtiket" defaultValue={sayfa?.ustEtiket ?? ""} placeholder="Örnek: YEĞİTEK" />
                <small>Başlığın üstünde duran küçük kırmızı yazı.</small>
              </label>

              <label>
                Başlık altı cümle
                <textarea name="spot" rows={2} defaultValue={sayfa?.spot ?? ""} />
              </label>

              <label>
                Sayfa düzeni
                <select name="duzen" value={duzen} onChange={(e) => setDuzen(e.target.value as "tek" | "ikili")}>
                  <option value="tek">Tek sütun</option>
                  <option value="ikili">İki sütun (solda anlatım, sağda liste)</option>
                </select>
                <small>
                  İki sütunda her bloğun kendi “sağ sütun” kutucuğu çıkar. İlk bölüm iki sütun akar,
                  sonraki bölümler tam genişlikte.
                </small>
              </label>
            </>
          )}

          {!baglantiKarti ? (
            <div className="blok-editor">
              <div className="blok-editor-baslik">
                <h2>Sayfa gövdesi</h2>
                <span>{bloklar.length} blok</span>
              </div>

              {bloklar.map((blok, sira) => (
                <article className="blok-kutusu" key={sira}>
                  <header className="blok-kutusu-ust">
                    <strong>{String(sira + 1).padStart(2, "0")} · {BLOK_ADLARI[blok.tur]}</strong>
                    <div className="blok-araclar">
                      {duzen === "ikili" ? (
                        <label className="blok-sutun">
                          <input type="checkbox" checked={blok.sutun === "sag"}
                            onChange={(e) => degistir(sira, { ...blok, sutun: e.target.checked ? "sag" : undefined })} />
                          Sağ sütun
                        </label>
                      ) : null}
                      <button type="button" onClick={() => tasi(sira, -1)} disabled={sira === 0} aria-label="Yukarı taşı">↑</button>
                      <button type="button" onClick={() => tasi(sira, 1)} disabled={sira === bloklar.length - 1} aria-label="Aşağı taşı">↓</button>
                      <button type="button" className="blok-sil"
                        onClick={() => setBloklar((eski) => eski.filter((_, i) => i !== sira))} aria-label="Bloğu sil">✕</button>
                    </div>
                  </header>

                  {blok.tur === "baslik" ? (
                    <>
                      <label>
                        Başlık
                        <input value={blok.metin} onChange={(e) => degistir(sira, { ...blok, metin: e.target.value })} />
                      </label>
                      <label>
                        Üst etiket
                        <input value={blok.ustEtiket ?? ""}
                          onChange={(e) => degistir(sira, { ...blok, ustEtiket: e.target.value || undefined })} />
                      </label>
                      <label className="blok-sutun">
                        <input type="checkbox" checked={blok.yeniBolum === true}
                          onChange={(e) => degistir(sira, { ...blok, yeniBolum: e.target.checked || undefined })} />
                        Buradan itibaren yeni bölüm (zeminli şerit)
                      </label>
                    </>
                  ) : null}

                  {blok.tur === "metin" || blok.tur === "not" ? (
                    <label>
                      {blok.tur === "not" ? "Not" : "Metin"}
                      <textarea rows={blok.tur === "not" ? 2 : 6} value={blok.metin}
                        onChange={(e) => degistir(sira, { ...blok, metin: e.target.value })}
                        placeholder={blok.tur === "not" ? "Küçük gri açıklama" : "Paragrafları boş satırla ayır."} />
                      {blok.tur === "metin" ? <small>Boş satır bırakılan her yerde yeni paragraf başlar.</small> : null}
                    </label>
                  ) : null}

                  {blok.tur === "gorsel" ? (
                    <>
                      <label>
                        Görsel yolu
                        <input value={blok.url} onChange={(e) => degistir(sira, { ...blok, url: e.target.value })}
                          placeholder="/medya/ornek.jpg" />
                      </label>
                      <button type="button" className="button button-secondary" onClick={() => setSecici(sira)}>
                        Kütüphaneden seç
                      </button>
                      {blok.url ? <img className="editor-onizleme" src={blok.url} alt="" /> : null}
                      <label>
                        Alternatif metin
                        <input value={blok.alt} onChange={(e) => degistir(sira, { ...blok, alt: e.target.value })}
                          placeholder="Görselde ne olduğunu anlatan cümle" />
                        <small>Ekran okuyucular ve görsel açılmadığında bu yazı okunur.</small>
                      </label>
                    </>
                  ) : null}

                  {blok.tur === "video" ? (
                    <label>
                      Video yolu
                      <input value={blok.url} onChange={(e) => degistir(sira, { ...blok, url: e.target.value })}
                        placeholder="/video/genctek-tanitim.mp4" />
                      <small>
                        Video dosyaları panelden yüklenmiyor: sunucudaki <code>public/video</code> klasörüne
                        kopyalanır, buraya yalnızca yolu yazılır.
                      </small>
                    </label>
                  ) : null}

                  {blok.tur === "liste" ? (
                    <div className="blok-ogeler">
                      {blok.ogeler.map((oge, i) => (
                        <div className="blok-oge" key={i}>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <input value={oge.baslik ?? ""} placeholder="Madde başlığı (boş bırakılabilir)"
                              onChange={(e) => ogeleriDegistir(sira, blok, blok.ogeler.map((o, j) => j === i ? { ...o, baslik: e.target.value } : o))} />
                            <textarea rows={3} value={oge.metin ?? ""} placeholder="Madde metni"
                              onChange={(e) => ogeleriDegistir(sira, blok, blok.ogeler.map((o, j) => j === i ? { ...o, metin: e.target.value } : o))} />
                          </div>
                          <button type="button" className="blok-sil" aria-label="Maddeyi sil"
                            onClick={() => ogeleriDegistir(sira, blok, blok.ogeler.filter((_, j) => j !== i))}>✕</button>
                        </div>
                      ))}
                      <button type="button" className="button button-secondary"
                        onClick={() => ogeleriDegistir(sira, blok, [...blok.ogeler, { baslik: "", metin: "" }])}>
                        <Icon name="plus" />Madde ekle
                      </button>
                      <small>Yalnız metin yazılırsa ince liste, başlık + metin yazılırsa kalın liste basılır.</small>
                    </div>
                  ) : null}

                  {blok.tur === "kartlar" ? (
                    <div className="blok-ogeler">
                      {blok.ogeler.map((oge, i) => (
                        <div className="blok-oge" key={i}>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <input value={oge.ad} placeholder="Kart adı"
                              onChange={(e) => ogeleriDegistir(sira, blok, blok.ogeler.map((o, j) => j === i ? { ...o, ad: e.target.value } : o))} />
                            <input value={oge.aciklama} placeholder="Kısa açıklama"
                              onChange={(e) => ogeleriDegistir(sira, blok, blok.ogeler.map((o, j) => j === i ? { ...o, aciklama: e.target.value } : o))} />
                            <input value={oge.dosya ?? ""} placeholder="/marka/dosya.pdf · boşsa “Yakında” kartı"
                              onChange={(e) => ogeleriDegistir(sira, blok, blok.ogeler.map((o, j) => j === i ? { ...o, dosya: e.target.value } : o))} />
                          </div>
                          <button type="button" className="blok-sil" aria-label="Kartı sil"
                            onClick={() => ogeleriDegistir(sira, blok, blok.ogeler.filter((_, j) => j !== i))}>✕</button>
                        </div>
                      ))}
                      <button type="button" className="button button-secondary"
                        onClick={() => ogeleriDegistir(sira, blok, [...blok.ogeler, { ad: "", aciklama: "", dosya: "" }])}>
                        <Icon name="plus" />Kart ekle
                      </button>
                      <small>Dosya yolu boş bırakılan kart, tıklanamayan “Yakında” kartı olarak basılır.</small>
                    </div>
                  ) : null}
                </article>
              ))}

              <div className="blok-ekle">
                {(Object.keys(BLOK_ADLARI) as HakkindaBlogu["tur"][]).map((tur) => (
                  <button type="button" className="button button-secondary" key={tur}
                    onClick={() => setBloklar((eski) => [...eski, bosBlok(tur)])}>
                    <Icon name="plus" />{BLOK_ADLARI[tur]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!baglantiKarti ? (
            <>
              <label>
                Arama motoru başlığı
                <input name="seoBaslik" defaultValue={sayfa?.seoBaslik ?? ""}
                  placeholder="Boşsa “Sayfa başlığı · GençTek” kullanılır" />
              </label>
              <label>
                Arama motoru açıklaması
                <textarea name="seoAciklama" rows={2} defaultValue={sayfa?.seoAciklama ?? ""}
                  placeholder="Boşsa kart özeti kullanılır" />
              </label>
            </>
          ) : null}
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Yayın</h2>
          <dl>
            <div>
              <dt>Durum</dt>
              <dd>
                <span className={`status ${sayfa && !sayfa.yayinda ? "status-draft" : "status-published"}`}>
                  {yeniMi ? "Yeni" : sayfa!.yayinda ? "Yayında" : "Taslak"}
                </span>
              </dd>
            </div>
            {sayfa ? <div><dt>Adres</dt><dd><code>{adres.trim() || `/hakkinda/${sayfa.slug}`}</code></dd></div> : null}
          </dl>

          <label className="blok-sutun">
            <input type="checkbox" name="yayinda" defaultChecked={sayfa ? sayfa.yayinda : true} />
            Yayında (kartı sitede göster)
          </label>

          <label>
            Kart simgesi
            <select name="ikon" defaultValue={sayfa?.ikon ?? "badge"}>
              {HAKKINDA_IKONLARI.map((ikon) => <option key={ikon} value={ikon}>{ikon}</option>)}
            </select>
            <small>Kartın renkli bandındaki simge; bant rengi de simgeye göre değişir.</small>
          </label>

          <button className="button button-primary" type="submit">
            {yeniMi ? "Sayfayı oluştur" : "Değişiklikleri kaydet"}
          </button>
          {sayfa ? (
            <Link className="button button-secondary" href={adres.trim() || `/hakkinda/${sayfa.slug}`} target="_blank">
              Sitede gör
            </Link>
          ) : null}
          <Link href="/yonetim/hakkinda">Vazgeç</Link>
        </aside>
      </form>

      {sayfa ? (
        <form action={hakkindaSilAction} className="admin-panel editor-tehlike">
          <input type="hidden" name="id" value={sayfa.id} />
          <div>
            <h3>Sayfayı sil</h3>
            <p>
              Kart ana sayfadan ve üst menüden kalkar, <code>/hakkinda/{sayfa.slug}</code> adresi 404 döner.
              Paylaşılmış bağlantılar varsa silmeden önce Yönlendirmeler ekranından bir yönlendirme tanımla.
            </p>
          </div>
          <button className="koordinator-sil" type="submit">Bu sayfayı sil</button>
        </form>
      ) : null}

      {secici !== null ? (
        <GorselSecici
          baslik="Sayfa görseli seç"
          onSec={(oge) => {
            const blok = bloklar[secici];
            if (blok && blok.tur === "gorsel") degistir(secici, { ...blok, url: oge.url });
            setSecici(null);
          }}
          onKapat={() => setSecici(null)}
        />
      ) : null}
    </>
  );
}
