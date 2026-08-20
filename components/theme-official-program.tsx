import Link from "next/link";
import type { ThemeProgram } from "@/lib/theme-programs";

export function ThemeOfficialProgram({ program }: { program: ThemeProgram }) {
  return <section className="official-program"><div className="container">
    <header className="official-program-head"><div><span className="eyebrow">{program.eyebrow}</span><h2>{program.title}</h2></div><p>{program.summary}</p></header>
    <div className="official-program-body">
      <div className="official-program-facts">{program.facts.map((fact)=><article key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></article>)}</div>
      <section className="official-program-highlights"><span className="theme-list-label">Programda öne çıkanlar</span><ul>{program.highlights.map((item)=><li key={item}>{item}</li>)}</ul><Link className="button button-secondary" href={program.sourceUrl} target="_blank" rel="noreferrer">{program.sourceLabel} ↗</Link></section>
    </div>
  </div></section>;
}
