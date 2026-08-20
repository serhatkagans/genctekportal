"use client";

export function TumunuSecKutusu({ formId }: { formId: string }) {
  return (
    <label className="belge-tumunu-sec">
      <input
        type="checkbox"
        onChange={(olay) => {
          const form = document.getElementById(formId);
          form?.querySelectorAll<HTMLInputElement>('input[name="katilimci"]')
            .forEach((kutu) => { kutu.checked = olay.currentTarget.checked; });
        }}
      />
      Tümünü seç
    </label>
  );
}
