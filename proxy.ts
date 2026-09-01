import { NextRequest, NextResponse } from "next/server";
import { uygulamaYolu } from "@/lib/ortam";
import { sessionCookie } from "@/lib/security/session";
import { yonlendirmeleriOku } from "@/lib/yonlendirme";

// Yönlendirme kuralları dosyadan okunuyor ve gerçek 301 dönebilmek için render
// başlamadan önce uygulanmalı; sayfa içinde permanentRedirect() çağırmak akış
// başladıktan sonra 200 dönüyordu. Proxy zaten Node.js çalışma zamanında koşar,
// bu yüzden runtime alanı burada tanımlanmaz — Next 16 onu hata sayıyor.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Çerez adı sabit yazılmamalı: ad "__Host-genctek_session"den
  // "__Host-genctekportal_session"a değişince burası güncellenmemiş, giriş
  // sayfası ile proxy farklı çerezlere bakar olmuştu. Sonuç sonsuz döngüydü —
  // proxy çerezi görmeyip /giris'e, giriş sayfası çerezi görüp /yonetim'e attı.
  if (process.env.NODE_ENV === "production" && pathname.startsWith("/yonetim") && !request.cookies.has(sessionCookie.name)) {
    // nextUrl.pathname'de uygulama eki yok ama Location mutlak çözülüyor:
    // uygulamaYolu olmadan tarayıcı alan adının kökündeki /giris'e gider (404).
    // returnTo eksiz kalmalı; giriş sunucu eylemi redirect() ile eki kendisi koyuyor.
    const url = new URL(uygulamaYolu("/giris"), request.url);
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/yonetim") && !pathname.startsWith("/api")) {
    const kural = (await yonlendirmeleriOku()).find((y) => y.kaynak === pathname);
    if (kural) {
      const hedef = /^https?:\/\//.test(kural.hedef)
        ? kural.hedef
        : new URL(uygulamaYolu(kural.hedef), request.url);
      return NextResponse.redirect(hedef, kural.kod);
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Çerçeveleme koruması: yönetim paneli dahil hiçbir sayfa iframe'e alınamaz
  // (clickjacking). frame-ancestors CSP ile de veriliyor; ikisi birlikte eski
  // ve yeni tarayıcıları kapsar. Sitede kendi sayfasını çerçeveleyen bir yer
  // yok, o yüzden SAMEORIGIN değil DENY: next.config.ts ile de aynı değer.
  response.headers.set("X-Frame-Options", "DENY");
  // İlk HTTP ziyaretinde bile HTTPS'e kilitlensin (SSL-strip'e karşı). Site
  // zaten HTTP'yi 301 ile HTTPS'e atıyor; HSTS bunu tarayıcıda kalıcı kılar.
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Content-Security-Policy", icerikGuvenligi());
  return response;
}

/*
 * İÇERİK GÜVENLİĞİ POLİTİKASI (1 Eylül 2026).
 *
 * Önceki hâlde yalnızca üç yönerge vardı (frame-ancestors/object-src/base-uri);
 * kaynak yükleme serbestti. Artık varsayılan "yalnızca kendi kaynağımız" ve her
 * kaynak türü tek tek açılıyor:
 *
 *   img/font/media : data: ve blob: yönetim panelindeki önizlemeler için gerekli
 *                    (dosya seçilir seçilmez, sunucuya gitmeden gösteriliyor).
 *   frame-src      : yalnızca YouTube. Haber gövdelerinde izin verilen tek gömü
 *                    bu; sanitize.ts'teki allowedIframeHostnames ile aynı liste,
 *                    biri değişirse diğeri de değişmeli.
 *   form-action    : formun başka bir siteye gönderilmesini engeller — depolanan
 *                    bir XSS'in veri kaçırmak için kullandığı klasik yol.
 *   connect-src    : fetch/XHR/WebSocket yalnızca kendi kökümüze.
 *
 * SCRIPT-SRC'DE 'unsafe-inline' KALDI ve bu bilinçli bir eksik. Next'in kendi
 * önyükleme betikleri (`self.__next_f.push(...)`) satır içidir ve içerikleri
 * sayfadan sayfaya değiştiği için hash'lenemez. Nonce ile kapatmanın yolu var
 * ama nonce isteğe özeldir: layout'un `headers()` okuması gerekir, bu da 66
 * yolun 26'sındaki ön üretimi (statik/SSG) iptal eder. Tanıtım sitesinin
 * tamamını istek başına render etmek, bu sitede betik enjeksiyonunun asıl
 * kapısı olan zengin metnin zaten sanitize-html'den geçtiği düşünülürse
 * orantısız bir bedel. Sızma testi bunu bulgu olarak yazarsa çözüm nonce'tur.
 *
 * Geliştirmede 'unsafe-eval' şart: Next'in dev derleyicisi onsuz çalışmıyor.
 */
function icerikGuvenligi() {
  const betik = process.env.NODE_ENV === "production"
    ? "'self' 'unsafe-inline'"
    : "'self' 'unsafe-inline' 'unsafe-eval'";
  return [
    "default-src 'self'",
    `script-src ${betik}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}
