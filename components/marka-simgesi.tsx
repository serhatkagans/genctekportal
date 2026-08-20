import { uygulamaYolu } from "@/lib/ortam";

export function MarkaSimgesi() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <img src={uygulamaYolu("/Genc.png")} alt="" />
    </span>
  );
}
