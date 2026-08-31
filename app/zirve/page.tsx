import type { Metadata } from "next";
import { ZirveSayfasi } from "@/components/zirve-sayfasi";
import { ZIRVE_2025 } from "@/lib/zirve";

export const metadata: Metadata = {
  title: "1. GençTek Zirvesi (2025) · GençTek",
  description: ZIRVE_2025.ozet,
};

export default function BirinciZirveSayfasi() {
  return <ZirveSayfasi zirve={ZIRVE_2025} />;
}
