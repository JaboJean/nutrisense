import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2, LogOut, Sparkles, Users, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin, type NutritionistApplication } from "@/hooks/useAdmin";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Nutrisense-AI" }] }),
  component: AdminPortal,
});

type Tab = "pending" | "reviewed";

function StatusBadge({ status }: { status: NutritionistApplication["status"] }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
      status === "pending"  && "bg-amber/10 text-amber",
      status === "approved" && "bg-emerald-deep/10 text-emerald-deep",
      status === "rejected" && "bg-coral/10 text-coral",
    )}>
      {status}
    </span>
  );
}

function ApplicationRow({
  app,
  onApprove,
  onReject,
  busy,
}: {
  app: NutritionistApplication;
  onApprove: (a: NutritionistApplication) => void;
  onReject:  (a: NutritionistApplication) => void;
  busy: string | null;
}) {
  const isBusy = busy === app.id;
  const date   = new Date(app.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="rounded-[24px] nv-glass p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-ink">{app.full_name}</div>
          <div className="text-[11px] text-ink/45 mt-0.5">Applied {date}</div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink/35 mb-0.5">Credential</div>
          <div className="font-mono text-ink/80">{app.credential_no}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink/35 mb-0.5">Institution</div>
          <div className="text-ink/80">{app.institution}</div>
        </div>
      </div>

      {app.note && (
        <div className="rounded-xl bg-ink/3 px-3 py-2 text-[12px] text-ink/60 italic">
          "{app.note}"
        </div>
      )}

      {app.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onApprove(app)}
            disabled={!!busy}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all",
              !busy
                ? "bg-emerald-deep text-mint hover:scale-[1.02] active:scale-[0.98] shadow-[0_6px_16px_-8px_rgba(15,118,110,0.6)]"
                : "bg-ink/8 text-ink/30 cursor-not-allowed",
            )}
          >
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Approve
          </button>
          <button
            onClick={() => onReject(app)}
            disabled={!!busy}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all",
              !busy
                ? "bg-coral/10 text-coral hover:bg-coral/15 active:scale-[0.98]"
                : "bg-ink/8 text-ink/30 cursor-not-allowed",
            )}
          >
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

function AdminPortal() {
  const navigate = useNavigate();
  const { user, profile, loaded, displayName, logout } = useAuth();
  const { applications, loading, approve, reject, reload } = useAdmin(user);

  const [tab,  setTab]  = useState<Tab>("pending");
  const [busy, setBusy] = useState<string | null>(null);

  // Auth guard — admin only
  useEffect(() => {
    if (!loaded) return;
    if (!user)                      { navigate({ to: "/login" }); return; }
    if (profile && profile.role !== "admin") { window.location.href = "/dashboard"; }
  }, [loaded, user, profile, navigate]);

  async function handleApprove(app: NutritionistApplication) {
    setBusy(app.id);
    await approve(app);
    setBusy(null);
  }

  async function handleReject(app: NutritionistApplication) {
    setBusy(app.id);
    await reject(app);
    setBusy(null);
  }

  const pending  = applications.filter((a) => a.status === "pending");
  const reviewed = applications.filter((a) => a.status !== "pending");
  const shown    = tab === "pending" ? pending : reviewed;

  if (!loaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 rounded-full border-2 border-emerald-deep/20 border-t-emerald-deep animate-spin" />
      </div>
    );
  }

  return (
    <div className="nv-mesh min-h-screen text-ink pb-16">

      {/* Top bar */}
      <header className="sticky top-0 z-40 nv-glass border-b border-emerald-deep/10">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-2xl bg-emerald-deep shadow-[0_8px_24px_-12px_rgba(15,118,110,0.7)]">
              <Sparkles className="size-4 text-mint" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold tracking-tight text-emerald-deep">
                Nutrisense<span className="text-ink/40">-AI</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Admin Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={reload}
              className="grid size-9 place-items-center rounded-full nv-glass text-ink/50 hover:text-emerald-deep transition-colors"
              title="Refresh"
            >
              <RefreshCw className="size-4" />
            </button>
            <button
              onClick={async () => { await logout(); navigate({ to: "/" }); }}
              className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-deep to-forest text-mint font-semibold text-xs ring-2 ring-white/70"
              title={displayName}
            >
              {displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-12 sm:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink">Clinician Applications</h1>
          <p className="mt-1 text-sm text-ink/50">
            Review and approve nutritionist registration requests.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Pending review", value: pending.length,  tone: "amber"        },
            { label: "Approved",       value: applications.filter((a) => a.status === "approved").length, tone: "emerald" },
            { label: "Rejected",       value: applications.filter((a) => a.status === "rejected").length, tone: "coral"   },
          ].map(({ label, value, tone }) => (
            <div key={label} className="rounded-2xl nv-glass p-5 text-center">
              <div className={cn(
                "font-display text-3xl font-semibold tabular-nums",
                tone === "amber"   && "text-amber",
                tone === "emerald" && "text-emerald-deep",
                tone === "coral"   && "text-coral",
              )}>
                {value}
              </div>
              <div className="mt-1 text-[11px] text-ink/45">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl nv-glass p-1.5 w-fit">
          {([
            { k: "pending"  as Tab, l: "Pending",  count: pending.length  },
            { k: "reviewed" as Tab, l: "Reviewed", count: reviewed.length },
          ]).map(({ k, l, count }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                tab === k
                  ? "bg-emerald-deep text-mint shadow-[0_4px_12px_-6px_rgba(15,118,110,0.5)]"
                  : "text-ink/55 hover:text-emerald-deep",
              )}
            >
              {l}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  tab === k ? "bg-mint/20 text-mint" : "bg-ink/8 text-ink/50",
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Application list */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-ink/40">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Loading applications…</span>
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="grid size-16 place-items-center rounded-3xl bg-ink/5">
              <Users className="size-7 text-ink/30" />
            </div>
            <p className="text-sm text-ink/40">
              {tab === "pending" ? "No pending applications" : "No reviewed applications yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {shown.map((app) => (
              <ApplicationRow
                key={app.id}
                app={app}
                onApprove={handleApprove}
                onReject={handleReject}
                busy={busy}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
