"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

type IkonAdi = Parameters<typeof Icon>[0]["name"];
type Baglanti = { etiket: string; href: string; ikon: IconAdiKisayol };
type IconAdiKisayol = IkonAdi;

const GRUPLAR: { baslik: string; baglantilar: Baglanti[] }[] = [
  {
    baslik: "İÇERİK",
    baglantilar: [
      { etiket: "Genel bakış", href: "/yonetim", ikon: "gauge" },
      { etiket: "Haberler", href: "/yonetim/icerik", ikon: "news" },
      { etiket: "Hakkında sayfaları", href: "/yonetim/hakkinda", ikon: "badge" },
      { etiket: "Zirveler", href: "/yonetim/zirveler", ikon: "calendar" },
      { etiket: "Etkinlikler", href: "/yonetim/etkinlikler", ikon: "calendar" },
      { etiket: "Temalar", href: "/yonetim/temalar", ikon: "tag" },
      { etiket: "Yardımlaşma grupları", href: "/yonetim/yardimlasma", ikon: "users" },
      { etiket: "Temel etkinlikler", href: "/yonetim/temel-etkinlikler", ikon: "calendar" },
      { etiket: "Belge üretimi", href: "/panel/faaliyetler", ikon: "file" },
    ],
  },
  {
    baslik: "EKOSİSTEM",
    baglantilar: [
      { etiket: "Koordinatörler", href: "/yonetim/koordinatorler", ikon: "users" },
      { etiket: "Medya", href: "/yonetim/medya", ikon: "image" },
      { etiket: "Formlar", href: "/yonetim/formlar", ikon: "form" },
      { etiket: "Başvurular", href: "/yonetim/basvurular", ikon: "inbox" },
    ],
  },
  {
    baslik: "SİSTEM",
    baglantilar: [
      { etiket: "Kullanıcılar", href: "/yonetim/kullanicilar", ikon: "badge" },
      { etiket: "Üst menü", href: "/yonetim/menu", ikon: "redirect" },
      { etiket: "Alt bilgi", href: "/yonetim/altbilgi", ikon: "file" },
      { etiket: "Yönlendirmeler", href: "/yonetim/yonlendirmeler", ikon: "redirect" },
      { etiket: "Denetim kaydı", href: "/yonetim/denetim", ikon: "shield" },
      { etiket: "Ayarlar", href: "/yonetim/ayarlar", ikon: "settings" },
    ],
  },
];

export function AdminNav() {
  const yol = usePathname();

  // "/yonetim" yalnızca tam eşleşmede aktif; diğerleri alt rotalarında da aktif.
  const aktifMi = (href: string) => (href === "/yonetim" ? yol === href : yol === href || yol.startsWith(`${href}/`));

  return (
    <>
      {GRUPLAR.map((grup) => (
        <nav key={grup.baslik} aria-label={grup.baslik}>
          <h2>{grup.baslik}</h2>
          {grup.baglantilar.map((b) => {
            const aktif = aktifMi(b.href);
            return (
              <Link
                className={aktif ? "admin-nav-active" : ""}
                href={b.href}
                key={b.href}
                aria-current={aktif ? "page" : undefined}
              >
                <span><Icon name={b.ikon} /></span>
                {b.etiket}
              </Link>
            );
          })}
        </nav>
      ))}
    </>
  );
}
