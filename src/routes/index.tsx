import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Flame, History, Home, LineChart as LineIcon, Plus, Search, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";
import { useProfile, getInitials } from "@/hooks/useProfile";
import { INITIAL_LOG, type LogItem } from "@/data/mock";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { RiskGauges } from "@/components/dashboard/RiskGauges";
import { AIInsightPanel } from "@/components/dashboard/AIInsightPanel";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { LogMealSheet } from "@/components/dashboard/LogMealSheet";
import { OnboardingFlow } from "@/components/dashboard/OnboardingFlow";
import { ProfileSheet } from "@/components/dashboard/ProfileSheet";
import { PhotoCapture } from "@/components/dashboard/PhotoCapture";
import { MealDetailSheet } from "@/components/dashboard/MealDetailSheet";
import { RiskEngineSection } from "@/components/dashboard/sections/RiskEngineSection";
import { FoodLabSection } from "@/components/dashboard/sections/FoodLabSection";
import { TrendsSection } from "@/components/dashboard/sections/TrendsSection";
import { FoodLog } from "@/components/dashboard/FoodLog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nutrisense-AI — Understand Your Nutrition. Prevent Disease Before It Starts." },
      {
        name: "description",
        content: "AI-powered nutrition intelligence that predicts and prevents nutrition-related disease risk from your real eating habits.",
      },
      { property: "og:title", content: "Nutrisense-AI" },
      { property: "og:description", content: "AI-powered nutrition intelligence built around your real eating habits." },
    ],
  }),
  component: NutriVision,
});

type TabKey = "overview" | "risk" | "logs" | "trends";

const NAV_TABS: { k: TabKey; l: string }[] = [
  { k: "overview", l: "Overview" },
  { k: "risk",     l: "Risk Engine" },
  { k: "logs",     l: "Food Lab" },
  { k: "trends",   l: "Trends" },
];

function NutriVision() {
  const score = useCountUp(84);
  const { profile, loaded, saveProfile, clearProfile } = useProfile();

  const [active, setActive]               = useState<TabKey>("overview");
  const [logItems, setLogItems]           = useState<LogItem[]>(INITIAL_LOG);
  const [sheetOpen, setSheetOpen]         = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [selectedMeal, setSelectedMeal]   = useState<LogItem | null>(null);

  function addItem(item: LogItem)  { setLogItems((prev) => [item, ...prev]); }
  function removeItem(id: string)  { setLogItems((prev) => prev.filter((i) => i.id !== id)); }

  const BOTTOM_NAV = [
    { icon: Home,     label: "Home",    tab: "overview" as TabKey },
    { icon: LineIcon, label: "Trends",  tab: "trends"   as TabKey },
    { icon: Plus,     label: "Log",     fab: true },
    { icon: History,  label: "History", tab: "logs"     as TabKey },
    { icon: User,     label: "Profile", profile: true },
  ];

  const initials = profile ? getInitials(profile.name) : "?";

  return (
    <div className="nv-mesh min-h-screen text-ink pb-28">

      {/* ── Onboarding (shows once on first visit) ── */}
      {loaded && !profile && (
        <OnboardingFlow onComplete={saveProfile} />
      )}

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 nv-glass border-b border-emerald-deep/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}
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

          {/* Desktop nav tabs */}
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
            {/* Profile avatar */}
            <button
              onClick={() => setProfileOpen(true)}
              className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-deep to-forest text-mint font-semibold text-xs ring-2 ring-white/70 hover:ring-emerald-deep/50 transition-all"
              title={profile?.name ?? "Set up profile"}
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
            <HeroSection score={score} />
            <RiskGauges />

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
        onSave={saveProfile}
        onReset={() => { clearProfile(); setProfileOpen(false); }}
      />
      <MealDetailSheet item={selectedMeal} onClose={() => setSelectedMeal(null)} />
    </div>
  );
}
