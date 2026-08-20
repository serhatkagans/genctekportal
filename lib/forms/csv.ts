export function safeCsvCell(value: unknown) {
  const text = String(value ?? "").replaceAll('"', '""');
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded}"`;
}

export function rowsToCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.map(safeCsvCell).join(","), ...rows.map(row => headers.map(key => safeCsvCell(row[key])).join(","))].join("\r\n");
}
