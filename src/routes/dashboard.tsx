import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Flame, History, Home, LineChart as LineIcon, LogOut, Plus, Search, Sparkles, User } from "lucide-react";
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

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Nutrisense-AI" }] }),
  component: Dashboard,
});

type TabKey = "overview" | "risk" | "logs" | "trends";

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

  const [active, setActive]             = useState<TabKey>("overview");
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<LogItem | null>(null);
  const [prediction, setPrediction]     = useState<Prediction | null>(null);

  // Re-run ML prediction whenever the food log or profile changes
  useEffect(() => {
    if (logsLoading) return;
    predictRisk(logItems, profile).then(setPrediction);
  }, [logItems, logsLoading, profile]);

  useEffect(() => {
    if (authLoaded && !user) navigate({ to: "/login" });
  }, [authLoaded, user, navigate]);

  if (!authLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 rounded-full border-2 border-emerald-deep/20 border-t-emerald-deep animate-spin" />
      </div>
    );
  }

  const addItem    = addLog;
  const removeItem = removeLog;
  const healthScore = prediction ? Math.round(100 - prediction.scores.overall) : 72;

  async function handleLogout() {
    await logout();
    navigate({ to: "/" });
  }

  const initials = getInitials(displayName);

  const BOTTOM_NAV = [
    { icon: Home,     label: "Home",    tab: "overview" as TabKey },
    { icon: LineIcon, label: "Trends",  tab: "trends"   as TabKey },
    { icon: Plus,     label: "Log",     fab: true                 },
    { icon: History,  label: "History", tab: "logs"     as TabKey },
    { icon: User,     label: "Profile", profile: true             },
  ];

  return (
    <div className="nv-mesh min-h-screen text-ink pb-28">

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
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="grid size-9 place-items-center rounded-full nv-glass text-ink/60 hover:text-emerald-deep transition-colors">
              <Search className="size-4" />
            </button>
            <button className="grid size-9 place-items-center rounded-full nv-glass text-ink/60 hover:text-emerald-deep transition-colors">
              <Bell className="size-4" />
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
      <main key={active} className="animate-nv-expand mx-auto max-w-6xl px-5 pt-12 sm:px-8">

        {active === "overview" && (
          <div className="space-y-14">
            <HeroSection score={healthScore} name={displayName} />
            <RiskGauges scores={prediction?.scores} shap={prediction?.shap} />

            <section className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3 space-y-6">
                <AIInsightPanel />
                <PhotoCapture onAdd={addItem} />
                <TrendChart />
              </div>
              <div className="lg:col-span-2">
                <FoodLog
                  logItems={logItems}
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
                  <Flame className="size-3" /> 7 day streak
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
            <RiskEngineSection />
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
            <TrendsSection />
          </div>
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-between gap-1 rounded-t-3xl border border-ink/5 bg-white/90 px-4 pb-7 pt-3 shadow-[0_-20px_40px_-20px_rgba(15,39,36,0.2)] backdrop-blur-xl md:hidden">
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
        onSave={async (p) => { await updateProfile(p); setProfileOpen(false); }}
        onLogout={handleLogout}
      />
      <MealDetailSheet item={selectedMeal} onClose={() => setSelectedMeal(null)} />
    </div>
  );
}
