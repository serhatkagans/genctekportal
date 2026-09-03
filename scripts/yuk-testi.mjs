// scripts/yuk-testi.mjs
// GençTek Portal - Performans ve Yük Testi Ölçüm Aracı

const BASE_URL = process.env.APP_URL || "http://localhost:3010";

async function olcumYap(url, secenekler = {}) {
  const t0 = performance.now();
  try {
    const res = await fetch(url, secenekler);
    const sure = performance.now() - t0;
    return { durum: res.status, sure, hata: null };
  } catch (err) {
    const sure = performance.now() - t0;
    return { durum: 0, sure, hata: err.message };
  }
}

async function eszamanliTest(ad, url, eszamanliAdet, toplamIstek, secenekler = {}) {
  console.log(`\n========================================`);
  console.log(`>>> ${ad}`);
  console.log(`Hedef URL: ${url}`);
  console.log(`Eşzamanlı İstek: ${eszamanliAdet}, Toplam İstek: ${toplamIstek}`);
  console.log(`----------------------------------------`);

  const baslangic = performance.now();
  const sonuclar = [];
  let yapilan = 0;

  async function calisan() {
    while (yapilan < toplamIstek) {
      yapilan++;
      const sonuc = await olcumYap(url, secenekler);
      sonuclar.push(sonuc);
    }
  }

  const calisanlar = Array.from({ length: eszamanliAdet }, () => calisan());
  await Promise.all(calisanlar);

  const toplamSureMs = performance.now() - baslangic;
  const basarili = sonuclar.filter((s) => s.durum >= 200 && s.durum < 400);
  const oranSiniri = sonuclar.filter((s) => s.durum === 429);
  const hatalar = sonuclar.filter((s) => s.durum >= 500 || s.durum === 0);
  const diger = sonuclar.filter((s) => s.durum >= 400 && s.durum < 500 && s.durum !== 429);

  const sureler = sonuclar.filter((s) => s.sure > 0).map((s) => s.sure).sort((a, b) => a - b);
  const min = sureler[0] || 0;
  const max = sureler[sureler.length - 1] || 0;
  const avg = sureler.reduce((acc, v) => acc + v, 0) / (sureler.length || 1);
  const p50 = sureler[Math.floor(sureler.length * 0.5)] || 0;
  const p90 = sureler[Math.floor(sureler.length * 0.9)] || 0;
  const p95 = sureler[Math.floor(sureler.length * 0.95)] || 0;
  const rps = (toplamIstek / (toplamSureMs / 1000)).toFixed(2);

  console.log(`Tamamlanan İstek : ${sonuclar.length}`);
  console.log(`Toplam Süre      : ${(toplamSureMs / 1000).toFixed(2)} sn`);
  console.log(`İstek/Saniye     : ${rps} req/sec`);
  console.log(`Başarılı (2xx/3xx): ${basarili.length}`);
  console.log(`Hız Sınırı (429) : ${oranSiniri.length}`);
  console.log(`İstemci Hata(4xx): ${diger.length}`);
  console.log(`Sunucu Hata (5xx): ${hatalar.length}`);
  console.log(`Gecikme (Min)    : ${min.toFixed(1)} ms`);
  console.log(`Gecikme (Ort)    : ${avg.toFixed(1)} ms`);
  console.log(`Gecikme (p50)    : ${p50.toFixed(1)} ms`);
  console.log(`Gecikme (p90)    : ${p90.toFixed(1)} ms`);
  console.log(`Gecikme (p95)    : ${p95.toFixed(1)} ms`);
  console.log(`Gecikme (Max)    : ${max.toFixed(1)} ms`);

  return { rps, avg, p95, basarili: basarili.length, hatalar: hatalar.length };
}

async function baslat() {
  console.log("=== GENÇTEK PORTAL YÜK VE KAPASİTE TESTİ BAŞLATILIYOR ===");
  console.log(`Sunucu Adresi: ${BASE_URL}`);

  // 1. API Health Testi (Hafif ve hızlı API yanıtı)
  await eszamanliTest("Test 1: API Durum Uç Noktası (/api/health)", `${BASE_URL}/api/health`, 3, 15);

  // 2. Ana Sayfa Testi (Server-side rendered sayfa)
  await eszamanliTest("Test 2: Ana Sayfa Render Yükü (/)", `${BASE_URL}/`, 2, 6);

  // 3. Oran Sınırı (Rate Limiting) & Bot Savunma Testi
  console.log(`\n========================================`);
  console.log(`>>> Test 3: Güvenlik ve Hız Sınırı (Rate-Limit) Doğrulaması`);
  console.log(`Hedef: POST ${BASE_URL}/api/basvurular (Ardışık 7 istek gönderilerek 5 sınırının test edilmesi)`);
  console.log(`----------------------------------------`);
  
  for (let i = 1; i <= 7; i++) {
    const formData = new FormData();
    formData.append("applicantType", "STUDENT");
    formData.append("studentName", "Test");
    formData.append("website", "");
    formData.append("startedAt", String(Date.now()));

    const res = await fetch(`${BASE_URL}/api/basvurular`, {
      method: "POST",
      body: formData,
      headers: {
        "x-forwarded-for": "198.51.100.42" // Sabit test IP'si
      }
    });
    console.log(`İstek #${i} -> Durum Kodu: ${res.status} (${res.statusText})`);
  }

  console.log("\n=== TÜM YÜK VE PERFORMANS TESTLERİ TAMAMLANDI ===");
}

baslat().catch(console.error);
