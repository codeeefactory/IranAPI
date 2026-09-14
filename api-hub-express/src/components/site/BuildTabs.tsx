import { NavLink } from "react-router-dom";
import { PackagePlus, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/studio", label: "Flow builder", icon: Workflow, end: true },
  { to: "/init", label: "Project starter", icon: PackagePlus, end: true },
];

export function BuildTabs() {
  return (
    <nav aria-label="Build workspace" className="mb-6 border-b border-border">
      <div className="flex min-w-0 gap-1 overflow-x-auto">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm transition-colors",
              isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
