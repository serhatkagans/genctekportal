import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icons";
import { temaGorseli, type Tema as Theme } from "@/lib/tema";

export function ThemeCard({ theme, index, headingLevel = 3 }: { theme: Theme; index: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <Link className="theme-tile theme-card" href={`/temalar/${theme.slug}`}>
    <span className="theme-media"><Image src={temaGorseli(theme)} alt="" fill sizes="(max-width: 720px) 100vw, (max-width: 1024px) 50vw, 33vw" /></span>
    <span className="theme-card-body">
      <span className="theme-number">{String(index + 1).padStart(2, "0")}</span>
      <Heading>{theme.name}</Heading>
      <p>{theme.shortDescription}</p>
      <span className="theme-arrow" aria-hidden="true"><Icon name="arrow" /></span>
    </span>
  </Link>;
}
