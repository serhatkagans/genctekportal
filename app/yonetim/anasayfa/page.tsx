import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { anaSayfaMetniniOku } from "@/lib/sayfa-metni";
import { anaSayfaKaydetAction } from "./actions";

export const dynamic = "force-dynamic";

/**
 * ANA SAYFA METİNLERİ EKRANI (5 Eylül 2026 · istek: "hepsini yap").
 *
 * Ana sayfanın LİSTELERİ burada değil: haberler Haberler ekranından, Hakkında
 * kartları Hakkında sayfalarından, etkinlik kartları ve sayı şeridi ise
 * GençTek platformundan geliyor. Bu ekran yalnızca aradaki SABİT YAZILARI
 * yönetiyor — her bölümün üstündeki etiket, başlık ve düğme adı.
 *
 * DÜĞME ADRESLERİ YOK: üç çağrı da platformun giriş adresine gidiyor ve o
 * adres ortam değişkeninden geliyor (bkz. lib/sayfa-metni-govde.ts).
 */
export default async function AnaSayfaEkrani({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  const metin = await anaSayfaMetniniOku();
  const kaydedildi = (await searchParams).kaydedildi === "1";

  return (
    <AdminShell
      title="Ana sayfa"
      action={<Link className="button button-secondary" href="/" target="_blank">Sitede gör</Link>}
    >
      {kaydedildi ? <div className="info-banner">Ana sayfa metinleri kaydedildi ve sitede yayımlandı.</div> : null}
      <div className="info-banner">
        Bu ekran ana sayfadaki sabit yazıları yönetir. Haber, Hakkında ve etkinlik kartlarının kendileri
        kendi ekranlarından gelir; sayı şeridi GençTek platformundan okunur.
      </div>

      <form action={anaSayfaKaydetAction} className="admin-panel">
        <div className="blok-editor">
          <div className="blok-editor-baslik"><h2>Giriş bölümü</h2><span>Sayfanın en üstü</span></div>

          <label>
            Üst etiket
            <input name="hero.ustEtiket" defaultValue={metin.hero.ustEtiket} placeholder="YEĞİTEK Genel Müdürlüğü" />
          </label>

          <div className="editor-ikili">
            <label>
              Başlık
              <input name="hero.baslik" defaultValue={metin.hero.baslik} placeholder="Sektörün Yeni" />
            </label>
            <label>
              Vurgulanan kelime
              <input name="hero.vurgu" defaultValue={metin.hero.vurgu} placeholder="Liderleri" />
            </label>
          </div>
          <small className="ayar-aciklama">
            Başlık ve vurgu yan yana basılır; vurgu markanın renginde ve eğik yazılır.
          </small>

          <label>
            Tanıtım metni
            <textarea name="hero.metin" rows={5} defaultValue={metin.hero.metin} />
          </label>

          <label>
            Düğme yazısı
            <input name="hero.dugme" defaultValue={metin.hero.dugme} placeholder="Ekosisteme Katıl" />
            <small>Düğme GençTek platformunun giriş adresine gider; adres ortam ayarından gelir, buradan değişmez.</small>
          </label>
        </div>

        <div className="blok-editor">
          <div className="blok-editor-baslik"><h2>Sağdaki özet kutusu</h2><span>Sayılar platformdan gelir</span></div>

          <div className="editor-ikili">
            <label>
              Dönem
              <input name="panel.donem" defaultValue={metin.panel.donem} placeholder="2026–2027" />
            </label>
            <label>
              Durum rozeti
              <input name="panel.durum" defaultValue={metin.panel.durum} placeholder="Aktif dönem" />
            </label>
          </div>

          <label>
            Üst satır
            <input name="panel.ustSatir" defaultValue={metin.panel.ustSatir} placeholder="GençTek Akran Öğrenme Modeli" />
          </label>

          <div className="editor-ikili">
            <label>
              Marka yazısı
              <input name="panel.marka" defaultValue={metin.panel.marka} placeholder="Genç Bilişim" />
            </label>
            <label>
              Vurgulanan kelime
              <input name="panel.markaVurgu" defaultValue={metin.panel.markaVurgu} placeholder="Ekosistemi" />
            </label>
          </div>

          <label>
            Alt şerit
            <textarea className="liste-alani" name="serit" rows={4} defaultValue={metin.serit.join("\n")}
              placeholder={"Her satır bir başlık:\nÖğrenen Topluluklar\nOrtak Üretim\nUluslararası Ağ"} />
            <small>Giriş bölümünün altındaki ince şerit. Tamamı silinirse şerit hiç basılmaz.</small>
          </label>
        </div>

        <div className="blok-editor">
          <div className="blok-editor-baslik"><h2>Bölüm başlıkları</h2><span>Kartların kendileri kendi ekranlarından</span></div>

          <div className="editor-ikili">
            <label>
              Haberler · üst etiket
              <input name="haberler.ustEtiket" defaultValue={metin.haberler.ustEtiket} placeholder="GençTek Ekosisteminden" />
            </label>
            <label>
              Haberler · başlık
              <input name="haberler.baslik" defaultValue={metin.haberler.baslik} placeholder="Son Haberler" />
            </label>
          </div>
          <label>
            Haberler · bağlantı yazısı
            <input name="haberler.baglanti" defaultValue={metin.haberler.baglanti} placeholder="Tüm haberler" />
            <small><code>/haberler</code> adresine gider.</small>
          </label>

          <div className="editor-ikili">
            <label>
              Hakkında · üst etiket
              <input name="hakkinda.ustEtiket" defaultValue={metin.hakkinda.ustEtiket} placeholder="GençTek" />
            </label>
            <label>
              Hakkında · başlık
              <input name="hakkinda.baslik" defaultValue={metin.hakkinda.baslik} placeholder="Hakkında" />
            </label>
          </div>

          <div className="editor-ikili">
            <label>
              Etkinlikler · üst etiket
              <input name="etkinlikler.ustEtiket" defaultValue={metin.etkinlikler.ustEtiket} placeholder="GençTek Etkinlikleri" />
            </label>
            <label>
              Etkinlikler · başlık
              <input name="etkinlikler.baslik" defaultValue={metin.etkinlikler.baslik} placeholder="Yaklaşan Etkinlikler" />
            </label>
          </div>
          <label>
            Etkinlikler · açıklama
            <textarea name="etkinlikler.metin" rows={2} defaultValue={metin.etkinlikler.metin} />
          </label>
          <div className="editor-ikili">
            <label>
              Etkinlikler · bağlantı yazısı
              <input name="etkinlikler.baglanti" defaultValue={metin.etkinlikler.baglanti} placeholder="Tüm etkinlikler" />
            </label>
            <label>
              Etkinlik yokken görünen yazı
              <input name="etkinlikler.bosMetin" defaultValue={metin.etkinlikler.bosMetin} />
            </label>
          </div>
        </div>

        <div className="blok-editor">
          <div className="blok-editor-baslik"><h2>Alttaki çağrı</h2><span>Sayfanın en altı</span></div>

          <label>
            Üst etiket
            <input name="cagri.ustEtiket" defaultValue={metin.cagri.ustEtiket} placeholder="Sıra sende" />
          </label>
          <label>
            Başlık
            <input name="cagri.baslik" defaultValue={metin.cagri.baslik} />
          </label>
          <label>
            Metin
            <textarea name="cagri.metin" rows={3} defaultValue={metin.cagri.metin} />
          </label>
          <label>
            Düğme yazısı
            <input name="cagri.dugme" defaultValue={metin.cagri.dugme} placeholder="Ekosisteme Katıl" />
          </label>
        </div>

        <div className="blok-ekle">
          <button className="button button-primary" type="submit">Değişiklikleri kaydet</button>
        </div>
      </form>
    </AdminShell>
  );
}
