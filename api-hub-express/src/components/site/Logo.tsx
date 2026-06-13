import { cn } from "@/lib/utils";

type Props = { className?: string; size?: number };

/**
 * Modern hackerish iranapi mark.
 * Stylized monogram: bracketed "iA" with a scan-bar and signal dot.
 * Pure SVG — scales crisply, theme-aware via currentColor.
 */
export function Logo({ className, size = 22 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="iranapi"
      fill="none"
    >
      {/* outer terminal bracket */}
      <path
        d="M6 4 H4 V28 H6 M26 4 H28 V28 H26"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        className="text-primary"
      />
      {/* glyph: i */}
      <rect x="9" y="13" width="2.4" height="10" rx="0.4" className="fill-primary" />
      <rect x="9" y="9" width="2.4" height="2.4" rx="0.4" className="fill-primary" />
      {/* glyph: A (sharp) */}
      <path
        d="M14 23 L17.4 9 H19 L22.4 23 M15.2 19 H21.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="miter"
        strokeLinecap="square"
        className="text-foreground"
      />
      {/* scan line */}
      <rect x="4" y="16" width="24" height="0.6" className="fill-amber/70" />
      {/* signal dot */}
      <circle cx="23.5" cy="6.5" r="1.4" className="fill-primary">
        <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
