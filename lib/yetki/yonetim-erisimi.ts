import { cookies } from "next/headers";
import { sessionCookie } from "@/lib/security/session";

// proxy.ts /yonetim sayfalarını üretimde oturum çerezine bağlıyor ama /api yolları
// o kontrolün dışında kalıyor. Yazma uçları aynı kuralı kendi içinde uygulamalı.
// Giriş formu henüz sunucuya bağlı olmadığı için geliştirmede kapı açık bırakılıyor.
export async function yonetimErisimiVarMi() {
  if (process.env.NODE_ENV !== "production") return true;
  return (await cookies()).has(sessionCookie.name);
}
