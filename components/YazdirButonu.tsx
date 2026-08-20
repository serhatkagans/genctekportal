"use client";

export function YazdirButonu({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Yazdır / PDF olarak kaydet
    </button>
  );
}
