import { Activity, CircuitBoard, RadioTower } from "lucide-react";
import { Link } from "react-router-dom";

import { useI18n } from "@/lib/i18n";

const primaryLinks = [
  { labelKey: "nav.browse" as const, to: "/browse" },
  { labelKey: "nav.docs" as const, to: "/documentation" },
  { labelKey: "nav.pricing" as const, to: "/pricing" },
];

const policyLinks = [
  { labelKey: "footer.terms" as const, to: "/terms" },
  { labelKey: "footer.privacy" as const, to: "/privacy" },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer-console border-t border-border/70 bg-background/75">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.4fr,0.8fr,0.8fr]">
        <div className="space-y-3">
          <p className="flex items-center gap-2 font-display text-lg font-black text-foreground">
            <CircuitBoard className="h-5 w-5 text-primary" />
            IranAPI
          </p>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">{t("footer.description")}</p>
          <div className="flex flex-wrap gap-2">
            <span className="stat-chip">
              <RadioTower className="h-4 w-4 text-accent" />
              v1 live
            </span>
            <span className="stat-chip">
              <Activity className="h-4 w-4 text-accent" />
              telemetry-ready
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">{t("footer.quick")}</p>
          <div className="grid gap-2 text-sm">
            {primaryLinks.map((link) => (
              <Link key={link.to} to={link.to} className="link-fade">
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">{t("footer.trust")}</p>
          <div className="grid gap-2 text-sm">
            {policyLinks.map((link) => (
              <Link key={link.to} to={link.to} className="link-fade">
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
