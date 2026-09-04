"use client";
import Link from "next/link";
import { useState } from "react";
import { GorselSecici } from "./gorsel-secici";
import { Icon } from "./icons";
// Veritabanına dokunan lib/zirve.ts değil, saf tip dosyası: bu bileşen
// istemcide çalışıyor ve postgres sürücüsü tarayıcı paketine girmemeli.
import type { Zirve, ZirveBolumu, ZirveGorseli, ZirveVurgusu } from "@/lib/zirve-govde";
import { zirveKaydetAction, zirveOlusturAction, zirveSilAction } from "@/app/yonetim/zirveler/actions";

/**
 * ZİRVE EDİTÖRÜ (4 Eylül 2026 · istek: "zirve sayfalarını da yapalım").
 *
 * Hakkında editöründen farklı olarak burada SERBEST BLOK LİSTESİ YOK: zirve
 * sayfasının düzeni sabit (tarih şeridi, sayı vurguları, giriş metni, program
 * bölümleri, video, galeri) ve her zirve aynı kalıpta anlatılıyor. Sabit
 * bölümlü bir form, blok blok kurmaktan hem hızlı hem de sayfaların birbirine
 * benzemesini garanti ediyor.
 *
 * Tekrarlı alanlar (vurgular, bölümler, fotoğraflar) tek bir gizli alanda JSON
 * olarak taşınıyor — sıralama değiştiğinde form alan adlarını yeniden
 * numaralamak gerekmesin diye.
 */

type Props = { zirve?: Zirve; kaydedildi?: boolean };

export function ZirveEditoru({ zirve, kaydedildi }: Props) {
  const yeniMi = !zirve;
  const [vurgular, setVurgular] = useState<ZirveVurgusu[]>(zirve?.vurgular ?? []);
  const [bolumler, setBolumler] = useState<ZirveBolumu[]>(zirve?.bolumler ?? []);
  const [gorseller, setGorseller] = useState<ZirveGorseli[]>(zirve?.gorseller ?? []);
  const [video, setVideo] = useState(zirve?.video ?? { url: "", kapak: "", baslik: "" });
  const [secici, setSecici] = useState<"galeri" | "kapak" | null>(null);

  // Gövde tek parça gönderiliyor; sunucu tarafında aynı süzgeçten geçiyor.
  const govde = JSON.stringify({ vurgular, bolumler, gorseller, video: video.url ? video : null });

  function tasi<T>(liste: T[], sira: number, yon: -1 | 1): T[] {
    const hedef = sira + yon;
    if (hedef < 0 || hedef >= liste.length) return liste;
    const kopya = [...liste];
    [kopya[sira], kopya[hedef]] = [kopya[hedef], kopya[sira]];
    return kopya;
  }

  return (
    <>
      {kaydedildi ? <div className="info-banner">Zirve kaydedildi ve sitede yayımlandı.</div> : null}

      <form action={yeniMi ? zirveOlusturAction : zirveKaydetAction} className="editor-layout">
        <section className="admin-panel editor-fields">
          {zirve ? <input type="hidden" name="id" value={zirve.id} /> : null}
          {/* Tarihsel adres yalnızca ilk iki zirvede dolu; formda alan olarak
              gösterilmiyor ki yanlışlıkla değiştirilip bağlantılar kırılmasın. */}
          <input type="hidden" name="yol" value={zirve && !zirve.yol.startsWith("/zirve/") ? zirve.yol : ""} />
          <input type="hidden" name="govde" value={govde} />

          <label>
            Zirvenin adı <span aria-hidden="true">*</span>
            <input name="ad" defaultValue={zirve?.ad ?? ""} required placeholder="Örnek: 3. GençTek Zirvesi" />
          </label>

          <div className="editor-ikili">
            <label>
              Yıl <span aria-hidden="true">*</span>
              <input name="yil" defaultValue={zirve?.yil ?? ""} required placeholder="2027" />
              <small>Üst menüde “Zirve {zirve?.yil || "2027"}” diye görünür.</small>
            </label>
            <label>
              Tarih ve yer
              <input name="tarihYer" defaultValue={zirve?.tarihYer ?? ""} placeholder="13-14 Nisan 2026 / Ankara" />
              <small>Başlığın üstündeki satır.</small>
            </label>
          </div>

          <label>
            Adres (slug)
            <input name="slug" defaultValue={zirve?.slug ?? ""} placeholder="bos-birakilirsa-addan-uretilir" />
            <small>
              {zirve && !zirve.yol.startsWith("/zirve/")
                ? <>Bu zirve tarihsel adresinde yayımlanıyor: <code>{zirve.yol}</code>. Slug değişse de adres değişmez.</>
                : <>Sayfa <code>/zirve/{zirve?.slug ?? "adres"}</code> adresinde yayımlanır.</>}
            </small>
          </label>

          <label>
            Başlık altı cümle
            <textarea name="ozet" rows={2} defaultValue={zirve?.ozet ?? ""}
              placeholder="Kısa tanıtım; arama sonuçlarında da bu cümle çıkar." />
          </label>

          <label>
            Giriş metni
            <textarea name="metin" rows={10} defaultValue={zirve?.metin ?? ""}
              placeholder="Paragrafları boş satırla ayır." />
            <small>Boş satır bırakılan her yerde yeni paragraf başlar.</small>
          </label>

          {/* SAYI ŞERİDİ: zirvenin ölçeği metne dalmadan da okunsun. Boşsa şerit
              hiç basılmaz. */}
          <div className="blok-editor">
            <div className="blok-editor-baslik">
              <h2>Sayı şeridi</h2>
              <span>{vurgular.length} kutu</span>
            </div>
            <div className="blok-ogeler">
              {vurgular.map((vurgu, i) => (
                <div className="blok-oge" key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div className="editor-ikili">
                    <input value={vurgu.deger} placeholder="63"
                      onChange={(e) => setVurgular(vurgular.map((v, j) => j === i ? { ...v, deger: e.target.value } : v))} />
                    <input value={vurgu.etiket} placeholder="il"
                      onChange={(e) => setVurgular(vurgular.map((v, j) => j === i ? { ...v, etiket: e.target.value } : v))} />
                  </div>
                  <button type="button" className="blok-sil" aria-label="Kutuyu sil"
                    onClick={() => setVurgular(vurgular.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button type="button" className="button button-secondary"
                onClick={() => setVurgular([...vurgular, { deger: "", etiket: "" }])}>
                <Icon name="plus" />Sayı ekle
              </button>
            </div>
          </div>

          {/* PROGRAM BÖLÜMLERİ: oturumlar ve alanlar. Her biri kendi başlığıyla
              duruyor ki sayfada göz gezdiren okuyucu aradığını bulabilsin. */}
          <div className="blok-editor">
            <div className="blok-editor-baslik">
              <h2>Zirve programından</h2>
              <span>{bolumler.length} bölüm</span>
            </div>
            {bolumler.map((bolum, i) => (
              <article className="blok-kutusu" key={i}>
                <header className="blok-kutusu-ust">
                  <strong>{String(i + 1).padStart(2, "0")} · Bölüm</strong>
                  <div className="blok-araclar">
                    <button type="button" onClick={() => setBolumler(tasi(bolumler, i, -1))} disabled={i === 0} aria-label="Yukarı taşı">↑</button>
                    <button type="button" onClick={() => setBolumler(tasi(bolumler, i, 1))} disabled={i === bolumler.length - 1} aria-label="Aşağı taşı">↓</button>
                    <button type="button" className="blok-sil" aria-label="Bölümü sil"
                      onClick={() => setBolumler(bolumler.filter((_, j) => j !== i))}>✕</button>
                  </div>
                </header>
                <label>
                  Başlık
                  <input value={bolum.baslik} placeholder="Örnek: Sergi Alanı"
                    onChange={(e) => setBolumler(bolumler.map((b, j) => j === i ? { ...b, baslik: e.target.value } : b))} />
                </label>
                <label>
                  Metin
                  <textarea rows={4} value={bolum.metin}
                    onChange={(e) => setBolumler(bolumler.map((b, j) => j === i ? { ...b, metin: e.target.value } : b))} />
                </label>
              </article>
            ))}
            <div className="blok-ekle">
              <button type="button" className="button button-secondary"
                onClick={() => setBolumler([...bolumler, { baslik: "", metin: "" }])}>
                <Icon name="plus" />Bölüm ekle
              </button>
            </div>
          </div>

          {/* FOTOĞRAF GALERİSİ: sayfada kayan şerit olarak basılıyor. */}
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
                    <input value={gorsel.url} placeholder="/medya/zirve-2026-1.jpg"
                      onChange={(e) => setGorseller(gorseller.map((g, j) => j === i ? { ...g, url: e.target.value } : g))} />
                    <input value={gorsel.alt} placeholder="Fotoğrafta ne olduğunu anlatan cümle"
                      onChange={(e) => setGorseller(gorseller.map((g, j) => j === i ? { ...g, alt: e.target.value } : g))} />
                  </div>
                  <div className="blok-araclar">
                    <button type="button" onClick={() => setGorseller(tasi(gorseller, i, -1))} disabled={i === 0} aria-label="Öne al">↑</button>
                    <button type="button" onClick={() => setGorseller(tasi(gorseller, i, 1))} disabled={i === gorseller.length - 1} aria-label="Geri al">↓</button>
                    <button type="button" className="blok-sil" aria-label="Fotoğrafı sil"
                      onClick={() => setGorseller(gorseller.filter((_, j) => j !== i))}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="blok-ekle">
              <button type="button" className="button button-secondary" onClick={() => setSecici("galeri")}>
                <Icon name="image" />Kütüphaneden ekle
              </button>
              <button type="button" className="button button-secondary"
                onClick={() => setGorseller([...gorseller, { url: "", alt: "" }])}>
                <Icon name="plus" />Boş satır ekle
              </button>
            </div>
            <small>
              Her karenin alternatif metnini yaz: ekran okuyucular ve fotoğraf açılmadığında bu cümle okunuyor.
              Alt metni olmayan kareler galeride sessiz kalır.
            </small>
          </div>

          {/* VİDEO: dosyalar public/video altında ve depoya girmiyor; panelden
              yüklenmiyor, sunucuya kopyalanıp yolu buraya yazılıyor. */}
          <div className="blok-editor">
            <div className="blok-editor-baslik">
              <h2>Video</h2>
              <span>{video.url ? "tanımlı" : "yok"}</span>
            </div>
            <label>
              Video yolu
              <input value={video.url} placeholder="/video/genctek-zirvesi-2026.mp4"
                onChange={(e) => setVideo({ ...video, url: e.target.value })} />
              <small>
                Video dosyaları panelden yüklenmiyor: sunucudaki <code>public/video</code> klasörüne kopyalanır,
                buraya yalnızca yolu yazılır. Boş bırakılırsa sayfada video bölümü hiç basılmaz.
              </small>
            </label>
            <label>
              Başlık
              <input value={video.baslik} placeholder="2. GençTek Zirvesi tanıtım videosu"
                onChange={(e) => setVideo({ ...video, baslik: e.target.value })} />
            </label>
            <label>
              Kapak görseli
              <input value={video.kapak ?? ""} placeholder="/medya/genctek-zirvesi-2026-1.jpg"
                onChange={(e) => setVideo({ ...video, kapak: e.target.value })} />
              <small>Oynatılmadan önce görünen kare. Boşsa tarayıcı siyah bir kutu gösterir.</small>
            </label>
            <div className="blok-ekle">
              <button type="button" className="button button-secondary" onClick={() => setSecici("kapak")}>
                <Icon name="image" />Kapağı kütüphaneden seç
              </button>
            </div>
          </div>
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Yayın</h2>
          <dl>
            <div>
              <dt>Durum</dt>
              <dd>
                <span className={`status ${zirve && !zirve.yayinda ? "status-draft" : "status-published"}`}>
                  {yeniMi ? "Yeni" : zirve!.yayinda ? "Yayında" : "Taslak"}
                </span>
              </dd>
            </div>
            {zirve ? <div><dt>Adres</dt><dd><code>{zirve.yol}</code></dd></div> : null}
          </dl>

          <label className="blok-sutun">
            <input type="checkbox" name="yayinda" defaultChecked={zirve ? zirve.yayinda : true} />
            Yayında (menüde ve sitede göster)
          </label>

          <button className="button button-primary" type="submit">
            {yeniMi ? "Zirveyi oluştur" : "Değişiklikleri kaydet"}
          </button>
          {zirve ? <Link className="button button-secondary" href={zirve.yol} target="_blank">Sitede gör</Link> : null}
          <Link href="/yonetim/zirveler">Vazgeç</Link>
        </aside>
      </form>

      {zirve ? (
        <form action={zirveSilAction} className="admin-panel editor-tehlike">
          <input type="hidden" name="id" value={zirve.id} />
          <div>
            <h3>Zirveyi sil</h3>
            <p>
              Kayıt kalıcı olarak silinir, <code>{zirve.yol}</code> adresi 404 döner ve zirve üst menüden kalkar.
              Yayından kaldırmak yeterliyse silmek yerine “Yayında” kutusunu boşalt.
            </p>
          </div>
          <button className="koordinator-sil" type="submit">Bu zirveyi sil</button>
        </form>
      ) : null}

      {secici ? (
        <GorselSecici
          baslik={secici === "kapak" ? "Video kapağı seç" : "Zirve fotoğrafı seç"}
          onSec={(oge) => {
            if (secici === "kapak") setVideo((eski) => ({ ...eski, kapak: oge.url }));
            else setGorseller((eski) => [...eski, { url: oge.url, alt: "" }]);
            // Galeri seçici açık kalıyor: bir zirveye onlarca kare ekleniyor,
            // her fotoğraf için pencereyi yeniden açmak zorunda kalınmasın.
            if (secici === "kapak") setSecici(null);
          }}
          onKapat={() => setSecici(null)}
        />
      ) : null}
    </>
  );
}
