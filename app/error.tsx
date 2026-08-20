"use client";
import { uygulamaYolu } from "@/lib/ortam";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="state-page"><div><span className="state-code">500</span><h1>Bir şeyler yolunda gitmedi.</h1><p>İşleminiz tamamlanamadı. Yeniden deneyebilir veya ana sayfaya dönebilirsiniz.</p><div className="button-row"><button className="button button-primary" onClick={reset}>Yeniden dene</button><a className="text-link" href={uygulamaYolu("/")}>Ana sayfaya dön</a></div></div></main>}
