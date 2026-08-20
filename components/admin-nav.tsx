"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

type IkonAdi = Parameters<typeof Icon>[0]["name"];
type Baglanti = { etiket: string; href: string; ikon: IconAdiKisayol; bagli: boolean };
type IconAdiKisayol = IkonAdi;

const GRUPLAR: { baslik: string; baglantilar: Baglanti[] }[] = [
  {
    baslik: "İÇERİK",
    baglantilar: [
      { etiket: "Genel bakış", href: "/yonetim", ikon: "gauge", bagli: true },
      { etiket: "Haberler", href: "/yonetim/icerik", ikon: "news", bagli: true },
      { etiket: "Etkinlikler", href: "/yonetim/etkinlikler", ikon: "calendar", bagli: true },
      { etiket: "Temalar", href: "/yonetim/temalar", ikon: "tag", bagli: true },
      { etiket: "Belge üretimi", href: "/panel/faaliyetler", ikon: "file", bagli: true },
    ],
  },
  {
    baslik: "EKOSİSTEM",
    baglantilar: [
      { etiket: "Koordinatörler", href: "/yonetim/koordinatorler", ikon: "users", bagli: true },
      { etiket: "Medya", href: "/yonetim/medya", ikon: "image", bagli: true },
      { etiket: "Formlar", href: "/yonetim/formlar", ikon: "form", bagli: true },
      { etiket: "Başvurular", href: "/yonetim/basvurular", ikon: "inbox", bagli: true },
    ],
  },
  {
    baslik: "SİSTEM",
    baglantilar: [
      { etiket: "Kullanıcılar", href: "/yonetim/kullanicilar", ikon: "badge", bagli: false },
      { etiket: "Yönlendirmeler", href: "/yonetim/yonlendirmeler", ikon: "redirect", bagli: true },
      { etiket: "Denetim kaydı", href: "/yonetim/denetim", ikon: "shield", bagli: false },
      { etiket: "Ayarlar", href: "/yonetim/ayarlar", ikon: "settings", bagli: false },
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
                {b.bagli ? null : <em className="nav-tasarim" title="Bu ekran henüz veriye bağlı değil">tasarım</em>}
              </Link>
            );
          })}
        </nav>
      ))}
    </>
  );
}
