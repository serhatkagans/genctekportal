"use server";
import { icerikYonetebilirMi } from "@/lib/yetki/yonetim-erisimi";
import { revalidatePath } from "next/cache";
import { yonlendirmeEkle, yonlendirmeSil } from "@/lib/yonlendirme";

export async function ekleAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  const kod = Number(formData.get("kod")) === 302 ? 302 : 301;
  await yonlendirmeEkle(String(formData.get("kaynak") ?? ""), String(formData.get("hedef") ?? ""), kod);
  revalidatePath("/yonetim/yonlendirmeler");
}

export async function silAction(formData: FormData) {
  if (!(await icerikYonetebilirMi())) return;
  await yonlendirmeSil(String(formData.get("id") ?? ""));
  revalidatePath("/yonetim/yonlendirmeler");
}
