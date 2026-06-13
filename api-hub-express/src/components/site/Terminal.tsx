import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TerminalWindow({
  title = "/bin/iranapi",
  children,
  className,
  glow = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "terminal-border rounded-md bg-card/80 backdrop-blur-sm overflow-hidden",
        glow && "shadow-glow",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-background/60 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
        <span className="ml-3 text-xs text-muted-foreground">{title}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function Prompt({ children, user = "guest", host = "iranapi" }: { children: ReactNode; user?: string; host?: string }) {
  return (
    <div dir="ltr" className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-sm font-mono">
      <span className="text-amber">{user}</span>
      <span className="text-muted-foreground">@</span>
      <span className="text-cyan">{host}</span>
      <span className="text-muted-foreground">:~$</span>
      <span className="text-foreground ms-1 break-all">{children}</span>
    </div>
  );
}

export function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <pre
      dir="ltr"
      className={cn(
        "text-xs text-primary/90 bg-background/60 rounded-sm border border-border p-3 overflow-x-auto font-mono leading-relaxed",
        className,
      )}
    >
      {children}
    </pre>
  );
}

export function Cursor() {
  return <span className="blink ml-0.5 inline-block h-[1em] w-[0.55em] -mb-1 bg-primary" />;
}

export function Tag({ children, color = "primary" }: { children: ReactNode; color?: "primary" | "amber" | "cyan" | "magenta" | "muted" }) {
  const map = {
    primary: "border-primary/40 text-primary",
    amber: "border-amber/40 text-amber",
    cyan: "border-cyan/40 text-cyan",
    magenta: "border-magenta/40 text-magenta",
    muted: "border-muted-foreground/30 text-muted-foreground",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wider", map[color])}>
      [{children}]
    </span>
  );
}
