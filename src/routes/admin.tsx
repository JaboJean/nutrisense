import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check, Loader2, Sparkles, Users, X,
  RefreshCw, UserPlus, ShieldOff, Mail, LogOut,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin, type NutritionistApplication } from "@/hooks/useAdmin";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Nutrisense-AI" }] }),
  component: AdminPortal,
});

type Tab = "active" | "pending";

// ── Create nutritionist modal ─────────────────────────────────────────────────

function CreateNutritionistModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: { name: string; email: string; credential_no: string; institution: string }) => Promise<true | string>;
}) {
  const [name,          setName]         = useState("");
  const [email,         setEmail]        = useState("");
  const [credentialNo,  setCredentialNo] = useState("");
  const [institution,   setInstitution]  = useState("");
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState("");
  const [done,          setDone]         = useState(false);

  const valid = name.trim().length > 1 && email.includes("@") &&
    credentialNo.trim().length > 2 && institution.trim().length > 2;

  async function handleCreate() {
    if (!valid) return;
    setLoading(true);
    setError("");
    const result = await onCreate({ name: name.trim(), email: email.trim().toLowerCase(), credential_no: credentialNo.trim(), institution: institution.trim() });
    setLoading(false);
    if (result === true) {
      setDone(true);
    } else {
      setError(result);
    }
  }

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm focus:border-emerald-deep/40 focus:outline-none focus:ring-2 focus:ring-emerald-deep/15 transition-all";
  const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-ink/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-ink/40 hover:bg-ink/5 transition-colors">
          <X className="size-4" />
        </button>

        {done ? (
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-deep/10">
              <Mail className="size-7 text-emerald-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Account created</h2>
              <p className="mt-2 text-sm text-ink/55 leading-relaxed">
                A password-setup email has been sent to <strong>{email}</strong>. The nutritionist clicks the link, sets a password, and logs straight into the portal.
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-mint"
            >
              <Check className="size-4" /> Done
            </button>
          </div>
        ) : (
          <>
            <div className="grid size-12 place-items-center rounded-2xl bg-emerald-deep/10 mb-4">
              <UserPlus className="size-5 text-emerald-deep" />
            </div>
            <h2 className="font-display text-lg font-semibold text-ink">Create nutritionist account</h2>
            <p className="mt-1 mb-5 text-sm text-ink/50">
              A password-setup email is sent automatically to the nutritionist.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelCls}>Full name</span>
                  <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Amina K." className={inputCls} />
                </label>
                <label className="block">
                  <span className={labelCls}>Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amina@hospital.rw" className={inputCls} />
                </label>
              </div>

              <label className="block">
                <span className={labelCls}>RAHPC Registration No.</span>
                <input value={credentialNo} onChange={(e) => setCredentialNo(e.target.value)} placeholder="e.g. RNC-2024-0042" className={inputCls} />
              </label>

              <label className="block">
                <span className={labelCls}>Institution</span>
                <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. King Faisal Hospital, Kigali" className={inputCls} />
              </label>

              {error && (
                <div className="rounded-2xl bg-coral/8 px-4 py-3 text-sm text-coral ring-1 ring-coral/20">{error}</div>
              )}

              <button
                onClick={handleCreate}
                disabled={!valid || loading}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all",
                  valid && !loading
                    ? "bg-emerald-deep text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.6)] hover:scale-[1.01] active:scale-[0.98]"
                    : "cursor-not-allowed bg-ink/8 text-ink/30",
                )}
              >
                {loading ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : <><UserPlus className="size-4" /> Create &amp; send invite</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Nutritionist card ─────────────────────────────────────────────────────────

function NutritionistCard({
  app,
  onRevoke,
  busy,
}: {
  app: NutritionistApplication;
  onRevoke: (a: NutritionistApplication) => void;
  busy: string | null;
}) {
  const date = new Date(app.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="rounded-[24px] nv-glass p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-deep to-forest text-mint font-bold text-xs ring-2 ring-white/70">
          {app.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink truncate">{app.full_name}</div>
          <div className="text-[11px] text-ink/45 truncate">{app.email}</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-deep/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-deep shrink-0">
          <Check className="size-2.5" /> Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink/35 mb-0.5">Credential</div>
          <div className="font-mono text-ink/80">{app.credential_no}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink/35 mb-0.5">Institution</div>
          <div className="text-ink/80 truncate">{app.institution}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink/5 pt-3">
        <span className="text-[10px] text-ink/35">Added {date}</span>
        <button
          onClick={() => onRevoke(app)}
          disabled={!!busy}
          className="flex items-center gap-1.5 rounded-xl bg-coral/8 px-3 py-1.5 text-xs font-semibold text-coral hover:bg-coral/15 transition-colors disabled:opacity-40"
        >
          {busy === app.id ? <Loader2 className="size-3 animate-spin" /> : <ShieldOff className="size-3" />}
          Revoke
        </button>
      </div>
    </div>
  );
}

// ── Pending application card ──────────────────────────────────────────────────

function PendingCard({
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
  const date = new Date(app.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="rounded-[24px] nv-glass p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-ink">{app.full_name}</div>
          <div className="text-[11px] text-ink/45">{app.email || "—"} · Applied {date}</div>
        </div>
        <span className="inline-flex items-center rounded-md bg-amber/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber shrink-0">Pending</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink/35 mb-0.5">Credential</div>
          <div className="font-mono text-ink/80">{app.credential_no}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink/35 mb-0.5">Institution</div>
          <div className="text-ink/80 truncate">{app.institution}</div>
        </div>
      </div>

      {app.note && (
        <div className="rounded-xl bg-ink/3 px-3 py-2 text-[12px] text-ink/60 italic">"{app.note}"</div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onApprove(app)}
          disabled={!!busy}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all",
            !busy ? "bg-emerald-deep text-mint hover:scale-[1.02] active:scale-[0.98]" : "bg-ink/8 text-ink/30 cursor-not-allowed",
          )}
        >
          {busy === app.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Approve
        </button>
        <button
          onClick={() => onReject(app)}
          disabled={!!busy}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all",
            !busy ? "bg-coral/10 text-coral hover:bg-coral/15 active:scale-[0.98]" : "bg-ink/8 text-ink/30 cursor-not-allowed",
          )}
        >
          {busy === app.id ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />} Reject
        </button>
      </div>
    </div>
  );
}

// ── Main portal ───────────────────────────────────────────────────────────────

function AdminPortal() {
  const navigate = useNavigate();
  const { user, profile, loaded, displayName, logout } = useAuth();
  const { active, pending, loading, createNutritionist, revokeNutritionist, approve, reject, reload } = useAdmin(user);

  const [tab,         setTab]        = useState<Tab>("active");
  const [busy,        setBusy]       = useState<string | null>(null);
  const [createOpen,  setCreateOpen] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!user)                               { navigate({ to: "/login" }); return; }
    if (profile && profile.role !== "admin") { window.location.href = "/dashboard"; }
  }, [loaded, user, profile, navigate]);

  async function handleRevoke(app: NutritionistApplication) {
    setBusy(app.id);
    await revokeNutritionist(app);
    setBusy(null);
  }

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
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

          <div className="flex items-center gap-2">
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-full bg-emerald-deep py-2 pl-2 pr-3.5 text-sm font-medium text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.8)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <UserPlus className="size-4" /> Add Nutritionist
            </button>
            <button onClick={reload} className="grid size-9 place-items-center rounded-full nv-glass text-ink/50 hover:text-emerald-deep transition-colors" title="Refresh">
              <RefreshCw className="size-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-deep to-forest text-mint font-semibold text-xs ring-2 ring-white/70 hover:ring-emerald-deep/50 transition-all" title={displayName}>
                  {displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="font-semibold text-ink truncate">{displayName}</div>
                  <div className="text-xs text-ink/50 truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                  onClick={async () => { await logout(); navigate({ to: "/" }); }}
                >
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-12 sm:px-8">

        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink">Nutritionist Management</h1>
          <p className="mt-1 text-sm text-ink/50">Create and manage clinician accounts on Nutrisense-AI.</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4 max-w-2xl">
          {[
            { label: "Active nutritionists", value: active.length,  tone: "emerald" },
            { label: "Pending review",       value: pending.length, tone: "amber"   },
            { label: "Revoked",              value: 0,              tone: "coral"   },
          ].map(({ label, value, tone }) => (
            <div key={label} className="rounded-2xl nv-glass p-5 text-center">
              <div className={cn(
                "font-display text-3xl font-semibold tabular-nums",
                tone === "emerald" && "text-emerald-deep",
                tone === "amber"   && "text-amber",
                tone === "coral"   && "text-coral",
              )}>{value}</div>
              <div className="mt-1 text-[11px] text-ink/45">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl nv-glass p-1.5 w-fit">
          {([
            { k: "active"  as Tab, l: "Active Nutritionists", count: active.length  },
            { k: "pending" as Tab, l: "Pending Applications", count: pending.length },
          ]).map(({ k, l, count }) => (
            <button key={k} onClick={() => setTab(k)} className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              tab === k
                ? "bg-emerald-deep text-mint shadow-[0_4px_12px_-6px_rgba(15,118,110,0.5)]"
                : "text-ink/55 hover:text-emerald-deep",
            )}>
              {l}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  tab === k ? "bg-mint/20 text-mint" : "bg-ink/8 text-ink/50",
                )}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-ink/40">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : tab === "active" ? (
          active.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="grid size-16 place-items-center rounded-3xl bg-ink/5">
                <Users className="size-7 text-ink/30" />
              </div>
              <p className="text-sm text-ink/40">No nutritionists yet.</p>
              <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.6)] hover:scale-[1.02] transition-transform">
                <UserPlus className="size-4" /> Create first nutritionist
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((app) => (
                <NutritionistCard key={app.id} app={app} onRevoke={handleRevoke} busy={busy} />
              ))}
            </div>
          )
        ) : (
          pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="grid size-16 place-items-center rounded-3xl bg-ink/5">
                <Users className="size-7 text-ink/30" />
              </div>
              <p className="text-sm text-ink/40">No pending applications.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map((app) => (
                <PendingCard key={app.id} app={app} onApprove={handleApprove} onReject={handleReject} busy={busy} />
              ))}
            </div>
          )
        )}
      </main>

      {createOpen && (
        <CreateNutritionistModal
          onClose={() => setCreateOpen(false)}
          onCreate={async (p) => {
            const result = await createNutritionist(p);
            return result;
          }}
        />
      )}
    </div>
  );
}
