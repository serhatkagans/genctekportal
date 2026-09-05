import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { KvkkGovdesi } from "@/components/kvkk-govdesi";
import { kvkkMetniniOku } from "@/lib/sayfa-metni";

/* ÜST MENÜ VERİTABANINDAN GELİYOR (4 Eylül 2026): Hakkında başlıkları ve zirve
   listesi panelden değişiyor. Bu sayfa derleme anında basılsaydı menüsü o günün
   hâlinde donar, panelden eklenen başlık burada görünmezdi. Metnin kendisi de
   5 Eylül 2026'da tabloya taşındı; aynı gerekçe artık gövde için de geçerli. */
export const dynamic = "force-dynamic";

/*
 * AYDINLATMA METNİ YEĞİTEK'TEN GELDİ (31 Ağustos 2026 · istek: "kvkk sayfasına
 * bunu koy"). Sayfada önce "prototip bildirimi" duruyordu — site canlı olduğu
 * için o metin yanıltıcıydı, yerini kurumun kendi metni aldı.
 *
 * METİN 5 EYLÜL 2026'DA PANELE TAŞINDI (istek: "hepsini yap"). Bölümler,
 * maddeler ve başvuru adresi "Page" tablosunda (section = 'kvkk') ve
 * /yonetim/kvkk ekranından düzenleniyor. Tabloda satır yoksa metin
 * data-ornek/kvkk.json'daki hâline düşüyor — yani buradaki içerik, taşınmadan
 * önceki metnin birebir aynısı; bir göç betiği çalıştırmak gerekmiyor.
 *
 * BAŞVURU ADRESİ ARTIK DÜZENLENEBİLİR: eskiden "hukuki metnin parçası" diye
 * kodda tutuluyordu. Gerekçe hâlâ geçerli ama sonucu yanlıştı — adres
 * değiştiğinde metnin de değişmesi gerekiyor, ikisi de aynı ekranda
 * değiştirilebildiği için artık birlikte güncelleniyorlar.
 */
export async function generateMetadata(): Promise<Metadata> {
  const metin = await kvkkMetniniOku();
  return {
    title: metin.seoBaslik || `${metin.baslik} · GençTek`,
    description: metin.seoAciklama,
  };
}

export default async function KvkkSayfasi() {
  const metin = await kvkkMetniniOku();

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container">
          {metin.ustEtiket ? <span className="eyebrow">{metin.ustEtiket}</span> : null}
          <h1>{metin.baslik}</h1>
          {metin.spot ? <p>{metin.spot}</p> : null}
        </div>
      </section>

      <KvkkGovdesi bolumler={metin.bolumler} />
    </main>
    <Footer />
  </>;
}
