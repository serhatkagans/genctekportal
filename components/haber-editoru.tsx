"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { GorselAlani } from "@/components/gorsel-alani";
import { GorselSecici, type MedyaOgesi } from "@/components/gorsel-secici";
import { gorselEtiketi, htmldenDuzMetin, type HaberBicimi } from "@/lib/haber-bicim";
import type { Haber } from "@/lib/haber";
import { kaydetAction, olusturAction, silAction } from "@/app/yonetim/icerik/actions";

// datetime-local yerel saat bekler; ISO'nun sonundaki Z ve saniyeler kırpılır.
function tarihAlani(iso: string) {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}T${pad(t.getHours())}:${pad(t.getMinutes())}`;
}

// Kapak görseli GorselAlani'na taşındı; buradaki seçici yalnızca gövde içi görsel için.

export function HaberEditoru({ haber, kaydedildi }: { haber?: Haber; kaydedildi?: boolean }) {
  const yeniMi = !haber;

  // Yeni haber düz metinle başlar; içe aktarılmış kayıtlar HTML'inde kalır.
  const [bicim, setBicim] = useState<HaberBicimi>(haber?.bicim ?? (yeniMi ? "duz" : "html"));
  // İki kutunun içeriği ayrı tutuluyor ki biçim değiştirip geri dönünce metin kaybolmasın.
  const [duzMetin, setDuzMetin] = useState(haber?.kaynak ?? "");
  const [htmlMetin, setHtmlMetin] = useState(haber?.html ?? "");
  const [secici, setSecici] = useState(false);

  const govdeRef = useRef<HTMLTextAreaElement>(null);
  const icerik = bicim === "duz" ? duzMetin : htmlMetin;
  const icerikYaz = bicim === "duz" ? setDuzMetin : setHtmlMetin;

  // İmlecin bulunduğu yere yazar; seçili metin varsa onu sarar.
  function imlece(oncesi: string, sonrasi = "", varsayilan = "") {
    const alan = govdeRef.current;
    if (!alan) return;
    const bas = alan.selectionStart;
    const son = alan.selectionEnd;
    const secili = icerik.slice(bas, son) || varsayilan;
    const yeni = icerik.slice(0, bas) + oncesi + secili + sonrasi + icerik.slice(son);
    icerikYaz(yeni);
    queueMicrotask(() => {
      alan.focus();
      alan.setSelectionRange(bas + oncesi.length, bas + oncesi.length + secili.length);
    });
  }

  function satirBasina(onek: string) {
    const alan = govdeRef.current;
    if (!alan) return;
    const bas = icerik.lastIndexOf("\n", Math.max(0, alan.selectionStart - 1)) + 1;
    const yeni = icerik.slice(0, bas) + onek + icerik.slice(bas);
    icerikYaz(yeni);
    queueMicrotask(() => {
      alan.focus();
      alan.setSelectionRange(alan.selectionStart + onek.length, alan.selectionStart + onek.length);
    });
  }

  function gorselSecildi(oge: MedyaOgesi) {
    const alan = govdeRef.current;
    const metin = bicim === "duz"
      ? `\n\n${gorselEtiketi(oge.url, "")}\n\n`
      : `\n<figure><img src="${oge.url}" alt="" loading="lazy" /><figcaption></figcaption></figure>\n`;
    const bas = alan?.selectionStart ?? icerik.length;
    icerikYaz(icerik.slice(0, bas) + metin + icerik.slice(bas));
    setSecici(false);
  }

  function htmldenAktar() {
    const kaynak = htmlMetin.trim();
    if (!kaynak) return;
    setDuzMetin(htmldenDuzMetin(kaynak));
  }

  return (
    <>
      {kaydedildi ? <div className="info-banner">Değişiklikler kaydedildi ve sitede yayımlandı.</div> : null}

      <form action={yeniMi ? olusturAction : kaydetAction} className="editor-layout">
        <section className="admin-panel editor-fields">
          {haber ? <input type="hidden" name="id" value={haber.id} /> : null}

          <label>
            Başlık <span aria-hidden="true">*</span>
            <input name="title" defaultValue={haber?.title ?? ""} required placeholder="Haberi açıklayan kısa bir başlık" />
          </label>

          <label>
            Adres (slug)
            <input name="slug" defaultValue={haber?.slug ?? ""} placeholder="bos-birakilirsa-baslikdan-uretilir" />
            <small>Değiştirirsen eski bağlantı çalışmaz. Çakışırsa sonuna sayı eklenir.</small>
          </label>

          <label>
            Kısa özet
            <textarea name="excerpt" rows={3} defaultValue={haber?.excerpt ?? ""} placeholder="Kartlarda ve arama sonuçlarında görünecek özet" />
          </label>

          <div className="bicim-alani">
            <div className="bicim-ust">
              <span className="bicim-etiket">İçerik <span aria-hidden="true">*</span></span>
              <div className="bicim-secim" role="group" aria-label="İçerik giriş biçimi">
                <button
                  type="button"
                  className={bicim === "duz" ? "bicim-etkin" : ""}
                  aria-pressed={bicim === "duz"}
                  onClick={() => setBicim("duz")}
                >
                  Normal yazım
                </button>
                <button
                  type="button"
                  className={bicim === "html" ? "bicim-etkin" : ""}
                  aria-pressed={bicim === "html"}
                  onClick={() => setBicim("html")}
                >
                  HTML
                </button>
              </div>
            </div>

            <input type="hidden" name="bicim" value={bicim} />

            <div className="editor-toolbar">
              {bicim === "duz" ? (
                <>
                  <button type="button" title="Ara başlık" onClick={() => satirBasina("## ")}>H2</button>
                  <button type="button" title="Alt başlık" onClick={() => satirBasina("### ")}>H3</button>
                  <button type="button" title="Kalın" onClick={() => imlece("**", "**", "kalın metin")}><strong>K</strong></button>
                  <button type="button" title="İtalik" onClick={() => imlece("*", "*", "italik metin")}><em>İ</em></button>
                  <button type="button" title="Madde işareti" onClick={() => satirBasina("- ")}>Liste</button>
                  <button type="button" title="Alıntı" onClick={() => satirBasina("> ")}>Alıntı</button>
                  <button type="button" title="Bağlantı" onClick={() => imlece("[", "](https://)", "bağlantı metni")}>Bağlantı</button>
                </>
              ) : (
                <>
                  <button type="button" title="Paragraf" onClick={() => imlece("<p>", "</p>")}>p</button>
                  <button type="button" title="Ara başlık" onClick={() => imlece("<h2>", "</h2>")}>h2</button>
                  <button type="button" title="Kalın" onClick={() => imlece("<strong>", "</strong>")}><strong>K</strong></button>
                  <button type="button" title="Liste" onClick={() => imlece("<ul>\n  <li>", "</li>\n</ul>")}>ul</button>
                </>
              )}
              <button type="button" className="editor-arac-vurgu" onClick={() => setSecici(true)}>
                Görsel ekle
              </button>
            </div>

            <textarea
              ref={govdeRef}
              className="body-editor"
              name="icerik"
              rows={20}
              required
              value={icerik}
              onChange={(e) => icerikYaz(e.target.value)}
              placeholder={bicim === "duz"
                ? "Metni normal yazın. Boş satır yeni paragraf açar.\n\n## Ara başlık\n- Madde\n**kalın**  *italik*  [bağlantı](https://ornek.gov.tr)"
                : "HTML içerik"}
            />

            {bicim === "duz" ? (
              <small>
                Boş satır paragraf açar. <code>## </code> ara başlık, <code>### </code> alt başlık,
                {" "}<code>- </code> madde, <code>&gt; </code> alıntı, <code>**kalın**</code>, <code>*italik*</code>,
                {" "}<code>[metin](adres)</code>. Görseller <code>Görsel ekle</code> ile eklenir.
                {htmlMetin.trim() && !duzMetin.trim() ? (
                  <>
                    {" "}Bu haberin HTML içeriği var —{" "}
                    <button type="button" className="bicim-aktar" onClick={htmldenAktar}>HTML&apos;den aktar</button>
                    {" "}diyerek düz metne çevirebilirsin.
                  </>
                ) : null}
              </small>
            ) : (
              <small>HTML olarak saklanır; sayfada gösterilmeden önce temizlenir.</small>
            )}

            {secici ? (
              <GorselSecici baslik="Gövdeye görsel ekle" onSec={gorselSecildi} onKapat={() => setSecici(false)} />
            ) : null}
          </div>
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Yayın</h2>
          <dl>
            <div><dt>Durum</dt><dd><span className="status status-published">{yeniMi ? "Yeni" : "Yayında"}</span></dd></div>
            <div><dt>Biçim</dt><dd>{bicim === "duz" ? "Normal yazım" : "HTML"}</dd></div>
            {haber ? <div><dt>Son değişiklik</dt><dd>{new Date(haber.modified).toLocaleDateString("tr-TR")}</dd></div> : null}
          </dl>

          <label>
            Yayın tarihi
            <input type="datetime-local" name="date" defaultValue={haber ? tarihAlani(haber.date) : ""} />
          </label>

          <GorselAlani
            name="featuredImage"
            baslangic={haber?.featuredImage ?? ""}
            etiket="Kapak görseli"
            seciciBasligi="Kapak görseli seç"
          />

          <button className="button button-primary" type="submit">{yeniMi ? "Haberi oluştur" : "Değişiklikleri kaydet"}</button>
          {haber ? <Link className="button button-secondary" href={`/haberler/${haber.slug}`} target="_blank">Sitede gör</Link> : null}
          <Link href="/yonetim/icerik">Vazgeç</Link>
        </aside>
      </form>

      {haber ? (
        <form action={silAction} className="admin-panel editor-tehlike">
          <input type="hidden" name="id" value={haber.id} />
          <div>
            <h3>Haberi sil</h3>
            <p>Kayıt kalıcı olarak silinir ve <code>/haberler/{haber.slug}</code> adresi 404 döner.</p>
          </div>
          <button className="koordinator-sil" type="submit">Bu haberi sil</button>
        </form>
      ) : null}
    </>
  );
}
