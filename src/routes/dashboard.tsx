import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Flame, Home, LogOut, Plus, Search, Sparkles, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { predictRisk, type Prediction } from "@/lib/mlApi";
import type { LogItem } from "@/data/mock";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { RiskGauges } from "@/components/dashboard/RiskGauges";
import { AIInsightPanel } from "@/components/dashboard/AIInsightPanel";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { LogMealSheet } from "@/components/dashboard/LogMealSheet";
import { ProfileSheet } from "@/components/dashboard/ProfileSheet";
import { PhotoCapture } from "@/components/dashboard/PhotoCapture";
import { MealDetailSheet } from "@/components/dashboard/MealDetailSheet";
import { RiskEngineSection } from "@/components/dashboard/sections/RiskEngineSection";
import { FoodLabSection } from "@/components/dashboard/sections/FoodLabSection";
import { TrendsSection } from "@/components/dashboard/sections/TrendsSection";
import { FoodLog } from "@/components/dashboard/FoodLog";
import { OnboardingFlow } from "@/components/dashboard/OnboardingFlow";

type TabKey = "overview" | "risk" | "logs" | "trends";

const VALID_TABS: TabKey[] = ["overview", "risk", "logs", "trends"];

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Nutrisense-AI" }] }),
  validateSearch: (search: Record<string, unknown>): { tab: TabKey } => ({
    tab: VALID_TABS.includes(search.tab as TabKey) ? (search.tab as TabKey) : "overview",
  }),
  component: Dashboard,
});

const NAV_TABS: { k: TabKey; l: string }[] = [
  { k: "overview", l: "Overview"    },
  { k: "risk",     l: "Risk Engine" },
  { k: "logs",     l: "Food Lab"    },
  { k: "trends",   l: "Trends"      },
];

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loaded: authLoaded, displayName, logout, updateProfile } = useAuth();
  const { logs: logItems, loading: logsLoading, addLog, removeLog } = useFoodLogs(user);

  // Only today's logs feed the ML and hero stats
  const todayItems = useMemo(() => {
    const now = new Date();
    return logItems.filter((l) => {
      if (!l.logged_at) return false;
      const d = new Date(l.logged_at);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth()    === now.getMonth()    &&
        d.getDate()     === now.getDate()
      );
    });
  }, [logItems]);

  const { tab: active } = Route.useSearch();
  const setActive = (tab: TabKey) => navigate({ to: "/dashboard", search: { tab }, replace: true });
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<LogItem | null>(null);
  const [prediction, setPrediction]     = useState<Prediction | null>(null);
  const [predicting, setPredicting]     = useState(false);

  // Re-run ML prediction whenever today's food log or profile changes
  useEffect(() => {
    if (logsLoading) return;
    if (todayItems.length === 0) {
      setPrediction(null);
      return;
    }
    setPredicting(true);
    predictRisk(todayItems, profile)
      .then(setPrediction)
      .catch(console.error)
      .finally(() => setPredicting(false));
  }, [todayItems, logsLoading, profile]);

  useEffect(() => {
    if (!authLoaded) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (profile?.role === "nutritionist")         { window.location.href = "/nutritionist"; return; }
    if (profile?.role === "admin")                { window.location.href = "/admin"; return; }
  }, [authLoaded, user, profile, navigate]);

  if (!authLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 rounded-full border-2 border-emerald-deep/20 border-t-emerald-deep animate-spin" />
      </div>
    );
  }

  if (authLoaded && user && !profile) {
    return (
      <OnboardingFlow
        onComplete={async (p) => {
          await updateProfile(p);
        }}
      />
    );
  }

  if (authLoaded && user && profile?.role === "pending_nutritionist") {
    return (
      <div className="flex min-h-screen items-center justify-center nv-mesh px-6">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-amber/10 ring-2 ring-amber/20">
            <span className="text-4xl">⏳</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Application under review</h1>
            <p className="mt-2 text-sm text-ink/55 leading-relaxed">
              Your clinician application is being reviewed. Once an admin verifies your credentials
              you'll automatically gain access to the Nutritionist Portal.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-ink/12 px-5 py-2.5 text-sm font-semibold text-ink/60 hover:text-coral transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const addItem    = addLog;
  const removeItem = removeLog;
  async function handleLogout() {
    await logout();
    navigate({ to: "/" });
  }

  const initials = getInitials(displayName);

  const BOTTOM_NAV = [
    { icon: Home,         label: "Home",    tab: "overview" as TabKey },
    { icon: Activity,     label: "Risk",    tab: "risk"     as TabKey },
    { icon: Plus,         label: "Log",     fab: true                 },
    { icon: Stethoscope,  label: "Find",    href: "/find-nutritionist" },
    { icon: User,         label: "Profile", profile: true             },
  ];

  return (
    <div className="nv-mesh min-h-screen text-ink pb-28">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 nv-glass border-b border-emerald-deep/10">
        <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8 lg:px-12">

          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-2xl bg-emerald-deep shadow-[0_8px_24px_-12px_rgba(15,118,110,0.7)]">
              <Sparkles className="size-4 text-mint" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold tracking-tight text-emerald-deep">
                Nutrisense<span className="text-ink/40">-AI</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Personal Nutrition Intelligence</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 rounded-full nv-glass px-1.5 py-1.5 text-sm md:flex">
            {NAV_TABS.map((t) => (
              <button
                key={t.k}
                onClick={() => setActive(t.k)}
                className={cn(
                  "rounded-full px-4 py-1.5 font-medium transition-all",
                  active === t.k
                    ? "bg-emerald-deep text-mint shadow-[0_8px_20px_-10px_rgba(15,118,110,0.7)]"
                    : "text-ink/60 hover:text-emerald-deep",
                )}
              >
                {t.l}
              </button>
            ))}
            <button
              onClick={() => navigate({ to: "/find-nutritionist" })}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-ink/60 hover:text-emerald-deep transition-all"
            >
              <Stethoscope className="size-3.5" />
              Find Nutritionist
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActive("logs")}
              className="grid size-9 place-items-center rounded-full nv-glass text-ink/60 hover:text-emerald-deep transition-colors"
              title="Food Lab"
            >
              <Search className="size-4" />
            </button>
            <button
              onClick={() => setSheetOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-deep py-2 pl-2 pr-3.5 text-sm font-medium text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.8)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="size-4" /> Log Meal
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-deep to-forest text-mint font-semibold text-xs ring-2 ring-white/70 hover:ring-emerald-deep/50 transition-all"
              title={displayName}
            >
              {initials}
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main key={active} className="animate-nv-expand px-5 pt-12 sm:px-8 lg:px-12">

        {active === "overview" && (
          <div className="space-y-14">
            <HeroSection name={displayName} logItems={todayItems} scores={prediction?.scores} profile={profile} />
            <RiskGauges scores={prediction?.scores} shap={prediction?.shap} predicting={predicting} />

            <section className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3 space-y-6">
                <AIInsightPanel prediction={prediction} />
                <PhotoCapture onAdd={addItem} />
                <TrendChart logItems={logItems} />
              </div>
              <div className="lg:col-span-2">
                <FoodLog
                  logItems={todayItems}
                  onAdd={addItem}
                  onRemove={removeItem}
                  onOpenLogger={() => setSheetOpen(true)}
                  onMealClick={setSelectedMeal}
                />
              </div>
            </section>

            <Recommendations />

            <footer className="flex flex-col items-center justify-between gap-4 border-t border-ink/5 pt-8 pb-4 text-xs text-ink/45 sm:flex-row">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-emerald-deep" />
                Nutrisense-AI · Built for clinicians and the people they care about.
              </div>
              <div className="flex items-center gap-4">
                <span>v0.1 · Capstone Preview</span>
                <span className="inline-flex items-center gap-1">
                  <Flame className="size-3" /> {todayItems.length} meal{todayItems.length !== 1 ? "s" : ""} today
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-ink/35 hover:text-coral transition-colors"
                >
                  <LogOut className="size-3" /> Sign out
                </button>
              </div>
            </footer>
          </div>
        )}

        {active === "risk" && (
          <div className="pb-16">
            <RiskEngineSection prediction={prediction} />
          </div>
        )}

        {active === "logs" && (
          <div className="pb-16">
            <FoodLabSection
              logItems={logItems}
              onAdd={addItem}
              onRemove={removeItem}
              onOpenLogger={() => setSheetOpen(true)}
            />
          </div>
        )}

        {active === "trends" && (
          <div className="pb-16">
            <TrendsSection prediction={prediction} logItems={logItems} profile={profile} />
          </div>
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex w-full items-center justify-between gap-1 rounded-t-3xl border border-ink/5 bg-white/90 px-4 pb-7 pt-3 shadow-[0_-20px_40px_-20px_rgba(15,39,36,0.2)] backdrop-blur-xl md:hidden">
        {BOTTOM_NAV.map((n, i) => {
          const Icon = n.icon;
          if (n.fab) {
            return (
              <button
                key={i}
                onClick={() => setSheetOpen(true)}
                className="-mt-9 grid size-14 place-items-center rounded-full bg-emerald-deep text-mint shadow-[0_18px_36px_-12px_rgba(15,118,110,0.7)] ring-4 ring-white active:scale-95 transition-transform"
              >
                <Icon className="size-6" />
              </button>
            );
          }
          if (n.profile) {
            return (
              <button
                key={i}
                onClick={() => setProfileOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-tight text-ink/40 transition-colors hover:text-emerald-deep"
              >
                <Icon className="size-5" />
                Profile
              </button>
            );
          }
          if (n.href) {
            return (
              <button
                key={i}
                onClick={() => navigate({ to: n.href as string })}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-tight text-ink/40 transition-colors hover:text-emerald-deep"
              >
                <Icon className="size-5" />
                {n.label}
              </button>
            );
          }
          const isActive = n.tab === active;
          return (
            <button
              key={i}
              onClick={() => n.tab && setActive(n.tab)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-tight transition-colors",
                isActive ? "text-emerald-deep" : "text-ink/40",
              )}
            >
              <Icon className="size-5" />
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* ── Sheets ── */}
      <LogMealSheet open={sheetOpen} onOpenChange={setSheetOpen} onAdd={addItem} />
      <ProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile}
        userId={user?.id}
        onSave={async (p) => { await updateProfile(p); setProfileOpen(false); }}
        onLogout={handleLogout}
      />
      <MealDetailSheet item={selectedMeal} onClose={() => setSelectedMeal(null)} prediction={prediction} />
    </div>
  );
}
