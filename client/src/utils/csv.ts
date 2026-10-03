// Spreadsheet apps run cells that start with these characters as formulas, so prefix them with an apostrophe.
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (FORMULA_START.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: { key: keyof T & string; header: string }[]): string {
  const lines = [columns.map((c) => csvCell(c.header)).join(",")];
  for (const r of rows) lines.push(columns.map((c) => csvCell(r[c.key])).join(","));
  return lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM so Excel reads UTF-8 (accents, non-Latin names) correctly.
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
