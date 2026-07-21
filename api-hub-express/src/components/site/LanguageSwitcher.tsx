import { Globe } from "lucide-react";
import { LANGS, useI18n } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card/50 h-10 sm:h-9 px-2.5 sm:px-3 text-xs text-foreground/80 hover:border-primary hover:text-primary transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="language"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="language-menu"
      >
        <Globe className="h-4 w-4" />
        <span className="font-bold uppercase tracking-wider">{current.label}</span>
      </button>
      {open && (
        <div id="language-menu" role="menu" className="absolute end-0 mt-1.5 min-w-[9rem] rounded-sm border border-primary/40 bg-popover/95 backdrop-blur-md p-1 shadow-glow z-50">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitemradio"
              aria-checked={l.code === lang}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-2 min-h-10 text-xs transition-colors ${
                l.code === lang ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <span>{l.native}</span>
              <span className="text-muted-foreground uppercase">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
