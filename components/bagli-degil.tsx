import Link from "next/link";
import { Icon } from "./icons";

// Sahte satırlar yerine dürüst bir durum ekranı: hangi model var, neyin eksik
// olduğu ve nereye bakılacağı yazılı. Uydurma veri, olmayan başvuru/kullanıcı
// varmış izlenimi verdiği için panelde aktif olarak zararlıydı.
export function BagliDegil({
  baslik, aciklama, model, gereken,
}: { baslik: string; aciklama: string; model?: string; gereken: string[] }) {
  return (
    <section className="admin-panel bagli-degil">
      <div className="bagli-degil-ikon"><Icon name="shield" /></div>
      <div>
        <h2>{baslik}</h2>
        <p>{aciklama}</p>
        {model ? <p className="bagli-degil-model">Prisma şemasında <code>{model}</code> modeli hazır, veritabanı bağlanınca kullanılabilir.</p> : null}
        <ul>{gereken.map((g) => <li key={g}>{g}</li>)}</ul>
        <Link className="text-link" href="/yonetim">Genel bakışa dön <Icon name="arrow" /></Link>
      </div>
    </section>
  );
}
