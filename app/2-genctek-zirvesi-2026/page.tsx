import type { Metadata } from "next";
import { ZirveSayfasi } from "@/components/zirve-sayfasi";
import { ZIRVE_2026 } from "@/lib/zirve";

export const metadata: Metadata = {
  title: "2. GençTek Zirvesi (2026) · GençTek",
  description: ZIRVE_2026.ozet,
};

export default function IkinciZirveSayfasi() {
  return <ZirveSayfasi zirve={ZIRVE_2026} />;
}
