import { BarChart3, CheckCircle2, Code2, CreditCard, PlayCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const rapidInspiredFeatures = [
  {
    label: "IranAPI Hub discovery",
    copy: "Search, categories, ratings, popularity, provider identity, and listing readiness stay visible in IranAPI.",
    icon: Search,
  },
  {
    label: "Endpoint testing",
    copy: "Each API detail keeps method, path, request body, response preview, and browser-run feedback together.",
    icon: PlayCircle,
  },
  {
    label: "Code snippets",
    copy: "cURL, JavaScript, TypeScript, Python, Node, PHP, Go, C#, Java, and Ruby snippets share one endpoint source.",
    icon: Code2,
  },
  {
    label: "Plans and quotas",
    copy: "Free, freemium, paid, monthly or daily quotas, plan features, and activation status map into pricing cards.",
    icon: CreditCard,
  },
  {
    label: "Analytics loop",
    copy: "Dashboard and Studio surfaces expose requests, active APIs, usage signals, endpoint checks, and search insights.",
    icon: BarChart3,
  },
];

export function RapidApiSyncPanel({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <section className={cn("surface-card overflow-hidden", className)} aria-labelledby="rapidapi-sync-title">
      <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[0.8fr,1.2fr]">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-primary">
            RapidAPI-inspired
          </Badge>
          <div className="space-y-2">
            <h2 id="rapidapi-sync-title" className={compact ? "text-xl font-bold" : "text-2xl font-bold"}>
              IranAPI pages synced into one marketplace UX
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Inspired by RapidAPI patterns, but branded and worded for IranAPI: discovery, subscriptions, endpoint tests,
              snippets, Studio publishing, and analytics share one product surface.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link to="/browse">API Hub</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/studio">Studio</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {rapidInspiredFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.label} className="rounded-md border border-border/70 bg-background/70 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-foreground">{feature.label}</p>
                  <CheckCircle2 className="ms-auto h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{feature.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
