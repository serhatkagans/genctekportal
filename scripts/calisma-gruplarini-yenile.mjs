// ÇALIŞMA GRUBU LİSTESİNİ YEĞİTEK'İN VERDİĞİ 15 BAŞLIĞA GETİRİR
// (31 Ağustos 2026 · istek: "çalışma gruplarının tanımlarını şunlarla değiştir",
// ardından "liste tamamen bu 15 olsun").
//
// scripts/calisma-gruplarini-tamamla.mjs YALNIZCA EKLİYORDU; bu betik listeyi
// birebir eşitler:
//   · adı tutan kayıt GÜNCELLENİR — slug, görsel, odak ve çıktılar korunur,
//     çünkü /temalar/<slug> adresleri paylaşılmış olabilir ve görselleri
//     yeniden yüklemek gerekmesin;
//   · eksik grup EKLENİR (görsel/odak/çıktı boş, panelden doldurulacak);
//   · listede olmayan grup SİLİNİR. Etkinlikler temaya `onDelete: SetNull` ile
//     bağlı, silinen grup etkinliği götürmez — yalnızca bağı kopar.
//
// Sıra listedeki sıradır ("order" sütunu), /temalar sayfası onu kullanır.
//
// Kullanım:
//   node scripts/calisma-gruplarini-yenile.mjs            → önizleme
//   node scripts/calisma-gruplarini-yenile.mjs --uygula   → yazar
//
// SUNUCUDA DA ÇALIŞTIRILMALI: içerik veritabanında, depoda değil.
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import postgres from "postgres";

if (existsSync(".env")) process.loadEnvFile(".env");

const baglantiYolu = process.env.DATABASE_URL;
if (!baglantiYolu) {
  console.error("DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

// Metinler YEĞİTEK'ten geldi ve olduğu gibi duruyor. `ozet` kart yüzü için
// tek cümle; uzun metnin ilk cümlesinden kısaltıldı.
const CALISMA_GRUPLARI = [
  {
    ad: "Oyun Tasarımı",
    ozet: "Fikirden oynanabilir oyuna uzanan üretim sürecini ekipçe deneyimle.",
    metin: "Oyun geliştirmeye ilgi duyan öğrencilerin farklı disiplinleri bir araya getirerek fikirden oynanabilir oyuna uzanan bir üretim sürecini deneyimlemelerini amaçlar. Oyun mekaniği, hikâye ve seviye tasarımı, görsel tasarım, programlama, kullanıcı deneyimi ve oyun testleri gibi alanlarda çalışmalar yürütülür. Öğrenciler ekipler oluşturarak prototipler geliştirir, oyunlarını test eder ve geri bildirimlerle iyileştirir. EğitiJAM K12 Oyun Geliştirme Maratonu ve oyun geliştirme atölyeleri ile kısa sürede fikir üretme, görev paylaşımı ve çalışan bir oyun ortaya çıkarma deneyimi kazanırlar. Bunun yanında öğrencilerin Türkiye ve dünyadaki oyun sektörünü, farklı meslekleri ve oyunların bir ürüne dönüşme süreçlerini tanımaları; kendi potansiyellerini sektörün geleceğinde nasıl konumlandırabileceklerini keşfetmeleri desteklenir. Oyun Tasarımı çalışma grubu ayrıca öğrenme deneyimlerini dijital oyunlar ile keyifli, kalıcı ve ilgi çekici hâle getirmeyi, öğrencilerin hayatlarında önemli bir yer kaplayan dijital oyunlardan gelişim fırsatı olarak yararlanılabilecek fikirler geliştirmeyi hedefler.",
  },
  {
    ad: "Bilgisayar Olimpiyatları",
    ozet: "Algoritmik düşünmeyi olimpiyat kültürü içinde ileri düzeye taşı.",
    metin: "Algoritmik düşünme ve programlama konusunda kendini ileri düzeyde geliştirmek isteyen öğrencilerin olimpiyat kültürü etrafında bir araya gelmesini amaçlar. Ülkemizi uluslararası platformlarda başarıyla temsil edecek öğrencilerin farkındalıklarını ve gelişimini desteklemeyi hedefler. Çalışma grubunda algoritma tasarımı, veri yapıları, matematiksel düşünme, optimizasyon ve yarışma programlaması gibi ileri düzey konular üzerinde çalışılır. Öğrenciler olimpiyat kültürünü tanır, farklı zorluk seviyelerindeki problemleri analiz eder, birden fazla çözüm yaklaşımını karşılaştırır ve çözümlerini daha verimli hâle getirmeye çalışır. Böylece yalnızca soru çözmek değil, olimpiyatlara özgü problem çözme yaklaşımını ve algoritmik düşünme biçimini geliştirmek hedeflenir. Öğrencilerin bu yetkinliklerin yazılım, yapay zekâ ve teknoloji sektöründeki karşılığını görmeleri ve ileri düzey teknik yetkinliklerini gelecekteki kariyerlerine taşıyabilecekleri alanları keşfetmeleri desteklenir.",
  },
  {
    ad: "Web Programlama",
    ozet: "Web teknolojileriyle gerçek ürünler geliştir, ekipçe yayına al.",
    metin: "Web teknolojileriyle gerçek ürünler geliştirmek isteyen öğrencilerin bir araya gelerek öğrenme ve üretme süreçlerini birlikte yürütmelerini amaçlar. HTML, CSS, JavaScript ve modern web teknolojilerinin yanı sıra kullanıcı arayüzü, sunucu dilleri, kullanıcı deneyimi, veri tabanları ve web servisleri gibi konular ele alınır. Öğrenciler web siteleri ve web tabanlı uygulamalar geliştirir, ekipler hâlinde çalışır ve ortaya çıkardıkları projeleri paylaşarak geliştirir. Ürün geliştirme süreçlerini deneyimleyen öğrencilerin yazılım sektöründeki farklı uzmanlık alanlarını ve kariyer yollarını tanımaları da desteklenir.",
  },
  {
    ad: "Robotik",
    ozet: "Robotik sistemleri tasarla, programla ve gerçek ortamda test et.",
    metin: "Robotik sistemleri tasarlamak, programlamak ve gerçek dünyada test etmek isteyen öğrencileri bir araya getirir. Robot tasarımı, sensörler, motorlar, mikrodenetleyiciler, gömülü sistemler, kontrol ve otonom hareket gibi konular üzerine uygulamalı çalışmalar yapılır. Robot futbolu, robotik yarışmaları ve proje tabanlı çalışmalar aracılığıyla öğrenciler tasarladıkları sistemleri gerçek ortamda test eder, hataları analiz eder ve ekip olarak çözüm geliştirir. Öğrencilerin robotik ve otomasyon teknolojilerinin savunma sanayisinden üretime, sağlık teknolojilerinden akıllı sistemlere kadar farklı sektörlerdeki kullanım alanlarını tanımaları ve geleceğin teknolojilerinde üstlenebilecekleri rolleri keşfetmeleri sağlanır.",
  },
  {
    ad: "E-Ticaret ve E-İhracat",
    ozet: "Dijital bir ürünü pazara ve dünyaya açmanın yollarını öğren.",
    metin: "Dijital ortamda ürün ve hizmetlerin nasıl pazara sunulduğunu ve farklı ülkelere nasıl ulaştırıldığını keşfetmek isteyen öğrencileri bir araya getirir. E-ticaret altyapıları, dijital pazarlama, müşteri deneyimi, dijital ödeme sistemleri, pazar yeri yönetimi, ürün konumlandırma ve e-ihracat süreçleri ele alınır. Öğrenciler fikirlerini iş modeline dönüştürür, hedef pazarlarını belirler ve ideathon ile fikir maratonlarında kendi dijital ticaret projelerini geliştirir. Böylece öğrenciler yalnızca e-ticareti tanımakla kalmaz; girişimcilik, ürün geliştirme, pazarlama ve uluslararası pazarlara açılma süreçlerini deneyimleyerek geleceğin dijital ekonomisindeki fırsatları keşfeder.",
  },
  {
    ad: "Dijital Sanatlar ve İçerik Geliştirme",
    ozet: "Dijital araçlarla üret; portfolyonu ve anlatını birlikte geliştir.",
    metin: "Dijital araçlarla yaratıcı içerikler üretmek isteyen öğrencilerin farklı üretim alanlarını keşfetmelerini ve birlikte çalışmalarını amaçlar. Grafik tasarım, illüstrasyon, 3D modelleme, animasyon, video, görsel efekt ve dijital hikâye anlatımı gibi alanlarda çalışmalar yürütülür. Öğrenciler dijital portfolyolar oluşturur, ürettikleri içerikleri paylaşır ve farklı disiplinlerdeki arkadaşlarıyla fikir alışverişinde bulunur. Çalışmalar aracılığıyla öğrencilerin yaratıcı endüstrilerdeki meslekleri ve dijital üretimin oyun, medya, reklam, tasarım ve içerik sektörlerindeki karşılığını tanımaları desteklenir.",
  },
  {
    ad: "Espor",
    ozet: "Esporu oyunculuk, takım yönetimi, yayıncılık ve organizasyonla ele al.",
    metin: "Esporu yalnızca oyun oynama üzerinden değil; oyunculuk, takım yönetimi, organizasyon, yayıncılık, içerik üretimi ve sektör boyutlarıyla ele alır. Öğrenciler takım oluşturma, takım içi iletişim, turnuva organizasyonu, canlı yayın, oyun analizi ve espor etkinliklerinin planlanması gibi farklı alanlarda deneyim kazanır. Turnuvalar, sektör buluşmaları ve oyun odaklı etkinliklerle gençlerin espor ekosistemindeki farklı kariyer ve üretim alanlarını keşfetmeleri desteklenir. Böylece öğrenciler esporun yalnızca oyunculuktan ibaret olmadığını; yönetim, teknoloji, medya, pazarlama ve organizasyon gibi birçok alanda profesyonel fırsatlar barındıran bir sektör olduğunu deneyimleyerek görür.",
  },
  {
    ad: "Siber Güvenlik",
    ozet: "CTF ve uygulamalı senaryolarla güvenliği teknik yönleriyle keşfet.",
    metin: "Siber güvenlik alanını teknik yönleriyle keşfetmek ve uygulamalı deneyim kazanmak isteyen öğrencileri bir araya getirir. Web güvenliği, ağ güvenliği, kriptografi, adli bilişim, güvenlik açıkları ve temel siber güvenlik araçları gibi konular seviyeye uygun uygulamalarla ele alınır. Capture The Flag (CTF) etkinlikleri ve uygulamalı senaryolar üzerinden öğrenciler güvenlik problemlerini analiz eder, görevleri çözer ve ekip çalışmasıyla teknik becerilerini geliştirir. Öğrencilerin siber güvenliğin kamu, finans, savunma, yazılım ve kritik altyapılar gibi farklı sektörler açısından taşıdığı önemi anlamaları ve geleceğin siber güvenlik uzmanları olarak üstlenebilecekleri rolleri keşfetmeleri desteklenir.",
  },
  {
    ad: "Mobil Programlama",
    ozet: "Kendi fikrini fikirden prototipe, prototipten ürüne dönüştür.",
    metin: "Mobil uygulama geliştirmeyi öğrenmek ve kendi fikirlerini çalışan uygulamalara dönüştürmek isteyen öğrencileri bir araya getirir. Mobil uygulama mimarisi, kullanıcı arayüzü ve deneyimi, veri kullanımı, API'ler ve uygulama geliştirme araçları üzerine çalışmalar yapılır. Öğrenciler Android ve iOS ekosistemlerini, kullanılan geliştirme yaklaşımlarını ve uygulamanın fikirden prototipe, prototipten ürüne dönüşme sürecini deneyimler. Ürün geliştirme süreci üzerinden öğrencilerin mobil uygulama sektörünü, girişimcilik fırsatlarını ve farklı teknik rollerin nasıl bir araya geldiğini tanımaları sağlanır.",
  },
  {
    ad: "Havacılık Sistemleri",
    ozet: "İHA ve uçuş sistemlerini uzmanlarla buluşarak yakından tanı.",
    metin: "Havacılık ve insansız hava araçları teknolojilerine ilgi duyan öğrencilerin bu alandaki güncel teknolojileri tanımalarını ve uzmanlarla buluşmalarını amaçlar. İHA sistemleri, uçuş kontrolü, sensörler, otonom sistemler, görüntü işleme ve hava araçlarının kullanım alanları gibi konular ele alınır. Sektör temsilcileri ve uzmanlarla gerçekleştirilen buluşmalarla öğrencilerin havacılık teknolojilerini tanımaları ve bu alandaki proje fikirlerini geliştirmeleri desteklenir. Böylece öğrenciler havacılık ve savunma teknolojilerindeki kariyer alanlarını, farklı mühendislik ve bilişim disiplinlerinin nasıl bir araya geldiğini görerek geleceğin teknoloji liderleri için gerekli bakış açısını geliştirmeye başlar.",
  },
  {
    ad: "Yapay Zekâ",
    ozet: "Yapay zekâyı kullanmakla kalma; nasıl çalıştığını anla ve uygula.",
    metin: "Yapay zekâyı yalnızca kullanan değil, nasıl çalıştığını anlayan ve farklı problemlerde uygulayabilen öğrencilerin yetişmesini destekler. Makine öğrenmesi, üretken yapay zekâ, veri, bilgisayarlı görü, doğal dil işleme ve yapay zekâ destekli uygulama geliştirme gibi konular öğrencilerin seviyelerine uygun biçimde ele alınır. Öğrenciler yapay zekâ araçlarını deneyimler, kendi uygulama fikirlerini geliştirir ve oyun, eğitim, tasarım ve bilişim gibi farklı alanlarda yapay zekâ tabanlı prototipler oluşturur. Bunun yanında öğrencilerin yapay zekânın geleceğin mesleklerini, sektörlerini ve çalışma biçimlerini nasıl dönüştürdüğünü anlamaları ve bu dönüşümün içinde nasıl bir rol üstlenebileceklerini keşfetmeleri amaçlanır.",
  },
  {
    ad: "Eğitim Teknolojileri",
    ozet: "Eğitimde bir ihtiyacı belirle, teknolojiyle çözüm prototipi geliştir.",
    metin: "Teknolojiyi eğitimde bir probleme çözüm üretmek için kullanmak isteyen öğrencileri bir araya getirir. Öğrenme deneyimi tasarımı, eğitim uygulamaları, yapay zekâ destekli öğrenme, oyunlaştırma, dijital içerik ve öğrenme analitiği gibi alanlarda çalışmalar yapılır. Öğrenciler eğitimde karşılaştıkları bir ihtiyacı belirler, kullanıcıyı ve problemi anlamaya çalışır, teknoloji tabanlı çözüm fikirleri geliştirir ve prototiplerini test eder. Eğitim Teknolojileri Fikir Maratonu gibi çalışmalar bu üretim sürecini destekler. Öğrencilerin aynı zamanda EdTech ekosistemini, eğitim teknolojilerindeki yeni eğilimleri ve eğitim ile teknolojiyi birleştiren girişimcilik ve kariyer fırsatlarını tanımaları sağlanır.",
  },
  {
    ad: "Açık Kaynak",
    ozet: "İncele, geliştir, belgele ve ürettiğini toplulukla paylaş.",
    metin: "Yazılımı yalnızca tüketmek yerine inceleme, değiştirme, geliştirme ve paylaşma kültürünü deneyimlemek isteyen öğrencileri bir araya getirir. Linux, Pardus, açık kaynak lisansları, Git/GitHub ve açık kaynak projelerine katkı süreçleri gibi konular ele alınır. Öğrenciler mevcut projeleri inceler, kod geliştirir, dokümantasyon hazırlar ve uygun projelere katkı sunmayı deneyimler. Uzman buluşmaları ve uygulamalı çalışmalarla açık kaynak ekosisteminin çalışma kültürü tanıtılır. Bu süreçte öğrenciler dünyanın farklı yerlerinden geliştiricilerle birlikte üretmenin, topluluk içinde sorumluluk almanın ve geliştirdiği bir projeye gerçek katkı sunmanın deneyimini kazanır.",
  },
  {
    ad: "Bilişim Hukuku ve Güvenli İnternet",
    ozet: "Dijital dünyada haklarını, sorumluluklarını ve güvenliği öğren.",
    metin: "Teknolojinin geliştirilmesi ve kullanılmasının beraberinde getirdiği hukuki, etik ve toplumsal sorular üzerine düşünmek isteyen öğrencileri bir araya getirir. Kişisel verilerin korunması, fikrî mülkiyet, telif hakları, yapay zekâ ve etik, dijital haklar, internet hukuku ve bilişim suçları gibi konular ele alınır. Bunun yanında dijital ayak izi, kişisel veriler, mahremiyet, algı yönetimleri, hesap güvenliği, oltalama, çevrim içi dolandırıcılık ve dijital vatandaşlık gibi konular işlenir. Öğrenciler gerçek yaşam senaryoları üzerinden riskleri ve hukuki boyutları analiz eder; teknoloji üretirken ve kullanırken sahip oldukları hak ve sorumlulukları keşfeder. Böylece geleceğin teknoloji profesyonellerinin yalnızca teknik olarak yetkin değil, etik, hukuki ve toplumsal sorumluluklarının farkında bireyler olarak yetişmeleri desteklenir.",
  },
  {
    ad: "GençX",
    ozet: "Kız öğrencilerin teknolojide üretimini, liderliğini ve görünürlüğünü destekler.",
    metin: "Kız öğrencilerin bilişim ve teknoloji alanlarında üreten, geliştiren, liderlik eden ve karar süreçlerinde yer alan bireyler olarak daha güçlü biçimde yer almalarını desteklemek amacıyla oluşturulmuştur. Çalışma grubunda farklı teknoloji alanlarından kız öğrenciler bir araya gelerek deneyimlerini paylaşır, ortak projeler geliştirir ve alan uzmanlarıyla buluşur. Atölyeler, teknik çalışmalar, rol model buluşmaları ve ortak üretim süreçleriyle öğrencilerin teknoloji alanındaki ilgi ve yetkinliklerini geliştirmeleri desteklenir. Sektörde farklı roller üstlenen kadınlarla kurulan bağlantılar ve rol model buluşmaları, öğrencilerin teknoloji sektöründeki kariyer yollarını görmelerine, kendi potansiyellerini keşfetmelerine ve geleceğin teknoloji liderleri arasında kendilerine bir yer hayal etmelerine katkı sağlar.",
  },
];

// Yeni ad ile veritabanındaki eski kayıt arasındaki köprü. Ad değiştiği için
// sluglaştırma tutmuyor; eşleşme elle kuruldu ki kayıt (ve adresi, görseli)
// korunsun. Buradaki slug bulunamazsa grup yeni kayıt olarak eklenir.
const ESKI_KAYIT = {
  "Oyun Tasarımı": "oyun-tasarimi-egitijam",
  "Dijital Sanatlar ve İçerik Geliştirme": "dijital-sanatlar",
  "Havacılık Sistemleri": "iha",
  "Yapay Zekâ": "yapay-zeka",
  Espor: "espor",
  "Açık Kaynak": "acik-kaynak",
  "E-Ticaret ve E-İhracat": "e-ticaret-e-ihracat",
  "Bilişim Hukuku ve Güvenli İnternet": "bilisim-hukuku-guvenli-internet",
};

// Depoda tutulmayan tema görsellerinin sunucudaki public/temalar yolları.
// Liste eşitlenirken yeni kayıtların görselsiz kalmaması ve sonradan eklenen
// kapakların mevcut kayıtlara bağlanması için burada açıkça eşleştirilir.
const GORSELLER = {
  Robotik: "/temalar/robotik.jpg",
  "Siber Güvenlik": "/temalar/siber-guvenlik.jpg",
  "Mobil Programlama": "/temalar/mobil-programlama.jpg",
  "Eğitim Teknolojileri": "/temalar/egitim-teknolojileri.jpg",
  GençX: "/temalar/gencx.jpg",
  "Havacılık Sistemleri": "/temalar/havacilik-sistemleri.jpg",
};

// lib/tema.ts içindeki sluglastir ile aynı.
function sluglastir(deger) {
  const harita = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u" };
  return deger
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (h) => harita[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const uygula = process.argv.includes("--uygula");
const sql = postgres(baglantiYolu, { max: 1 });

try {
  const mevcut = await sql`SELECT id, slug, name FROM "Theme" ORDER BY "order", "createdAt"`;
  const slugaGore = new Map(mevcut.map((t) => [t.slug, t]));

  const guncellenecek = [];
  const eklenecek = [];
  const kalanlar = new Set(mevcut.map((t) => t.slug));

  CALISMA_GRUPLARI.forEach((grup, sira) => {
    const eskiSlug = ESKI_KAYIT[grup.ad] ?? sluglastir(grup.ad);
    const kayit = slugaGore.get(eskiSlug);
    if (kayit) {
      kalanlar.delete(kayit.slug);
      guncellenecek.push({ ...grup, sira, slug: kayit.slug, eskiAd: kayit.name, gorsel: GORSELLER[grup.ad] });
    } else {
      eklenecek.push({ ...grup, sira, slug: sluglastir(grup.ad), gorsel: GORSELLER[grup.ad] ?? "" });
    }
  });

  const silinecek = mevcut.filter((t) => kalanlar.has(t.slug));

  for (const g of guncellenecek) {
    const adNotu = g.eskiAd === g.ad ? "" : `  (eski ad: ${g.eskiAd})`;
    console.log(`  = ${g.sira + 1}. ${g.ad} — güncellenecek /temalar/${g.slug}${adNotu}`);
  }
  for (const g of eklenecek) console.log(`  + ${g.sira + 1}. ${g.ad} — EKLENECEK /temalar/${g.slug}`);
  for (const t of silinecek) console.log(`  - ${t.name} — SİLİNECEK (${t.slug})`);

  if (!uygula) {
    console.log(`\nÖnizleme: ${guncellenecek.length} güncelleme, ${eklenecek.length} ekleme, ${silinecek.length} silme. Yazmak için --uygula ekleyin.`);
  } else {
    await sql.begin(async (tx) => {
      for (const g of guncellenecek) {
        await tx`
          UPDATE "Theme"
          SET name = ${g.ad}, summary = ${g.ozet}, description = ${sql.json(g.metin)},
              image = COALESCE(${g.gorsel ?? null}, image),
              "order" = ${g.sira}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE slug = ${g.slug}
        `;
      }
      for (const g of eklenecek) {
        await tx`
          INSERT INTO "Theme" (id, slug, name, summary, description, image, focus, outcomes, "order", "updatedAt")
          VALUES (${randomUUID()}, ${g.slug}, ${g.ad}, ${g.ozet}, ${sql.json(g.metin)}, ${g.gorsel}, ${[]}, ${[]}, ${g.sira}, CURRENT_TIMESTAMP)
        `;
      }
      if (silinecek.length) {
        await tx`DELETE FROM "Theme" WHERE slug IN ${tx(silinecek.map((t) => t.slug))}`;
      }
    });
    console.log(`\nListe eşitlendi: ${guncellenecek.length} güncellendi, ${eklenecek.length} eklendi, ${silinecek.length} silindi.`);
  }
} finally {
  await sql.end();
}
