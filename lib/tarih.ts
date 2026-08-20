const tarihBicimleyici = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

export function tarihYaz(tarih: Date): string {
  return tarihBicimleyici.format(tarih);
}
