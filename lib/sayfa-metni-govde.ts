/**
 * SABİT SAYFA METİNLERİNİN TİPLERİ VE SÜZGEÇLERİ (5 Eylül 2026 · istek:
 * "panelde, sitedeki bölümlerin tamamı düzeltilebiliyor mu" → "hepsini yap").
 *
 * Ana sayfa hero'su, katılım sayfasının başlığı ve KVKK aydınlatma metni koda
 * yazılıydı: bir cümleyi düzeltmek kod değişikliği ve dağıtım demekti. Üçü de
 * artık "Page" tablosunda birer TEKİL satır (section = 'anasayfa' / 'katilim' /
 * 'kvkk') ve panelden düzenleniyor.
 *
 * lib/sayfa-metni.ts'ten AYRI duruyor: o dosya `postgres` sürücüsünü içeri
 * alıyor ve panelin editörleri istemci bileşeni — sürücüyü tarayıcı paketine
 * sokmak derlemeyi durdururdu. Aynı ayrım alt bilgi, Hakkında ve zirve
 * tarafında da var.
 *
 * SERBEST HTML YOK: her alan düz metin, her liste sayılı bir tip. Panelden
 * gelen metin hiçbir yerde dangerouslySetInnerHTML'e verilmiyor, bu yüzden
 * içerik yazarının eline script geçmiyor.
 */

import { siteIciYolMu } from "./guvenli-adres";

function yazi(deger: unknown) {
  return typeof deger === "string" ? deger.trim() : "";
}

/* Çok satırlı alanlar (paragraf kutuları) kırpılmıyor: boş satır paragraf
   ayracı ve baştaki/sondaki satır sonu yazarın kendi düzeni. */
function metin(deger: unknown) {
  return typeof deger === "string" ? deger : "";
}

/**
 * Adresler yalnızca site içi yol, http(s), mailto: ya da tel: olabilir.
 * Panelden "javascript:" yazılabilseydi sayfa bir tıklama tuzağına dönerdi;
 * kural okuma tarafında da uygulanıyor çünkü tabloya elle satır girilebilir.
 * mailto/tel alt bilgideki listede yok, burada var: KVKK metninin başvuru
 * bölümü telefon ve e-posta bağlantısı taşıyor.
 */

export function guvenliSayfaAdresi(deger: unknown): string {
  const deger_ = yazi(deger);
  if (!deger_) return "";
  if (siteIciYolMu(deger_)) return deger_;
  if (deger_.startsWith("mailto:") || deger_.startsWith("tel:")) return deger_;
  return /^https?:\/\//i.test(deger_) ? deger_ : "";
}

/** Boş satırla ayrılmış metni paragraflara böler (sitedeki diğer gövdelerle
    aynı kural). */
export function paragraflaraBol(deger: string) {
  return deger.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/* ------------------------------------------------------------------ ANA SAYFA */

/*
 * DÜĞME ADRESLERİ BURADA YOK, BİLEREK: ana sayfadaki üç çağrı da GençTek
 * platformunun giriş adresine gidiyor ve o adres ortam değişkeninden geliyor
 * (bkz. lib/genctek-baglanti.ts). Panelden elle bir adres yazılabilseydi
 * platform taşındığı gün portal eski adrese göndermeye devam ederdi.
 * Değiştirilebilen, düğmenin ÜZERİNDEKİ YAZI.
 */
export type AnaSayfaMetni = {
  hero: { ustEtiket: string; baslik: string; vurgu: string; metin: string; dugme: string };
  panel: { donem: string; durum: string; ustSatir: string; marka: string; markaVurgu: string };
  /** Hero'nun altındaki ince şerit; boş bırakılırsa şerit hiç basılmaz. */
  serit: string[];
  haberler: { ustEtiket: string; baslik: string; baglanti: string };
  hakkinda: { ustEtiket: string; baslik: string };
  etkinlikler: { ustEtiket: string; baslik: string; metin: string; baglanti: string; bosMetin: string };
  cagri: { ustEtiket: string; baslik: string; metin: string; dugme: string };
};

export function anaSayfaMetniniCoz(ham: unknown): AnaSayfaMetni {
  const g = (ham ?? {}) as Record<string, unknown>;
  const bolum = (ad: string) => ((g[ad] ?? {}) as Record<string, unknown>);
  const hero = bolum("hero");
  const panel = bolum("panel");
  const haberler = bolum("haberler");
  const hakkinda = bolum("hakkinda");
  const etkinlikler = bolum("etkinlikler");
  const cagri = bolum("cagri");

  return {
    hero: {
      ustEtiket: yazi(hero.ustEtiket),
      baslik: yazi(hero.baslik),
      vurgu: yazi(hero.vurgu),
      metin: metin(hero.metin),
      dugme: yazi(hero.dugme),
    },
    panel: {
      donem: yazi(panel.donem),
      durum: yazi(panel.durum),
      ustSatir: yazi(panel.ustSatir),
      marka: yazi(panel.marka),
      markaVurgu: yazi(panel.markaVurgu),
    },
    serit: (Array.isArray(g.serit) ? g.serit : []).map(yazi).filter(Boolean),
    haberler: {
      ustEtiket: yazi(haberler.ustEtiket),
      baslik: yazi(haberler.baslik),
      baglanti: yazi(haberler.baglanti),
    },
    hakkinda: { ustEtiket: yazi(hakkinda.ustEtiket), baslik: yazi(hakkinda.baslik) },
    etkinlikler: {
      ustEtiket: yazi(etkinlikler.ustEtiket),
      baslik: yazi(etkinlikler.baslik),
      metin: metin(etkinlikler.metin),
      baglanti: yazi(etkinlikler.baglanti),
      bosMetin: metin(etkinlikler.bosMetin),
    },
    cagri: {
      ustEtiket: yazi(cagri.ustEtiket),
      baslik: yazi(cagri.baslik),
      metin: metin(cagri.metin),
      dugme: yazi(cagri.dugme),
    },
  };
}

/* ------------------------------------------------------------------- KATILIM */

export type KatilimMetni = { ustEtiket: string; baslik: string; spot: string };

export function katilimMetniniCoz(ham: unknown): KatilimMetni {
  const g = (ham ?? {}) as Record<string, unknown>;
  return { ustEtiket: yazi(g.ustEtiket), baslik: yazi(g.baslik), spot: metin(g.spot) };
}

/* ---------------------------------------------------------------------- KVKK */

/** Madde listesinin bir satırı. Başlığı olan madde kalın bir etiketle basılır
    ("Hizmet Sunumu: …"), olmayan düz cümledir (11. maddedeki haklar listesi). */
export type KvkkMaddesi = { baslik: string; metin: string };

/** Başvuru bölümündeki adres bloğunun bir satırı: düz metin, arkasından
    isteğe bağlı bir bağlantı ("Telefon: " + 0312 296 94 00). */
export type KvkkSatiri = { metin: string; baglantiMetni: string; adres: string };

export type KvkkBolumu = {
  /** Numarası başlığın parçası: "1. Veri Sorumlusu". Metnin kendi sırası
      korunsun diye ayrı bir alan tutulmuyor — bir bölüm araya girdiğinde
      numaralar elle düzeltilir, çünkü hukuki metinde numara bir atıf. */
  baslik: string;
  /** Boş satırla ayrılmış paragraflar; listenin üstünde basılır. */
  giris: string;
  maddeler: KvkkMaddesi[];
  satirlar: KvkkSatiri[];
};

export type KvkkMetni = {
  ustEtiket: string;
  baslik: string;
  spot: string;
  seoBaslik: string;
  seoAciklama: string;
  bolumler: KvkkBolumu[];
};

export function kvkkMetniniCoz(ham: unknown): KvkkMetni {
  const g = (ham ?? {}) as Record<string, unknown>;
  const bolumler = Array.isArray(g.bolumler) ? g.bolumler : [];

  return {
    ustEtiket: yazi(g.ustEtiket),
    baslik: yazi(g.baslik),
    spot: metin(g.spot),
    seoBaslik: yazi(g.seoBaslik),
    seoAciklama: yazi(g.seoAciklama),
    bolumler: bolumler
      .map((o) => {
        const b = (o ?? {}) as Record<string, unknown>;
        return {
          baslik: yazi(b.baslik),
          giris: metin(b.giris),
          maddeler: (Array.isArray(b.maddeler) ? b.maddeler : [])
            .map((m) => {
              const madde = (m ?? {}) as Record<string, unknown>;
              return { baslik: yazi(madde.baslik), metin: metin(madde.metin) };
            })
            // Başlığı da metni de boş madde, listede boş bir madde imi olurdu.
            .filter((madde) => madde.baslik || madde.metin.trim()),
          satirlar: (Array.isArray(b.satirlar) ? b.satirlar : [])
            .map((s) => {
              const satir = (s ?? {}) as Record<string, unknown>;
              return {
                metin: yazi(satir.metin),
                baglantiMetni: yazi(satir.baglantiMetni),
                adres: guvenliSayfaAdresi(satir.adres),
              };
            })
            .filter((satir) => satir.metin || satir.baglantiMetni),
        };
      })
      // Başlıksız ve içeriksiz bölüm, sayfada boş bir aralık bırakırdı.
      .filter((b) => b.baslik || b.giris.trim() || b.maddeler.length || b.satirlar.length),
  };
}
