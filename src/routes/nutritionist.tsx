import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity, LogOut, Plus, Search, Sparkles, UserPlus, Users, X,
  ChevronRight, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePatients, type PatientRecord } from "@/hooks/usePatients";
import { predictRisk, type Prediction, type RiskScores } from "@/lib/mlApi";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/nutritionist")({
  head: () => ({ meta: [{ title: "Nutritionist Portal · Nutrisense-AI" }] }),
  component: NutritionistPortal,
});

// ── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function riskColor(score: number) {
  if (score >= 60) return "text-coral bg-coral/10";
  if (score >= 35) return "text-amber bg-amber/10";
  return "text-sky bg-sky/10";
}

function riskLabel(score: number) {
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MON";
  return "LOW";
}

// ── sub-components ────────────────────────────────────────────────────────────

function ScorePill({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", riskColor(score))}>
        {riskLabel(score)}
      </span>
      <span className="text-[10px] text-ink/40">{label}</span>
    </div>
  );
}

function PatientCard({
  patient,
  prediction,
  onClick,
}: {
  patient: PatientRecord;
  prediction?: Prediction;
  onClick: () => void;
}) {
  const { profile, todayLogs, assignedAt } = patient;
  const scores = prediction?.scores;
  const since = new Date(assignedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-[28px] nv-glass p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-deep to-forest text-mint font-semibold text-sm ring-2 ring-white/70">
            {getInitials(profile.name)}
          </div>
          <div>
            <div className="font-semibold text-sm text-ink leading-tight">{profile.name || "—"}</div>
            <div className="text-[11px] text-ink/45">
              {profile.age}y · {profile.sex} · BMI {profile.weightKg && profile.heightCm
                ? ((profile.weightKg / (profile.heightCm / 100) ** 2).toFixed(1))
                : "—"}
            </div>
          </div>
        </div>
        <ChevronRight className="size-4 text-ink/30 mt-1 transition-transform group-hover:translate-x-0.5" />
      </div>

      {/* risk scores row */}
      <div className="mt-4">
        {scores ? (
          <div className="flex justify-around">
            <ScorePill score={scores.anemia}     label="Anemia"   />
            <ScorePill score={scores.diabetes}   label="Diabetes" />
            <ScorePill score={scores.overweight} label="Overwt."  />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-ink/35">
            <Loader2 className="size-3 animate-spin" /> Computing risk…
          </div>
        )}
      </div>

      {/* footer */}
      <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-3 text-[10px] text-ink/40">
        <span>{todayLogs.length} meal{todayLogs.length !== 1 ? "s" : ""} today</span>
        <span>Since {since}</span>
      </div>
    </article>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="grid size-20 place-items-center rounded-3xl bg-emerald-deep/8 ring-1 ring-emerald-deep/15">
        <Users className="size-8 text-emerald-deep/60" />
      </div>
      <div className="max-w-xs">
        <h2 className="font-display text-xl font-semibold text-ink">No patients yet</h2>
        <p className="mt-2 text-sm text-ink/50 leading-relaxed">
          Add a patient using their Connect Code — a UUID they can copy from their Profile sheet.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
        <UserPlus className="size-4" /> Add first patient
      </button>
    </div>
  );
}

// ── Add-patient dialog ────────────────────────────────────────────────────────

function AddPatientDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (id: string) => Promise<true | string>;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");

  async function submit() {
    const id = code.trim();
    if (!id) return;
    setBusy(true);
    setErr("");
    const result = await onAdd(id);
    setBusy(false);
    if (result === true) {
      setCode("");
      onClose();
    } else {
      setErr(result);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-ink/40 hover:bg-ink/5 transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="grid size-12 place-items-center rounded-2xl bg-emerald-deep/10 mb-4">
          <UserPlus className="size-5 text-emerald-deep" />
        </div>
        <h2 className="font-display text-lg font-semibold text-ink">Add patient</h2>
        <p className="mt-1 text-sm text-ink/50">
          Ask your patient to open their Profile and copy their Connect Code.
        </p>

        <div className="mt-5 space-y-3">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Paste patient UUID here…"
            className="w-full rounded-2xl bg-ink/5 px-4 py-3 text-sm font-mono ring-1 ring-ink/8 focus:outline-none focus:ring-2 focus:ring-emerald-deep/40 transition-shadow"
          />

          {err && (
            <div className="flex items-start gap-2 rounded-xl bg-coral/8 px-3 py-2 text-[12px] text-coral ring-1 ring-coral/15">
              <AlertCircle className="size-3.5 mt-0.5 shrink-0" /> {err}
            </div>
          )}

          <button
            onClick={submit}
            disabled={!code.trim() || busy}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all",
              code.trim() && !busy
                ? "bg-emerald-deep text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.6)] hover:scale-[1.01] active:scale-[0.98]"
                : "cursor-not-allowed bg-ink/8 text-ink/30",
            )}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            {busy ? "Adding…" : "Add patient"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Patient detail sheet ──────────────────────────────────────────────────────

function PatientDetailSheet({
  patient,
  prediction,
  open,
  onClose,
  onRemove,
}: {
  patient: PatientRecord | null;
  prediction: Prediction | null;
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const scores = prediction?.scores;

  function scoreBar(score: number, color: string) {
    return (
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
        {patient && (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-ink/5">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-deep to-forest text-mint font-bold ring-2 ring-white/70">
                  {getInitials(patient.profile.name)}
                </div>
                <div>
                  <SheetTitle className="font-display text-xl font-semibold text-ink">
                    {patient.profile.name || "Patient"}
                  </SheetTitle>
                  <p className="text-sm text-ink/50">
                    {patient.profile.age}y · {patient.profile.sex} ·{" "}
                    {patient.profile.weightKg}kg · {patient.profile.heightCm}cm
                  </p>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Risk scores */}
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-3">
                  ML Risk Scores
                </div>
                {scores ? (
                  <div className="space-y-3">
                    {(
                      [
                        { key: "anemia",     label: "Anemia",     color: "#F87171" },
                        { key: "diabetes",   label: "Diabetes",   color: "#FBBF24" },
                        { key: "overweight", label: "Overweight", color: "#34D399" },
                      ] as const
                    ).map(({ key, label, color }) => {
                      const s = scores[key as keyof RiskScores] as number;
                      return (
                        <div key={key} className="rounded-2xl nv-glass p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-ink">{label}</span>
                            <span className="font-display text-xl font-medium tabular-nums" style={{ color }}>
                              {s}%
                            </span>
                          </div>
                          {scoreBar(s, color)}
                          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-ink/30">
                            <span>Low</span><span>High</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink/40">
                    <Loader2 className="size-4 animate-spin" /> Computing risk scores…
                  </div>
                )}
              </section>

              {/* Today's food log */}
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-3">
                  Today's Meals ({patient.todayLogs.length})
                </div>
                {patient.todayLogs.length === 0 ? (
                  <div className="rounded-2xl nv-glass px-5 py-6 text-center text-sm text-ink/40">
                    No meals logged today
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patient.todayLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 rounded-2xl nv-glass px-4 py-3">
                        {log.img ? (
                          <img src={log.img} alt={log.name} className="size-9 rounded-xl object-cover shrink-0" />
                        ) : (
                          <span className="size-9 text-2xl flex items-center justify-center shrink-0">{log.glyph}</span>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-ink truncate">{log.name}</div>
                          <div className="text-[11px] text-ink/45 truncate">{log.meta}</div>
                        </div>
                        <span className="ml-auto text-[10px] text-ink/35 shrink-0">{log.meal}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent activity */}
              {patient.recentLogs.length > patient.todayLogs.length && (
                <section>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-3">
                    Recent History
                  </div>
                  <div className="space-y-1.5">
                    {patient.recentLogs.slice(0, 8).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-ink/3 transition-colors">
                        {log.img
                          ? <img src={log.img} alt={log.name} className="size-7 rounded-lg object-cover shrink-0" />
                          : <span className="text-base shrink-0">{log.glyph}</span>}
                        <span className="text-sm text-ink/70 truncate flex-1">{log.name}</span>
                        {log.logged_at && (
                          <span className="text-[10px] text-ink/35 shrink-0">
                            {new Date(log.logged_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="px-6 py-4 border-t border-ink/5 bg-white/50">
              <button
                onClick={() => { onRemove(patient.id); onClose(); }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-coral bg-coral/5 hover:bg-coral/10 transition-colors"
              >
                <X className="size-4" /> Remove patient
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function NutritionistPortal() {
  const navigate = useNavigate();
  const { user, profile, loaded: authLoaded, displayName, logout } = useAuth();
  const { patients, loading, addPatient, removePatient } = usePatients(user);

  const [search, setSearch]           = useState("");
  const [addOpen, setAddOpen]         = useState(false);
  const [selected, setSelected]       = useState<PatientRecord | null>(null);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});

  // Auth guard — exact "nutritionist" role required
  useEffect(() => {
    if (!authLoaded) return;
    if (!user)                                { navigate({ to: "/login" }); return; }
    if (profile?.role === "admin")            { window.location.href = "/admin"; return; }
    if (profile && profile.role !== "nutritionist") { window.location.href = "/dashboard"; }
  }, [authLoaded, user, profile, navigate]);

  // Compute risk predictions for all patients
  useEffect(() => {
    if (loading || patients.length === 0) return;
    for (const p of patients) {
      if (predictions[p.id]) continue;
      predictRisk(p.todayLogs.length > 0 ? p.todayLogs : p.recentLogs.slice(0, 5), p.profile)
        .then((pred) => setPredictions((prev) => ({ ...prev, [p.id]: pred })))
        .catch(console.error);
    }
  }, [patients, loading]);

  const filtered = patients.filter((p) =>
    p.profile.name.toLowerCase().includes(search.toLowerCase()),
  );

  const initials = getInitials(displayName);

  async function handleLogout() {
    await logout();
    navigate({ to: "/" });
  }

  if (!authLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 rounded-full border-2 border-emerald-deep/20 border-t-emerald-deep animate-spin" />
      </div>
    );
  }

  return (
    <div className="nv-mesh min-h-screen text-ink pb-16">

      {/* ── Top bar ── */}
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
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Nutritionist Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 rounded-full bg-emerald-deep py-2 pl-2 pr-3.5 text-sm font-medium text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.8)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="size-4" /> Add Patient
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-deep to-forest text-mint font-semibold text-xs ring-2 ring-white/70 hover:ring-emerald-deep/50 transition-all"
                  title={displayName}
                >
                  {initials}
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
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-6xl px-5 pt-12 sm:px-8">

        {/* Summary strip */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
              <span className="text-emerald-deep">{displayName.split(" ")[0]}</span>
            </h1>
            <p className="mt-1 text-sm text-ink/50">
              {patients.length} patient{patients.length !== 1 ? "s" : ""} under your care
            </p>
          </div>

          {/* Stats chips */}
          {patients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(() => {
                const highRisk = patients.filter((p) => {
                  const s = predictions[p.id]?.scores.overall;
                  return s !== undefined && s >= 60;
                }).length;
                const noMeals = patients.filter((p) => p.todayLogs.length === 0).length;
                return (
                  <>
                    {highRisk > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral ring-1 ring-coral/20">
                        <Activity className="size-3" /> {highRisk} high-risk
                      </span>
                    )}
                    {noMeals > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-3 py-1 text-xs font-semibold text-amber ring-1 ring-amber/20">
                        {noMeals} no meals today
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-ink/40">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Loading patients…</span>
          </div>
        ) : patients.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-6 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ink/35" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients…"
                className="w-full rounded-full bg-ink/5 py-2.5 pl-10 pr-4 text-sm ring-1 ring-ink/8 focus:outline-none focus:ring-2 focus:ring-emerald-deep/40 transition-shadow"
              />
            </div>

            {/* Patient grid */}
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-ink/40">No patients match "{search}"</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    prediction={predictions[p.id]}
                    onClick={() => setSelected(p)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-16 max-w-6xl px-5 pb-8 sm:px-8">
        <div className="flex items-center justify-between border-t border-ink/5 pt-6 text-xs text-ink/35">
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-emerald-deep" />
            Nutrisense-AI · Nutritionist Portal
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 hover:text-coral transition-colors"
          >
            <LogOut className="size-3" /> Sign out
          </button>
        </div>
      </footer>

      {/* ── Dialogs / sheets ── */}
      <AddPatientDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addPatient}
      />

      <PatientDetailSheet
        patient={selected}
        prediction={selected ? (predictions[selected.id] ?? null) : null}
        open={!!selected}
        onClose={() => setSelected(null)}
        onRemove={removePatient}
      />
    </div>
  );
}
