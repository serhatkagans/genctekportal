"use server";
import { revalidatePath } from "next/cache";
import { oturumKullanicisiZorunlu } from "@/lib/auth/oturum";
import type { Role } from "@/lib/auth/rbac";
import { erisimLogla } from "@/lib/yetki/log";
import {
  aktifYoneticiSayisi,
  durumDegistir,
  kullaniciAdi,
  oturumlariKapat,
  rolCikar,
  rolEkle,
  ROL_ETIKETLERI,
  yoneticiMi,
  type KullaniciDurumu,
} from "@/lib/yonetim/kullanici";

/**
 * Kullanıcı yönetimi eylemleri.
 *
 * ÜÇ KURAL HER EYLEMDE GEÇERLİ:
 *
 *   1. YETKİ SUNUCUDA SORULUR. Ekranı yalnızca sistem yöneticisine göstermek
 *      yetmez; form doğrudan da gönderilebilir. Kapı burada.
 *   2. SON YÖNETİCİ KORUNUR. Sistemde aktif tek bir yönetici kaldıysa ne rolü
 *      alınabilir ne de kapatılabilir — paneli yönetebilen kimse kalmazsa geri
 *      dönüşün tek yolu veritabanına elle müdahaledir.
 *   3. HER DEĞİŞİKLİK DENETİM KAYDINA YAZILIR. Rol ve durum değişiklikleri
 *      erişim yetkisini değiştirir; kimin ne zaman yaptığı sorusunun cevabı
 *      bir yerde durmalı.
 *
 * Hata durumunda `throw` YOK, sessiz dönüş var: form eylemleri hata mesajını
 * ekrana taşıyamıyor ve yakalanmayan bir hata kullanıcıya boş bir hata sayfası
 * gösterirdi. Reddedilen işlem, sayfa tazelendiğinde eski hâliyle görünür.
 */

async function yetkiliMi() {
  const kullanici = await oturumKullanicisiZorunlu();
  if (!kullanici.roller.includes("SYSTEM_ADMIN")) return null;
  return kullanici;
}

function tazele() {
  revalidatePath("/yonetim/kullanicilar");
  revalidatePath("/yonetim/denetim");
}

export async function rolDegistirAction(formData: FormData) {
  const yonetici = await yetkiliMi();
  if (!yonetici) return;

  const kullaniciId = String(formData.get("kullaniciId") ?? "");
  const rol = String(formData.get("rol") ?? "") as Role;
  const islem = String(formData.get("islem") ?? "");
  if (!kullaniciId || !(rol in ROL_ETIKETLERI)) return;

  if (islem === "cikar") {
    /*
     * Son yöneticinin rolü alınamaz. Ölçüt "bu kişi yönetici mi" değil
     * "sistemde başka aktif yönetici var mı": kişi kendi rolünü de
     * alabiliyor ve tek yönetici oysa panel kilitlenirdi.
     */
    if (rol === "SYSTEM_ADMIN" && (await aktifYoneticiSayisi()) <= 1) return;
    await rolCikar(kullaniciId, rol);
  } else {
    await rolEkle(kullaniciId, rol);
  }

  await erisimLogla({
    kullaniciId: yonetici.id,
    islem: islem === "cikar" ? "ROL_CIKARILDI" : "ROL_EKLENDI",
    hedefTip: "KULLANICI",
    hedefId: kullaniciId,
    detay: `${await kullaniciAdi(kullaniciId)} · ${ROL_ETIKETLERI[rol]}`,
  });
  tazele();
}

export async function durumDegistirAction(formData: FormData) {
  const yonetici = await yetkiliMi();
  if (!yonetici) return;

  const kullaniciId = String(formData.get("kullaniciId") ?? "");
  const durum = String(formData.get("durum") ?? "") as KullaniciDurumu;
  if (!kullaniciId) return;
  if (!["INVITED", "ACTIVE", "LOCKED", "DISABLED"].includes(durum)) return;

  // Aktiflikten çıkarma, son yöneticiyi de devre dışı bırakabilir.
  if (
    durum !== "ACTIVE" &&
    (await yoneticiMi(kullaniciId)) &&
    (await aktifYoneticiSayisi()) <= 1
  ) {
    return;
  }

  await durumDegistir(kullaniciId, durum);
  await erisimLogla({
    kullaniciId: yonetici.id,
    islem: "KULLANICI_DURUMU",
    hedefTip: "KULLANICI",
    hedefId: kullaniciId,
    detay: `${await kullaniciAdi(kullaniciId)} · ${durum}`,
  });
  tazele();
}

export async function oturumlariKapatAction(formData: FormData) {
  const yonetici = await yetkiliMi();
  if (!yonetici) return;

  const kullaniciId = String(formData.get("kullaniciId") ?? "");
  if (!kullaniciId) return;

  const adet = await oturumlariKapat(kullaniciId);
  await erisimLogla({
    kullaniciId: yonetici.id,
    islem: "OTURUMLAR_KAPATILDI",
    hedefTip: "KULLANICI",
    hedefId: kullaniciId,
    detay: `${await kullaniciAdi(kullaniciId)} · ${adet} oturum`,
  });
  tazele();
}
