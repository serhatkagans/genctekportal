"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import { katilimMetniniYaz } from "@/lib/sayfa-metni";

/** Katılım sayfasının başlık bloğunu kaydeder. Yalnızca o sayfa tazeleniyor:
    metin başka hiçbir yerde basılmıyor. */
export async function katilimKaydetAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;

  await katilimMetniniYaz({
    ustEtiket: String(formData.get("ustEtiket") ?? ""),
    baslik: String(formData.get("baslik") ?? ""),
    spot: String(formData.get("spot") ?? ""),
  });

  revalidatePath("/katilim");
  revalidatePath("/yonetim/katilim");
  redirect("/yonetim/katilim?kaydedildi=1");
}
