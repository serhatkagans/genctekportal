import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { gorselYolu } from "@/lib/ortam";

export const metadata = {
  title: "GençTek Kurumsal · GençTek",
  description: "GençTek marka öğeleri, kullanım kuralları ve indirilebilir dosyalar.",
};

/**
 * MARKA ÖĞELERİ.
 *
 * Dosyalar public/marka altında ve depoda İZLENİYOR: indirilebilir marka
 * dosyaları sayfanın kendisi kadar koddur, dağıtımla birlikte gitsinler.
 * Videolarla aynı kefeye konmadılar — onlar yüzlerce MB, bunlar toplam 10 MB.
 *
 * Yeni bir dosya geldiğinde bu diziye bir satır eklemek yeterli; sayfa
 * listeden besleniyor, elle kart yazılmıyor.
 *
 * OLMAYAN DOSYA UYDURULMAZ: "logo-yatay.svg" gibi var sayılan bağlantılar
 * koymak, tıklayan herkese 404 verirdi. Eksikler aşağıdaki notta açıkça
 * yazılı.
 */
const ogeler = [
  {
    ad: "GençTek logo",
    dosya: "/marka/genctek-logo.rar",
    aciklama: "Amblemin kullanıma hazır sürümlerini içeren arşiv (RAR).",
  },
  {
    ad: "Renk kodları",
    dosya: "/marka/genctek_logo_2024_b.pdf",
    aciklama: "Marka renkleri ve logo kullanımı (PDF).",
  },
];

/*
 * HENÜZ AÇILMAYAN BAŞLIKLAR (31 Ağustos 2026 · istek: "sunum, video, yaka
 * kartları sayfaları da olsun ama pasif şimdilik"). Kartlar görünür ama
 * tıklanmaz; dosyalar geldiğinde yukarıdaki `ogeler` listesine taşınacak.
 */
const yakinda = [
  { ad: "Sunum şablonları", aciklama: "GençTek sunum şablonu dosyaları." },
  { ad: "Video", aciklama: "Tanıtım videoları ve jenerik öğeleri." },
  { ad: "Yaka kartları", aciklama: "Etkinlik yaka kartı tasarımları." },
];

/*
 * Kullanım kuralları: markayı koruyan asgari çerçeve. Kurumsal kimlik kılavuzu
 * yayımlandığında bu liste onun özeti hâline gelmeli, yerine geçmemeli.
 */
const kurallar = [
  "Amblemin en boy oranını değiştirmeyin; sıkıştırmayın, esnetmeyin.",
  "Çevresinde amblem yüksekliğinin en az yarısı kadar boşluk bırakın.",
  "Renklerini değiştirmeyin; koyu zeminde beyaz sürümü kullanın.",
  "Amblemi başka bir logoyla birleştirip yeni bir işaret üretmeyin.",
  "Okunabilirliği bozacak kadar küçültmeyin.",
];

export default function LogolarSayfasi() {
  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/#hakkinda">← Hakkında</Link>
          <span className="eyebrow">Tanıtım Tasarımları</span>
          <h1>GençTek Kurumsal</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card-grid">
            {ogeler.map((oge) => (
              <a className="content-card marka-karti" href={gorselYolu(oge.dosya)} download key={oge.dosya}>
                <span className="card-body">
                  <span className="chip">Dosyayı indir</span>
                  <h3>{oge.ad}</h3>
                  <p>{oge.aciklama}</p>
                </span>
              </a>
            ))}
          </div>
          <div className="card-grid" style={{ marginTop: 24 }}>
            {yakinda.map((oge) => (
              <div className="content-card marka-karti marka-karti-pasif" key={oge.ad} aria-disabled="true">
                <span className="card-body">
                  <span className="chip">Yakında</span>
                  <h3>{oge.ad}</h3>
                  <p>{oge.aciklama}</p>
                </span>
              </div>
            ))}
          </div>
          {/*
            EKSİKLER SAYFADA YAZILI: "burada olmalıydı ama yok" demek, sessizce
            boş bırakmaktan iyidir — dosyayı elinde tutan kişi neyin
            beklendiğini görür.
          */}
          <p className="etkinlik-bos" style={{ marginTop: 24 }}>
            Roll-up şablonları, yatay/dikey logo varyantları ve vektörel (SVG) sürümler henüz yüklenmedi. Dosyalar geldiğinde bu listeye eklenecek.
          </p>
        </div>
      </section>

      <section className="section themes-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Dikkat</span>
              <h2>Kullanım kuralları</h2>
            </div>
          </div>
          <div className="value-list">
            {kurallar.map((kural, sira) => (
              <article key={kural}>
                <span>{String(sira + 1).padStart(2, "0")}</span>
                <h3>{kural}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </>;
}
