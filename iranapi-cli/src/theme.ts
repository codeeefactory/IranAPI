/**
 * IranAPI terminal theme. Keep semantic names aligned with website CSS tokens.
 * Website equivalents live in api-hub-express/src/styles.css.
 */
export const palette = {
  primary: "#5eead4", // mint
  cyan: "#67e8f9", // signal/info
  amber: "#fbbf24", // warning/attention
  magenta: "#f472b6", // accent/error
  foreground: "#e2e8f0",
  muted: "#94a3b8",
} as const;

type Tone = keyof typeof palette;

function ansiColor(hex: string): string {
  const value = hex.slice(1);
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `\u001b[38;2;${red};${green};${blue}m`;
}

export function colorsEnabled(): boolean {
  if (process.env.FORCE_COLOR !== undefined) return process.env.FORCE_COLOR !== "0";
  if (process.env.NO_COLOR !== undefined || process.env.TERM === "dumb") return false;
  return Boolean(process.stdout.isTTY);
}

export function paint(value: string, tone: Tone, enabled = colorsEnabled()): string {
  if (!enabled) return value;
  return `${ansiColor(palette[tone])}${value}\u001b[0m`;
}

export function styleHelp(help: string, enabled = colorsEnabled()): string {
  if (!enabled) return help;
  return help
    .split("\n")
    .map((line) => {
      if (/^(Usage:|Options:|Commands:)/.test(line)) return paint(line, "primary", enabled);
      if (/^\s{2}[-<\[]/.test(line)) return paint(line, "foreground", enabled);
      if (/^\s{2}[a-z]/.test(line)) return paint(line, "cyan", enabled);
      return line;
    })
    .join("\n");
}

export function spinnerFrame(index: number): string {
  return ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"][index % 10];
}

export function banner(enabled = colorsEnabled()): string {
  const core = "IranAPI CLI";
  const tagline = "catalog · caller · deployments";
  if (!enabled) return `${core} — ${tagline}\n`;
  return `${paint("╦ ", "primary", enabled)}${paint(core, "cyan", enabled)}${paint(" ═", "primary", enabled)}${paint(" " + tagline, "muted", enabled)}\n`;
}
