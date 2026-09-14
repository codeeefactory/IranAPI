import { paint } from "./theme.js";

export interface Page<T = Record<string, unknown>> {
  count: number;
  page: number;
  page_size: number;
  results: T[];
}

export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function printValue(value: unknown, json: boolean): void {
  if (json) return printJson(value);
  if (typeof value === "string") process.stdout.write(`${paint(value, "primary")}\n`);
  else printJson(value);
}

export function printRows(rows: Record<string, unknown>[], columns: string[], json: boolean, source: unknown): void {
  if (json) return printJson(source);
  if (rows.length === 0) {
    process.stdout.write(`${paint("No results.", "muted")}\n`);
    return;
  }
  const values = rows.map((row) => columns.map((column) => String(row[column] ?? "")));
  const widths = columns.map((column, index) => Math.max(column.length, ...values.map((row) => row[index].length)));
  const border = (left: string, fill: string, right: string) => `${left}${widths.map((width) => fill.repeat(width + 2)).join("┼")}${right}`;
  const line = (row: string[]) => `│ ${row.map((value, index) => value.padEnd(widths[index])).join(" │ ")} │`;
  process.stdout.write(`${border("╭", "─", "╮")}\n`);
  process.stdout.write(`${paint(line(columns), "primary")}\n`);
  process.stdout.write(`${border("├", "─", "┤")}\n`);
  values.forEach((row) => process.stdout.write(`${line(row)}\n`));
  process.stdout.write(`${border("╰", "─", "╯")}\n`);
}
