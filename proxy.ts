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
  return response;
}
