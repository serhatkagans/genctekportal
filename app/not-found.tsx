import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export default function NotFound(){return <><Header/><main className="state-page"><div><span className="state-code">404</span><h1>Aradığınız sayfa burada değil.</h1><p>Bağlantı değişmiş veya içerik yayından kaldırılmış olabilir.</p><div className="button-row"><Link className="button button-primary" href="/">Ana sayfaya dön</Link><Link className="text-link" href="/haberler">Haberleri incele</Link></div></div></main><Footer/></>}
