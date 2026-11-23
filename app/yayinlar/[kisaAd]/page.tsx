import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { YayinOkuyucu } from "@/components/yayin-okuyucu";
import { uygulamaYolu } from "@/lib/ortam";
import { baskiAdresi, baskiSec, yayinBul, yayinDilleri, DIL_ADLARI } from "@/lib/yayinlar";

/**
 * TEK YAYIN — SAYFASI ÇEVRİLEBİLİR OKUYUCU (23 Kasım 2026).
 *
 * DİL ADRESTE (?dil=en): Türkçe ve İngilizce baskı aynı sayfada, üstteki
 * düğmelerle değişiyor. Paylaşılan bağlantı hangi dildeyse o dilde açılır.
 * İkinci dil henüz yoksa düğmeler hiç basılmaz.
 *
 * SAYFA METİNLERİ GİZLİ BİR BÖLÜMDE: kitap görsellerden oluşuyor; ekran
 * okuyucular ve arama motorları içeriği bu metinden okuyor.
 */
export const dynamic = "force-dynamic";

type Parametreler = {
  params: Promise<{ kisaAd: string }>;
  searchParams: Promise<{ [anahtar: string]: string | string[] | undefined }>;
};

async function coz({ params, searchParams }: Parametreler) {
  const yayin = await yayinBul((await params).kisaAd);
  if (!yayin) return null;
  const istenen = (await searchParams).dil;
  const [dil, baski] = baskiSec(yayin, typeof istenen === "string" ? istenen : undefined);
  return { yayin, dil, baski };
}

export async function generateMetadata(p: Parametreler): Promise<Metadata> {
  const bulunan = await coz(p);
  if (!bulunan) return {};
  return {
    title: `${bulunan.baski.baslik} · GençTek`,
    description: bulunan.baski.metinler.slice(0, 2).join(" ").slice(0, 160),
  };
}

export default async function YayinSayfasi(p: Parametreler) {
  const bulunan = await coz(p);
  if (!bulunan) notFound();
  const { yayin, dil, baski } = bulunan;
  const kok = uygulamaYolu(`/yayinlar/${yayin.kisaAd}/${dil}`);
  const diller = yayinDilleri(yayin);

  return <>
    <Header />
    <main lang={dil}>
      <section className="page-hero compact">
        <div className="container">
          <Link className="back-link" href="/yayinlar">← {dil === "en" ? "Publications" : "Yayınlar"}</Link>
          <h1>{baski.baslik}</h1>
          {diller.length > 1 && (
            <nav className="yayin-diller" aria-label={dil === "en" ? "Language" : "Dil"}>
              {diller.map((d) => (
                <Link key={d} className="button button-secondary" lang={d}
                  href={baskiAdresi(yayin.kisaAd, d)}
                  aria-current={d === dil ? "page" : undefined}>
                  {DIL_ADLARI[d]}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <YayinOkuyucu key={dil} kokAdres={kok} sayfaSayisi={baski.sayfaSayisi}
            genislik={baski.genislik} yukseklik={baski.yukseklik} pdfAdresi={`${kok}/${baski.pdf}`} dil={dil} />
          <div className="sr-only">
            {baski.metinler.map((metin, i) => metin && (
              <section key={i} aria-label={`${dil === "en" ? "Page" : "Sayfa"} ${i + 1}`}><p>{metin}</p></section>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
