/**
 * Tema düğmesi — sunucuda AÇIK tema varsayımıyla basılır, gerçek durumu
 * app/layout.tsx'teki satır içi betik yazar.
 *
 * HYDRATION UYARISI BİLİNÇLİ OLARAK SUSTURULUYOR (20 Ağustos 2026).
 *
 * Sıra şu: sunucu bu düğmeyi "Kırmızı tema" yazısıyla üretir; tarayıcıda
 * layout'taki betik `localStorage`u okuyup temayı uygular ve düğmenin
 * yazısını, `aria-pressed` ve `aria-label` değerlerini günceller; React ancak
 * bundan SONRA hydrate olur, bulduğu DOM ile kendi ürettiğini karşılaştırır ve
 * farkı görüp "server rendered text didn't match" der.
 *
 * Fark bir HATA DEĞİL, tasarımın kendisi: seçilen tema yalnızca tarayıcıda
 * bilinir (sunucu `localStorage`u göremez) ve betiğin React'ten önce çalışması
 * ŞART — yoksa kırmızı temayı seçmiş kullanıcı sayfayı her açtığında bir an
 * beyaz ekran görürdü.
 *
 * `suppressHydrationWarning` tam da bu iki noktaya konuyor: düğmenin
 * ÖZNİTELİKLERİ ve metin `span`inin İÇERİĞİ. Kapsamı tek seviyedir, yani
 * bileşenin geri kalanında gerçek bir uyuşmazlık çıkarsa React yine uyarır —
 * susturma geniş tutulsaydı, ileride oluşacak asıl hatalar da sessizleşirdi.
 */
export function TemaSecici() {
  return (
    <button
      type="button"
      className="tema-secici"
      data-tema-secici
      aria-pressed="false"
      aria-label="Kırmızı temaya geç"
      title="Kırmızı temaya geç"
      suppressHydrationWarning
    >
      <span className="tema-secici-isaret" aria-hidden />
      <span className="tema-secici-metin" suppressHydrationWarning>
        Kırmızı tema
      </span>
    </button>
  );
}
