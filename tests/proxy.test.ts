import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { sessionCookie } from "../lib/security/session";

// Proxy iki kez kırıldı: bir kez Location'a uygulama eki konmadığı için (alan
// adının kökünde 404), bir kez de çerez adı sabit yazılıp giriş sayfasınınkiyle
// ayrıştığı için (sonsuz yönlendirme döngüsü). İkisi de yalnızca canlıda,
// NODE_ENV=production dalında görünüyordu; testler o dalı zorluyor.
async function proxyYukle(onek: string) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_BASE_PATH", onek);
  return (await import("../proxy")).proxy;
}

// Next, proxy'ye yolu uygulama ekinden arındırılmış verir (ek nextUrl.basePath'te
// durur); istek de öyle kurulmalı, yoksa test gerçek davranışı sınamaz.
function yonetimIstegi() {
  return new NextRequest("https://aiotechs.cloud/yonetim");
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllEnvs());

describe("proxy — yönetim koruması", () => {
  it("oturumsuz isteği uygulama ekiyle giriş sayfasına yollar", async () => {
    const proxy = await proxyYukle("/genctekportal");
    const yanit = await proxy(yonetimIstegi());

    expect(yanit.status).toBe(307);
    const hedef = new URL(yanit.headers.get("location") ?? "");
    expect(hedef.pathname).toBe("/genctekportal/giris");
    // returnTo eksiz kalmalı: giriş sonrası redirect() eki istemcide kendisi ekliyor.
    expect(hedef.searchParams.get("returnTo")).toBe("/yonetim");
  });

  it("giriş sayfasının kullandığı çerez adını tanır", async () => {
    const proxy = await proxyYukle("/genctekportal");
    const istek = yonetimIstegi();
    istek.cookies.set(sessionCookie.name, "jeton");

    expect((await proxy(istek)).headers.get("location")).toBeNull();
  });

  it("başka bir çerezle korumayı geçirmez", async () => {
    const proxy = await proxyYukle("/genctekportal");
    const istek = yonetimIstegi();
    istek.cookies.set("__Host-baska_uygulama_session", "jeton");

    expect((await proxy(istek)).status).toBe(307);
  });
});
