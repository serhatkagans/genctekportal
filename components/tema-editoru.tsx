import Link from "next/link";
import { GorselAlani } from "@/components/gorsel-alani";
import type { Tema } from "@/lib/tema";
import { temaKaydetAction, temaOlusturAction, temaSilAction } from "@/app/yonetim/temalar/actions";

export function TemaEditoru({ tema, kaydedildi }: { tema?: Tema; kaydedildi?: boolean }) {
  const yeniMi = !tema;

  return (
    <>
      {kaydedildi ? <div className="info-banner">Tema kaydedildi ve sitede yayımlandı.</div> : null}

      <form action={yeniMi ? temaOlusturAction : temaKaydetAction} className="editor-layout">
        <section className="admin-panel editor-fields">
          {tema ? <input type="hidden" name="mevcutSlug" value={tema.slug} /> : null}

          <label>
            Tema adı <span aria-hidden="true">*</span>
            <input name="name" defaultValue={tema?.name ?? ""} required placeholder="Örnek: Yapay Zeka" />
          </label>

          <label>
            Adres (slug)
            <input name="slug" defaultValue={tema?.slug ?? ""} placeholder="bos-birakilirsa-addan-uretilir" />
            <small>
              Değiştirirsen <code>/temalar/{tema?.slug ?? "adres"}</code> bağlantısı çalışmaz. Çakışırsa sonuna sayı eklenir.
              {tema ? " Temaya bağlı resmî program içeriği de slug ile eşleştiği için kopabilir." : ""}
            </small>
          </label>

          <label>
            Kısa açıklama <span aria-hidden="true">*</span>
            <textarea name="shortDescription" rows={2} required defaultValue={tema?.shortDescription ?? ""}
              placeholder="Kartlarda ve tema başlığının altında görünen tek cümle" />
          </label>

          <label>
            Açıklama
            <textarea name="description" rows={6} defaultValue={tema?.description ?? ""}
              placeholder="Tema sayfasındaki 'Tema hakkında' bölümünde çıkan uzun metin" />
          </label>

          <label>
            Odak alanları
            <textarea className="liste-alani" name="focus" rows={5} defaultValue={tema?.focus.join("\n") ?? ""}
              placeholder={"Her satır bir madde:\nOyun mekaniği ve seviye tasarımı\nHikâye, görsel ve işitsel anlatım"} />
            <small>Her satır bir madde olur; “Neler öğreneceksin?” listesinde numaralanır.</small>
          </label>

          <label>
            Üretim çıktıları
            <textarea className="liste-alani" name="outcomes" rows={5} defaultValue={tema?.outcomes.join("\n") ?? ""}
              placeholder={"Her satır bir madde:\nOynanabilir oyun prototipi\nOyun tasarım dokümanı"} />
            <small>Her satır bir madde olur; “Neler geliştirebilirsin?” listesinde numaralanır.</small>
          </label>
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Yayın</h2>
          <dl>
            <div><dt>Durum</dt><dd><span className="status status-published">{yeniMi ? "Yeni" : "Yayında"}</span></dd></div>
            {tema ? <div><dt>Adres</dt><dd><code>/temalar/{tema.slug}</code></dd></div> : null}
          </dl>

          <GorselAlani
            name="image"
            baslangic={tema?.image ?? ""}
            etiket="Tema görseli"
            yardim="Seçilmezse GençTek amblemi kullanılır."
            seciciBasligi="Tema görseli seç"
          />

          <button className="button button-primary" type="submit">{yeniMi ? "Temayı oluştur" : "Değişiklikleri kaydet"}</button>
          {tema ? <Link className="button button-secondary" href={`/temalar/${tema.slug}`} target="_blank">Sitede gör</Link> : null}
          <Link href="/yonetim/temalar">Vazgeç</Link>
        </aside>
      </form>

      {tema ? (
        <form action={temaSilAction} className="admin-panel editor-tehlike">
          <input type="hidden" name="slug" value={tema.slug} />
          <div>
            <h3>Temayı sil</h3>
            <p>Kayıt kalıcı olarak silinir ve <code>/temalar/{tema.slug}</code> adresi 404 döner.</p>
          </div>
          <button className="koordinator-sil" type="submit">Bu temayı sil</button>
        </form>
      ) : null}
    </>
  );
}
