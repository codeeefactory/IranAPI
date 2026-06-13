import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { LANGS, useI18n } from "@/lib/i18n";

const ROUTES: { to: string; label: string }[] = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse APIs" },
  { to: "/documentation", label: "Documentation" },
  { to: "/pricing", label: "Pricing" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/studio", label: "Studio" },
  { to: "/caller", label: "Caller" },
  { to: "/cli", label: "CLI" },
  { to: "/signin", label: "Sign in" },
  { to: "/signup", label: "Sign up" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setLang } = useI18n();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="type a command or page…" />
      <CommandList>
        <CommandEmpty>no matches</CommandEmpty>
        <CommandGroup heading="// navigate">
          {ROUTES.map((r) => (
            <CommandItem key={r.to} onSelect={() => go(r.to)}>
              {r.label}
              <span className="ml-auto text-[10px] text-muted-foreground">{r.to}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="// language">
          {LANGS.map((l) => (
            <CommandItem
              key={l.code}
              onSelect={() => {
                setLang(l.code);
                setOpen(false);
              }}
            >
              {l.native}
              <span className="ml-auto text-[10px] uppercase text-muted-foreground">{l.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
