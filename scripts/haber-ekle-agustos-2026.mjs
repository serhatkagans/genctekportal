/*
 * AĞUSTOS 2026'NIN İKİ HABERİ (31 Ağustos 2026 · istek: "2 yeni haber
 * eklenecek … antep ve siber").
 *
 * NEDEN BETİK, NEDEN DEPODA DEĞİL: haberler `data/haberler.json` içinde ve bu
 * dosya .gitignore'da — canlı içeriğin tek sahibi sunucu (bkz. .gitignore'daki
 * not). Yerelde elle eklemek yayına çıkmaz, dağıtım da dosyaya dokunmaz. Bu
 * yüzden haberler koda değil, sunucuda bir kez çalıştırılacak betiğe yazıldı:
 *
 *     node scripts/haber-ekle-agustos-2026.mjs
 *
 * Betik aynı slug varsa kendini durdurur, iki kez çalıştırmak zararsızdır.
 * Görseller `public/medya` altında ve depoda izleniyor, onlar dağıtımla gelir.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const KOK = path.join(import.meta.dirname, "..");
// data/ canlı içerik, data-ornek/ yeni kurulumların başlangıç kopyası: ikisi de
// güncellenmeli, yoksa temiz bir makinede haberler eksik başlar.
const DOSYALAR = [path.join(KOK, "data", "haberler.json"), path.join(KOK, "data-ornek", "haberler.json")];

/** Düz metin bloklarını panelin ürettiği HTML'in aynısına çevirir (bkz. lib/haber-bicim.ts). */
function html(bloklar) {
  return bloklar
    .map((blok) =>
      blok.gorsel
        ? `<figure><img src="${blok.gorsel}" alt="${blok.alt}" loading="lazy" /><figcaption>${blok.alt}</figcaption></figure>`
        : `<p>${blok.metin}</p>`)
    .join("\n");
}

/** Panelde yeniden düzenlenebilsin diye gövdenin düz metin kaynağı. */
function kaynak(bloklar) {
  return bloklar.map((blok) => (blok.gorsel ? `[gorsel:${blok.gorsel}|${blok.alt}]` : blok.metin)).join("\n\n");
}

const HABERLER = [
  {
    id: 90001,
    slug: "yegitek-hizmetleri-subesi-koordinasyon-toplantisi",
    title: "YEĞİTEK Hizmetleri Şubesi Koordinasyon Toplantısı",
    excerpt:
      "81 ilden YEĞİTEK il yöneticileri ve şube müdürleri, GençTek faaliyetlerinin görüşüldüğü koordinasyon toplantısı için 24-25 Ağustos 2026'da Gaziantep'te bir araya geldi.",
    date: "2026-08-25T10:00:00",
    kapak: "/medya/yegitek-koordinasyon-gaziantep-1.jpg",
    bloklar: [
      { metin: "Genç Bilişim Ekosistemi Koordinatörlüğü (GençTek) tarafından yürütülen faaliyetler ve gerçekleştirilen çalışmalar hakkında bilgilendirme yapmak amacıyla düzenlenen YEĞİTEK Hizmetleri Şubesi Koordinasyon Toplantısı, 24-25 Ağustos 2026 tarihlerinde Gaziantep Öğretmenevinde gerçekleştirildi." },
      { gorsel: "/medya/yegitek-koordinasyon-gaziantep-1.jpg", alt: "Gaziantep Öğretmenevindeki YEĞİTEK Hizmetleri Şubesi Koordinasyon Toplantısı açılış konuşması ve toplantı afişi" },
      { metin: "Toplantının açılışı, Yenilik ve Eğitim Teknolojileri Genel Müdürü Sayın Mustafa Canlı tarafından gerçekleştirildi. Toplantıda, Genç Bilişim Ekosistemi ve Akran Öğrenimi Koordinatörlüğü tarafından 81 ilden gelen YEĞİTEK il yöneticileri ve şube müdürlerine GençTek faaliyetlerinin temel amacı, faaliyet temaları ve illerde gerçekleştirilen örnek uygulamalar hakkında kapsamlı bilgilendirme yapıldı." },
      { gorsel: "/medya/yegitek-koordinasyon-gaziantep-3.jpg", alt: "Sahnedeki dev ekranda illerde yapılan GençTek çalışmalarından fotoğrafların gösterilmesi" },
      { metin: "Ayrıca YEĞİTEK bünyesinde görev yapan diğer koordinatörler tarafından kendi çalışma alanlarına ilişkin sunumlar gerçekleştirilerek yürütülen faaliyetler, uygulama süreçleri ve illerde gerçekleştirilebilecek çalışmalar hakkında katılımcılara bilgi verildi." },
      { gorsel: "/medya/yegitek-koordinasyon-gaziantep-5.jpg", alt: "Genç Bilişim Ekosistemi başlığının yer aldığı sunum şeması ve sunumu yapan uzman" },
      { metin: "Toplantı kapsamında GençTek çalışmalarının illerde yaygınlaştırılması, koordinasyon süreçlerinin güçlendirilmesi, iyi uygulama örneklerinin paylaşılması ve il düzeyindeki çalışmaların daha etkin şekilde yürütülmesine yönelik değerlendirmelerde bulunuldu." },
      { gorsel: "/medya/yegitek-koordinasyon-gaziantep-2.jpg", alt: "Toplantının çalışma oturumunda yuvarlak masada görüşen katılımcılar" },
      { gorsel: "/medya/yegitek-koordinasyon-gaziantep-4.jpg", alt: "Salondaki masalarda oturan il yöneticileri ve şube müdürleri" },
    ],
  },
  {
    id: 90002,
    slug: "siber-guvenlik-kampi-2026",
    title: "Siber Güvenlik Kampı",
    excerpt:
      "Genç Bilişim Ekosistemi Koordinatörlüğü ve Türkiye Siber Güvenlik Kümelenmesi iş birliğiyle, ETKİM ev sahipliğinde 17-21 Ağustos 2026 tarihlerinde beş günlük Siber Güvenlik Kampı gerçekleştirildi.",
    date: "2026-08-21T10:00:00",
    kapak: "/medya/siber-guvenlik-kampi-1.jpg",
    bloklar: [
      { metin: "Siber Güvenlik Kampı; öğrencilerin siber güvenlik alanındaki bilgi ve becerilerini geliştirmek, dijital dünyada güvenli ve bilinçli bireyler olarak yetişmelerine katkı sağlamak ve siber güvenlik alanındaki kariyer gelişimlerini desteklemek amacıyla düzenlendi." },
      { gorsel: "/medya/siber-guvenlik-kampi-1.jpg", alt: "Siber Güvenlik Kampı'nın açılış oturumunu izleyen öğrenciler" },
      { metin: "Kamp, Genç Bilişim Ekosistemi Koordinatörlüğü ve Türkiye Siber Güvenlik Kümelenmesi iş birliğiyle, ETKİM ev sahipliğinde 17-21 Ağustos 2026 tarihleri arasında gerçekleştirildi. Antalya ilinden Alanya İrfan Bileydi Mesleki ve Teknik Anadolu Lisesi öğrencilerinin katıldığı 5 günlük programda, siber güvenliğin temel kavramlarından uygulamalı çalışmalara uzanan kapsamlı bir eğitim süreci yürütüldü." },
      { gorsel: "/medya/siber-guvenlik-kampi-2.jpg", alt: "Kamp katılımcılarının bilgisayarları başında uygulamalı çalışma yapması" },
      { metin: "Eğitimlerde bilgi ve dijital güvenlik farkındalığının geliştirilmesinin yanı sıra siber tehditler, saldırı türleri, korunma yöntemleri, ağ ve sistem güvenliği, siber güvenlik araçları ve uygulama süreçlerine ilişkin çalışmalar gerçekleştirildi." },
      { gorsel: "/medya/siber-guvenlik-kampi-3.jpg", alt: "Kampın açılışında konuşan eğitmenler ve program yürütücüleri" },
      { metin: "Program süresince öğrencilerin teorik bilgilerini uygulamalı çalışmalarla pekiştirmelerine, problem çözme ve analitik düşünme becerilerini geliştirmelerine ve siber güvenlik alanındaki kariyer ve gelişim imkânları hakkında bilgi edinmelerine yönelik etkinlikler yapıldı." },
      { gorsel: "/medya/siber-guvenlik-kampi-4.jpg", alt: "Kampı tamamlayan öğrencilerin katılım belgeleriyle toplu fotoğrafı" },
      { gorsel: "/medya/siber-guvenlik-kampi-5.jpg", alt: "Siber Güvenlik Kampı katılımcılarının ETKİM binası önündeki toplu fotoğrafı" },
    ],
  },
];

function kayda(haber) {
  return {
    id: haber.id,
    type: "post",
    slug: haber.slug,
    path: haber.slug,
    title: haber.title,
    excerpt: haber.excerpt,
    date: haber.date,
    modified: haber.date,
    link: "",
    parent: 0,
    menuOrder: 0,
    categories: [40],
    featuredImage: haber.kapak,
    html: html(haber.bloklar),
    bicim: "duz",
    kaynak: kaynak(haber.bloklar),
  };
}

for (const dosya of DOSYALAR) {
  let kayitlar;
  try {
    kayitlar = JSON.parse(await readFile(dosya, "utf8"));
  } catch (hata) {
    if (hata.code !== "ENOENT") throw hata;
    console.log(`atlandı (dosya yok): ${dosya}`);
    continue;
  }

  const eklenecek = HABERLER.filter((haber) => !kayitlar.some((kayit) => kayit.slug === haber.slug));
  if (eklenecek.length === 0) {
    console.log(`zaten ekli: ${dosya}`);
    continue;
  }

  // Liste yeniden eskiye sıralı; yeni haberler başa girer.
  kayitlar.unshift(...eklenecek.map(kayda));
  await writeFile(dosya, JSON.stringify(kayitlar, null, 2) + "\n", "utf8");
  console.log(`${eklenecek.length} haber eklendi: ${dosya}`);
}
