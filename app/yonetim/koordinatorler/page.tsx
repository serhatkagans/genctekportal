import { AdminShell } from "@/components/admin-shell";
import { GorselAlani } from "@/components/gorsel-alani";
import { Icon } from "@/components/icons";
import { ROLLER, VARSAYILAN_GORSEL, ileGoreSirala, koordinatorleriOku } from "@/lib/koordinator";
import { ekleAction, guncelleAction, silAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const kayitlar = ileGoreSirala(await koordinatorleriOku());
  const bosKadro = kayitlar.filter((k) => !k.ad).length;

  return (
    <AdminShell title="Koordinatörler">
      <div className="info-banner">
        {kayitlar.length} kayıt · {new Set(kayitlar.map((k) => k.il)).size} il · {bosKadro} atama bekliyor.
        Değişiklikler kaydedilir kaydedilmez <strong>/hakkinda/il-koordinatorleri</strong> sayfasına yansır.
      </div>

      <section className="admin-panel koordinator-ekle">
        <div className="panel-head">
          <div>
            <h2>Yeni koordinatör ekle</h2>
            <p>İl zorunlu. Ad boş bırakılırsa kayıt “Atama bekliyor” olarak görünür.</p>
          </div>
        </div>
        <form action={ekleAction} className="koordinator-form">
          <label>
            Ad soyad
            <input name="ad" placeholder="Örn. Yalçın YURDAKUL" />
          </label>
          <label>
            İl <span aria-hidden="true">*</span>
            <input name="il" required placeholder="Örn. Afyonkarahisar" />
          </label>
          <label>
            Rol
            <select name="rol" defaultValue={ROLLER[0]}>
              {ROLLER.map((rol) => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
              <option value="">Rol belirtilmemiş</option>
            </select>
          </label>
          <GorselAlani
            name="gorsel"
            etiket="Fotoğraf"
            yardim="Boş bırakılırsa GençTek amblemi kullanılır."
            seciciBasligi="Koordinatör fotoğrafı seç"
          />
          <button className="button button-primary" type="submit">
            <Icon name="plus" />Ekle
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="panel-head">
          <div>
            <h2>Kayıtlı koordinatörler</h2>
            <p>Alanı değiştirip “Kaydet”e bas; silmek için satırdaki “Sil”i kullan.</p>
          </div>
        </div>
        <ul className="koordinator-listesi">
          {kayitlar.map((k) => (
            <li key={k.id}>
              <form action={guncelleAction} className="koordinator-satir-form">
                <input type="hidden" name="id" value={k.id} />
                <GorselAlani
                  key={k.gorsel}
                  name="gorsel"
                  baslangic={k.gorsel}
                  kompakt
                  etiket={`${k.ad || k.il} fotoğrafı`}
                  seciciBasligi={`${k.ad || k.il} için fotoğraf seç`}
                />
                <input name="ad" defaultValue={k.ad} placeholder="Atama bekliyor" aria-label={`${k.il} ad soyad`} />
                <input name="il" defaultValue={k.il} required aria-label={`${k.il} il`} />
                <select name="rol" defaultValue={k.rol} aria-label={`${k.il} rol`}>
                  {ROLLER.map((rol) => (
                    <option key={rol} value={rol}>{rol}</option>
                  ))}
                  <option value="">Rol belirtilmemiş</option>
                </select>
                <button className="button button-secondary" type="submit">Kaydet</button>
              </form>
              <form action={silAction}>
                <input type="hidden" name="id" value={k.id} />
                <button className="koordinator-sil" type="submit" aria-label={`${k.ad || k.il} kaydını sil`}>Sil</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
