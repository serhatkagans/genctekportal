"use server";
import { revalidatePath } from "next/cache";
import { yonlendirmeEkle, yonlendirmeSil } from "@/lib/yonlendirme";

export async function ekleAction(formData: FormData) {
  const kod = Number(formData.get("kod")) === 302 ? 302 : 301;
  await yonlendirmeEkle(String(formData.get("kaynak") ?? ""), String(formData.get("hedef") ?? ""), kod);
  revalidatePath("/yonetim/yonlendirmeler");
}

export async function silAction(formData: FormData) {
  await yonlendirmeSil(String(formData.get("id") ?? ""));
  revalidatePath("/yonetim/yonlendirmeler");
}
