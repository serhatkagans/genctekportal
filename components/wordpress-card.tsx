import Link from "next/link";
import type { HaberKarti } from "@/lib/haber";
import { gorselYolu } from "@/lib/ortam";
import { categoryName } from "@/lib/wordpress-content";

// oncelikli: ilk ekranda görünen kartlar tembel yüklenmez, geri kalanı yüklenir.
export function WordPressCard({ item, oncelikli = false }: { item: HaberKarti; oncelikli?: boolean }) {
  const date = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(item.date));
  return <Link className="content-card wordpress-card" href={`/haberler/${item.slug}`}>
    <div className={`wordpress-card-media${item.featuredImage ? "" : " wordpress-card-fallback"}`}><img src={gorselYolu(item.featuredImage || "/Genc.png")} alt={item.featuredImage ? `${item.title} kapak görseli` : "GençTek"} loading={oncelikli ? "eager" : "lazy"} decoding="async" /></div>
    <div className="card-body"><span className="chip">{categoryName(item.categories)}</span><h2>{item.title}</h2>{item.excerpt ? <p>{item.excerpt}</p> : null}<time dateTime={item.date}>{date}</time></div>
  </Link>;
}
