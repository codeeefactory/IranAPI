import {
  Building2,
  CheckCircle2,
  HelpCircle,
  Mail,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useApi";
import { useI18n } from "@/lib/i18n";
import { usePageMetadata } from "@/lib/metadata";

interface InviteRow {
  id: number;
  email: string;
  role: "Developer" | "Admin" | "Billing";
}

const rolePresets = [
  { value: "Platform engineer", label: "Platform engineer", text: "Owns API reliability, gateway setup, and team access." },
  { value: "API product owner", label: "API product owner", text: "Manages API roadmap, docs, monetization, and adoption." },
  { value: "Engineering lead", label: "Engineering lead", text: "Coordinates team workflow, permissions, and subscriptions." },
];

export default function Orgs() {
  const { data: user } = useCurrentUser();
  const { dir, t } = useI18n();
  const [orgName, setOrgName] = useState("");
  const [seats, setSeats] = useState(5);
  const [purpose, setPurpose] = useState("");
  const [invites, setInvites] = useState<InviteRow[]>([{ id: 1, email: "", role: "Developer" }]);

  usePageMetadata({
    title: "Create Organization",
    description: "Create an organization workspace for API usage, collaboration, subscriptions, and access control.",
    path: "/org/organizations/create",
    noindex: true,
  });

  const validInvites = useMemo(() => invites.filter((invite) => invite.email.trim()), [invites]);
  const owner = user?.username || user?.email || "Personal Account";
  const canSubmit = orgName.trim().length >= 2;
  const readiness = Math.min(100, (canSubmit ? 45 : 10) + (seats > 1 ? 20 : 0) + (validInvites.length ? 20 : 0) + (purpose ? 15 : 0));

  const addInvite = () => {
    setInvites((current) => [...current, { id: Date.now(), email: "", role: "Developer" }]);
  };

  const updateInvite = (id: number, patch: Partial<InviteRow>) => {
    setInvites((current) => current.map((invite) => (invite.id === id ? { ...invite, ...patch } : invite)));
  };

  const removeInvite = (id: number) => {
    setInvites((current) => current.filter((invite) => invite.id !== id));
  };

  const submitOrg = () => {
    if (!canSubmit) {
      toast.error("Org name needs at least 2 characters.");
      return;
    }
    toast.success(`${orgName || "Organization"} workspace prepared.`);
  };

  return (
    <div className="cyber-shell min-h-screen bg-background text-foreground" dir={dir}>
      <Navigation />
      <main id="main-content" className="container py-7">
        <section className="grid gap-8 xl:grid-cols-[minmax(0,620px),minmax(420px,1fr)]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">IranAPI organization setup</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Create Your Organization</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    Build a shared IranAPI workspace for API usage, subscriptions, access control, and project collaboration.
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white p-4 text-right shadow-[0_14px_40px_rgba(37,99,235,0.10)]">
                  <p className="text-xs font-medium text-slate-500">Setup readiness</p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">{readiness}%</p>
                  <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${readiness}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Workspace", "Seats", "Invites"].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</span>
                    <span className="text-sm font-semibold">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-950">{t("rapid.orgModel")}</p>
                <p className="mt-1 text-sm leading-6 text-blue-800">{t("rapid.orgModelCopy")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["APIs", "Applications", "Users", "Teams"].map((item) => (
                    <Badge key={item} variant="secondary" className="bg-white text-blue-700">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Card className="rounded-3xl border-white/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Workspace details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Org name*</Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={(event) => setOrgName(event.target.value)}
                      placeholder="Acme Developers"
                      className="h-12 rounded-xl border-slate-300 bg-slate-50 pl-10 text-base focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <p>This business, not {owner}, will own and control this organization account.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[220px,1fr]">
                  <div className="space-y-2">
                    <Label htmlFor="seats">Organization seats</Label>
                    <div className="flex h-12 items-center overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-full rounded-none"
                        onClick={() => setSeats((current) => Math.max(1, current - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="seats"
                        type="number"
                        min={1}
                        max={100}
                        value={seats}
                        onChange={(event) => setSeats(Math.max(1, Number(event.target.value) || 1))}
                        className="h-full border-0 bg-transparent text-center text-base font-semibold focus-visible:ring-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-full rounded-none"
                        onClick={() => setSeats((current) => Math.min(100, current + 1))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">Seats can be changed any time.</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Amount/mo</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-700">FREE</p>
                      </div>
                      <Badge className="bg-emerald-600">Starter</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">Includes shared discovery, API projects, access review, and basic usage visibility.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Your role at the organization (Optional)</Label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {rolePresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setPurpose(preset.value)}
                        className={`rounded-xl border p-3 text-left transition ${
                          purpose === preset.value ? "border-blue-500 bg-blue-50 text-blue-950" : "border-slate-200 bg-white hover:border-blue-200"
                        }`}
                      >
                        <span className="text-sm font-semibold">{preset.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{preset.text}</span>
                      </button>
                    ))}
                  </div>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(event) => setPurpose(event.target.value)}
                    placeholder="Platform engineer, API owner, product lead..."
                    rows={3}
                    className="rounded-xl border-slate-300 bg-slate-50 focus-visible:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Invite teammates
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={addInvite}>
                  <Plus className="h-4 w-4" />
                  Invite another
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {invites.map((invite) => (
                  <div key={invite.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr,160px,44px]">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        value={invite.email}
                        onChange={(event) => updateInvite(invite.id, { email: event.target.value })}
                        placeholder="name@example.com"
                        className="h-11 rounded-xl border-slate-300 bg-white pl-10"
                      />
                    </div>
                    <select
                      value={invite.role}
                      onChange={(event) => updateInvite(invite.id, { role: event.target.value as InviteRow["role"] })}
                      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option>Developer</option>
                      <option>Admin</option>
                      <option>Billing</option>
                    </select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInvite(invite.id)} disabled={invites.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button className="gap-2 rounded-xl bg-slate-950 px-6 hover:bg-blue-700" onClick={submitOrg} disabled={!canSubmit}>
                <Sparkles className="h-4 w-4" />
                Create organization
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Cancel</Link>
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="rounded-3xl border-white/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-blue-950">IranAPI for Teams</h2>
                  <Badge variant="secondary">RapidAPI-inspired</Badge>
                </div>
                <div className="grid aspect-video place-items-center rounded-lg bg-slate-900 text-white">
                  <div className="text-center">
                    <HelpCircle className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                    <p className="font-bold">Video unavailable</p>
                    <p className="text-sm text-slate-300">This video is unavailable</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    "Discover and share IranAPI listings",
                    "Share API subscriptions",
                    "Manage IranAPI usage and performance",
                    "Invite customers and partners to consume APIs",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle2 className="h-6 w-6 fill-blue-500 text-white" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-4 p-6">
                <h2 className="font-bold">Workspace summary</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Org</p>
                    <p className="truncate font-semibold">{orgName || "Not named"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Seats</p>
                    <p className="font-semibold">{seats}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Invites</p>
                    <p className="font-semibold">{validInvites.length}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  Modern form keeps create flow focused: identity, seats, role context, and team invites in one reviewable screen.
                </p>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
