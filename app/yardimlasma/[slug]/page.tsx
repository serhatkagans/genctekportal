import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { yardimlasmaGrubuBul, yardimlasmaParagraflari } from "@/lib/yardimlasma";

/* ÜST MENÜ VERİTABANINDAN GELİYOR (4 Eylül 2026): Hakkında başlıkları ve zirve
   listesi panelden değişiyor. Bu sayfa derleme anında basılsaydı menüsü o günün
   hâlinde donar, panelden eklenen başlık burada görünmezdi. */
export const dynamic = "force-dynamic";

/*
 * YARDIMLAŞMA GRUBU SAYFASI.
 *
 * İÇERİK PANELDEN (4 Eylül 2026): ad, kart görseli ve tanıtım metni "Page"
 * tablosunda (bkz. lib/yardimlasma.ts). Metin yazılmadıysa sayfa yine açılıyor
 * ve metnin hazırlandığını söylüyor — kart ve adres çalışmaya devam etsin diye.
 */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const grup = await yardimlasmaGrubuBul((await params).slug);
  return grup ? { title: `${grup.ad} · GençTek` } : {};
}

export default async function YardimlasmaGrubuSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const grup = await yardimlasmaGrubuBul((await params).slug);
  if (!grup) notFound();

  return <>
    <Header />
    <main>
      <section className="page-hero compact">
        <div className="container program-detay">
          <Link className="back-link" href="/temalar">← Çalışma Grupları</Link>
          <span className="eyebrow">Yardımlaşma grubu</span>
          <h1>{grup.ad}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container program-detay">
          {grup.metin
            ? yardimlasmaParagraflari(grup.metin).map((paragraf, i) => (
                <p className="program-detay-metin" key={i}>{paragraf}</p>
              ))
            : <p className="program-detay-metin">Bu yardımlaşma grubunun tanıtım metni hazırlanıyor.</p>}
        </div>
      </section>

    </main>
    <Footer />
  </>;
}
