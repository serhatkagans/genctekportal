import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HakkindaKartlari } from "@/components/hakkinda-kartlari";
import { gorselYolu } from "@/lib/ortam";

export const metadata = {
  title: "Logolar ve roll-up'lar · GençTek",
  description: "GençTek marka öğeleri, kullanım kuralları ve indirilebilir dosyalar.",
};

/**
 * MARKA ÖĞELERİ.
 *
 * DOSYALAR HENÜZ TEK: portalın `public` klasöründe bugün yalnızca GençTek
 * amblemi (Genc.png) var. Roll-up, afiş ve yatay/dikey logo varyantları
 * eklendiğinde bu diziye birer satır eklenmesi yeterli — sayfa listeden
 * besleniyor, elle kart yazılmıyor.
 *
 * OLMAYAN DOSYA UYDURULMADI: "logo-yatay.svg" gibi var sayılan bağlantılar
 * koymak, tıklayan herkese 404 verirdi. Eksikler aşağıdaki notta açıkça
 * yazılı.
 */
const ogeler = [
  {
    ad: "GençTek amblemi",
    dosya: "/Genc.png",
    aciklama: "Ana amblem. Açık ve koyu zeminde kullanılabilir.",
  },
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
          <Link className="back-link" href="/hakkinda">← Hakkında</Link>
          <span className="eyebrow">Marka</span>
          <h1>Logolar ve roll-up&apos;lar</h1>
          <p>GençTek görsel kimliğine ait öğeler ve kullanım kuralları. Etkinlik afişi, sunum ya da roll-up hazırlarken bu dosyaları kullanın.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">İndirilebilir</span>
              <h2>Marka öğeleri</h2>
            </div>
          </div>
          <div className="card-grid">
            {ogeler.map((oge) => (
              <a className="content-card marka-karti" href={gorselYolu(oge.dosya)} download key={oge.dosya}>
                <span className="marka-onizleme">
                  <Image src={gorselYolu(oge.dosya)} alt={`${oge.ad} önizlemesi`} width={220} height={140} sizes="220px" />
                </span>
                <span className="card-body">
                  <span className="chip">Dosyayı indir</span>
                  <h3>{oge.ad}</h3>
                  <p>{oge.aciklama}</p>
                </span>
              </a>
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

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Devamı</span>
              <h2>Diğer başlıklar</h2>
            </div>
          </div>
          <HakkindaKartlari haric="logolar" />
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
