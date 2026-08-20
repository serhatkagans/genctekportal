import Link from "next/link";
import { DURUM_ETIKETLERI, type FaaliyetKaydi, type Il } from "@/lib/faaliyet/yonetim";
import {
  etkinlikKaydetAction,
  etkinlikOlusturAction,
  etkinlikSilAction,
} from "@/app/yonetim/etkinlikler/actions";

// Tarihler veritabanından zaten "YYYY-MM-DDTHH:MM" biçiminde geliyor (bkz.
// faaliyetBul); Date'e çevirip geri biçimlemek saat dilimi kayması yaratırdı.

const TUR_ONERILERI = ["Kamp", "Atölye", "Yarışma", "Buluşma", "Zirve", "Seminer", "Teknik gezi"];

export function EtkinlikEditoru({ faaliyet, iller, kaydedildi, katilimciSayisi = 0 }: {
  faaliyet?: FaaliyetKaydi;
  iller: Il[];
  kaydedildi?: boolean;
  katilimciSayisi?: number;
}) {
  const yeniMi = !faaliyet;

  return (
    <>
      {kaydedildi ? <div className="info-banner">Etkinlik kaydedildi.</div> : null}

      <form action={yeniMi ? etkinlikOlusturAction : etkinlikKaydetAction} className="editor-layout">
        <section className="admin-panel editor-fields">
          {faaliyet ? <input type="hidden" name="id" value={faaliyet.id} /> : null}

          <label>
            Etkinlik adı <span aria-hidden="true">*</span>
            <input name="title" defaultValue={faaliyet?.title ?? ""} required
              placeholder="Örnek: EğitiJAM 2026 — Ankara Oyun Tasarımı Kampı" />
          </label>

          <label>
            Adres (slug)
            <input name="slug" defaultValue={faaliyet?.slug ?? ""} placeholder="bos-birakilirsa-addan-uretilir" />
            <small>Kayıtlar arasında benzersiz olmalı; çakışırsa sonuna sayı eklenir.</small>
          </label>

          <div className="form-row">
            <label>
              Tür
              <input name="eventType" list="etkinlik-turleri" defaultValue={faaliyet?.eventType ?? ""}
                placeholder="Kamp, Atölye, Yarışma…" />
              <datalist id="etkinlik-turleri">
                {TUR_ONERILERI.map((t) => <option key={t} value={t} />)}
              </datalist>
            </label>
            <label>
              İl
              <select name="provinceCode" defaultValue={faaliyet?.provinceCode ?? ""}>
                <option value="">Genel (il yok)</option>
                {iller.map((il) => <option key={il.code} value={il.code}>{il.code} · {il.name}</option>)}
              </select>
            </label>
          </div>

          <label>
            Kısa özet
            <textarea name="summary" rows={2} defaultValue={faaliyet?.summary ?? ""}
              placeholder="Listelerde görünecek tek cümlelik açıklama" />
          </label>

          <label>
            Açıklama
            <textarea name="aciklama" rows={6} defaultValue={faaliyet?.aciklama ?? ""}
              placeholder="Program akışı, katılım koşulları, notlar" />
          </label>

          <div className="form-row">
            <label>
              Başlangıç <span aria-hidden="true">*</span>
              <input type="datetime-local" name="startsAt" required
                defaultValue={faaliyet?.startsAt ?? ""} />
            </label>
            <label>
              Bitiş
              <input type="datetime-local" name="endsAt" defaultValue={faaliyet?.endsAt ?? ""} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Mekân
              <input name="venue" defaultValue={faaliyet?.venue ?? ""} placeholder="Ankara Bilim Merkezi" />
            </label>
            <label>
              Kontenjan
              <input type="number" name="capacity" min={1} defaultValue={faaliyet?.capacity ?? ""} placeholder="60" />
            </label>
          </div>

          <div className="form-row">
            <label>
              Çevrim içi adres
              <input type="url" name="onlineUrl" defaultValue={faaliyet?.onlineUrl ?? ""} placeholder="https://" />
            </label>
            <label>
              Kayıt adresi
              <input type="url" name="registrationUrl" defaultValue={faaliyet?.registrationUrl ?? ""} placeholder="https://" />
            </label>
          </div>

          <div className="form-row">
            <label>
              Düzenleyen kişi
              <input name="organizerName" defaultValue={faaliyet?.organizerName ?? ""} placeholder="Ad Soyad" />
            </label>
            <label>
              Düzenleyen birim
              <input name="organizerUnit" defaultValue={faaliyet?.organizerUnit ?? ""}
                placeholder="Ankara İl Millî Eğitim Müdürlüğü" />
            </label>
          </div>
          <p className="form-note">
            Düzenleyen bilgisi katılım ve teşekkür belgelerinin altına basılır; boş bırakılırsa belgede yer almaz.
          </p>
        </section>

        <aside className="admin-panel publish-rail">
          <h2>Yayın</h2>

          <label>
            Durum
            <select name="status" defaultValue={faaliyet?.status ?? "DRAFT"}>
              {Object.entries(DURUM_ETIKETLERI).map(([deger, etiket]) => (
                <option key={deger} value={deger}>{etiket}</option>
              ))}
            </select>
          </label>

          {faaliyet ? (
            <dl>
              <div><dt>Katılımcı</dt><dd>{katilimciSayisi} kayıt</dd></div>
            </dl>
          ) : null}

          <button className="button button-primary" type="submit">
            {yeniMi ? "Etkinliği oluştur" : "Değişiklikleri kaydet"}
          </button>
          {faaliyet ? (
            <Link className="button button-secondary" href={`/panel/faaliyetler/${faaliyet.id}/belgeler`}>
              Belge üret
            </Link>
          ) : null}
          <Link href="/yonetim/etkinlikler">Vazgeç</Link>
        </aside>
      </form>

      {faaliyet ? (
        <form action={etkinlikSilAction} className="admin-panel editor-tehlike">
          <input type="hidden" name="id" value={faaliyet.id} />
          <div>
            <h3>Etkinliği sil</h3>
            <p>
              Kayıt kalıcı olarak silinir.
              {katilimciSayisi > 0
                ? ` Bu etkinliğe bağlı ${katilimciSayisi} katılım kaydı da birlikte silinir.`
                : ""}
            </p>
          </div>
          <button className="koordinator-sil" type="submit">Bu etkinliği sil</button>
        </form>
      ) : null}
    </>
  );
}
