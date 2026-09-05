import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ParticipationForm } from "@/components/participation-form";
import { katilimMetniniOku } from "@/lib/sayfa-metni";

/* ÜST MENÜ VERİTABANINDAN GELİYOR (4 Eylül 2026): Hakkında başlıkları ve zirve
   listesi panelden değişiyor. Bu sayfa derleme anında basılsaydı menüsü o günün
   hâlinde donar, panelden eklenen başlık burada görünmezdi.

   BAŞLIK BLOĞU DA TABLODAN (5 Eylül 2026 · istek: "hepsini yap"): üstteki üç
   satır /yonetim/katilim ekranından düzenleniyor. Formun ALANLARI hâlâ kodda —
   onlar Formlar ekranının işi. */
export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const metin = await katilimMetniniOku();

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
      <section className="section form-section"><ParticipationForm /></section>
    </main>
    <Footer />
  </>;
}
