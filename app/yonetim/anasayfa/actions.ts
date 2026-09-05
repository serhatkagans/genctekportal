"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import { anaSayfaMetniniYaz } from "@/lib/sayfa-metni";

/**
 * Ana sayfa metinlerinin kaydı.
 *
 * Alanlar düz form alanı; tek liste (hero altındaki şerit) satır satır bir
 * metin kutusundan geliyor — tema editöründeki "odak alanları" kalıbı. Böylece
 * ekranın istemci bileşeni olmasına gerek kalmıyor.
 */
export async function anaSayfaKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;

  const al = (ad: string) => String(formData.get(ad) ?? "");

  await anaSayfaMetniniYaz({
    hero: {
      ustEtiket: al("hero.ustEtiket"),
      baslik: al("hero.baslik"),
      vurgu: al("hero.vurgu"),
      metin: al("hero.metin"),
      dugme: al("hero.dugme"),
    },
    panel: {
      donem: al("panel.donem"),
      durum: al("panel.durum"),
      ustSatir: al("panel.ustSatir"),
      marka: al("panel.marka"),
      markaVurgu: al("panel.markaVurgu"),
    },
    serit: al("serit").split("\n").map((s) => s.trim()).filter(Boolean),
    haberler: {
      ustEtiket: al("haberler.ustEtiket"),
      baslik: al("haberler.baslik"),
      baglanti: al("haberler.baglanti"),
    },
    hakkinda: { ustEtiket: al("hakkinda.ustEtiket"), baslik: al("hakkinda.baslik") },
    etkinlikler: {
      ustEtiket: al("etkinlikler.ustEtiket"),
      baslik: al("etkinlikler.baslik"),
      metin: al("etkinlikler.metin"),
      baglanti: al("etkinlikler.baglanti"),
      bosMetin: al("etkinlikler.bosMetin"),
    },
    cagri: {
      ustEtiket: al("cagri.ustEtiket"),
      baslik: al("cagri.baslik"),
      metin: al("cagri.metin"),
      dugme: al("cagri.dugme"),
    },
  });

  revalidatePath("/");
  revalidatePath("/yonetim/anasayfa");
  redirect("/yonetim/anasayfa?kaydedildi=1");
}
