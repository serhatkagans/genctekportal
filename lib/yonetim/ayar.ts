import { sql } from "@/lib/db";

/**
 * GENEL AYARLAR (20 Ağustos 2026 · istek: "ayarlar sayfasını yapmamışsın").
 *
 * Ekranın eski hâli dürüst bir yer tutucuydu: "form alanları doluydu ama
 * Kaydet hiçbir şey yapmıyordu". Artık değerler `GlobalSetting` tablosunda
 * duruyor ve gerçekten kullanılıyor — site başlığı, açıklaması ve iletişim
 * bilgisi sayfaların metadata'sına buradan geçiyor (bkz. app/layout.tsx).
 *
 * AYAR LİSTESİ KODDA SABİT, tabloda değil. Tablo anahtar-değer olduğu için
 * teoride her şey yazılabilir; ama panelde düzenlenebilecek alanların ne
 * olduğu, ne anlama geldiği ve nasıl doğrulanacağı burada tanımlı. Serbest
 * anahtar girişi bırakılsaydı, yazım hatası olan bir anahtar sessizce hiçbir
 * yerde kullanılmayan bir satır yaratırdı.
 *
 * DEĞER `Json` KOLONUNDA: şema öyle tanımlı. Metin bir ayar bile JSON dizesi
 * olarak yazılıyor ki ileride sayı/liste tutan bir ayar eklendiğinde kolon
 * tipi değişmek zorunda kalmasın.
 */

export type AyarTanimi = {
  anahtar: string;
  etiket: string;
  aciklama: string;
  varsayilan: string;
  cokSatirli?: boolean;
};

export const AYAR_TANIMLARI: AyarTanimi[] = [
  {
    anahtar: "site.baslik",
    etiket: "Site başlığı",
    aciklama: "Tarayıcı sekmesinde ve arama sonuçlarında görünen ad.",
    varsayilan: "GençTek",
  },
  {
    anahtar: "site.aciklama",
    etiket: "Site açıklaması",
    aciklama:
      "Arama sonuçlarında başlığın altında çıkan cümle. 160 karakteri aşmaması iyi olur.",
    varsayilan:
      "Gençlerin teknolojiyle ürettiği, paylaştığı ve birlikte büyüdüğü bilişim ekosistemi.",
    cokSatirli: true,
  },
  {
    anahtar: "iletisim.eposta",
    etiket: "İletişim e-postası",
    aciklama: "Alt bilgide gösterilen adres.",
    varsayilan: "genctek@eba.gov.tr",
  },
  {
    anahtar: "iletisim.kurum",
    etiket: "Kurum adı",
    aciklama: "Alt bilgide e-postanın altında yazan kurum.",
    varsayilan: "Millî Eğitim Bakanlığı",
  },
];

export type Ayarlar = Record<string, string>;

export type AyarSonucu =
  | { bagli: true; ayarlar: Ayarlar; guncelleme: Date | null }
  | { bagli: false; hata: string };

/** Tanımlı ayarların tamamı; tabloda olmayan anahtar varsayılanına düşer. */
export async function ayarlariOku(): Promise<AyarSonucu> {
  try {
    const satirlar = await sql<{ key: string; value: unknown; updatedAt: Date }[]>`
      SELECT key, value, "updatedAt" FROM "GlobalSetting"
    `;
    const kayitli = new Map(satirlar.map((satir) => [satir.key, satir.value]));
    const ayarlar: Ayarlar = {};
    for (const tanim of AYAR_TANIMLARI) {
      const deger = kayitli.get(tanim.anahtar);
      ayarlar[tanim.anahtar] =
        typeof deger === "string" && deger.trim() !== "" ? deger : tanim.varsayilan;
    }
    const guncelleme = satirlar.reduce<Date | null>(
      (enYeni, satir) =>
        !enYeni || satir.updatedAt > enYeni ? satir.updatedAt : enYeni,
      null,
    );
    return { bagli: true, ayarlar, guncelleme };
  } catch (hata) {
    return {
      bagli: false,
      hata: hata instanceof Error ? hata.message : "Bilinmeyen bağlantı hatası.",
    };
  }
}

/**
 * Ayarları OKUMANIN sessiz biçimi — sayfaların metadata'sı için.
 *
 * Veritabanı kapalıyken sayfa başlıksız kalmasın diye hata yutulur ve
 * varsayılanlar döner. Yönetim ekranı ise hatayı GÖSTERİR: orada "kaydettim
 * ama bir şey değişmedi" durumunun sebebini bilmek gerekir.
 */
export async function ayarlariOkuSessiz(): Promise<Ayarlar> {
  const sonuc = await ayarlariOku();
  if (sonuc.bagli) return sonuc.ayarlar;
  return Object.fromEntries(
    AYAR_TANIMLARI.map((tanim) => [tanim.anahtar, tanim.varsayilan]),
  );
}

/** Değişen ayarları yazar ve hangi anahtarların değiştiğini döndürür. */
export async function ayarlariYaz(yeni: Ayarlar): Promise<string[]> {
  const mevcut = await ayarlariOku();
  const oncekiler = mevcut.bagli ? mevcut.ayarlar : {};
  const degisenler: string[] = [];

  for (const tanim of AYAR_TANIMLARI) {
    const deger = (yeni[tanim.anahtar] ?? "").trim();
    // Boş bırakılan alan SİLİNMEZ, varsayılana döner: boş bir site başlığı
    // ekranı bozardı ve kullanıcı bunu ancak yayında fark ederdi.
    const yazilacak = deger === "" ? tanim.varsayilan : deger;
    if (oncekiler[tanim.anahtar] === yazilacak) continue;

    await sql`
      INSERT INTO "GlobalSetting" (key, value, "updatedAt")
      VALUES (${tanim.anahtar}, ${sql.json(yazilacak)}, now())
      ON CONFLICT (key) DO UPDATE
        SET value = ${sql.json(yazilacak)}, "updatedAt" = now()
    `;
    degisenler.push(tanim.anahtar);
  }

  return degisenler;
}
