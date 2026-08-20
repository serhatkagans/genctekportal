"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { girisAction } from "@/app/giris/actions";
import { uygulamaYolu } from "@/lib/ortam";

function GonderDugmesi() {
  const { pending } = useFormStatus();
  return (
    <button className="button button-primary" type="submit" disabled={pending}>
      {pending ? "Giriş yapılıyor…" : "Giriş yap"}
    </button>
  );
}

export function GirisFormu({ returnTo }: { returnTo: string }) {
  const [hata, formAction] = useActionState(girisAction, undefined);

  return (
    <form action={formAction}>
      {hata ? <div className="error-summary" role="alert">{hata}</div> : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      <label>
        E-posta adresi
        <input type="email" name="email" autoComplete="username" required autoFocus />
      </label>
      <label>
        Parola
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <div className="auth-options">
        <span />
        <a href={uygulamaYolu("/parola-sifirla")}>Parolamı unuttum</a>
      </div>
      <GonderDugmesi />
    </form>
  );
}
