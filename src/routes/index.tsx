import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Flame, History, Home, LineChart as LineIcon, Plus, Search, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { RiskGauges } from "@/components/dashboard/RiskGauges";
import { AIInsightPanel } from "@/components/dashboard/AIInsightPanel";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { FoodLog } from "@/components/dashboard/FoodLog";
import { PredictionPipeline } from "@/components/dashboard/PredictionPipeline";
import { Recommendations } from "@/components/dashboard/Recommendations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriVision AI — Understand Your Nutrition. Prevent Disease Before It Starts." },
      {
        name: "description",
        content: "AI-powered nutrition intelligence that predicts and prevents nutrition-related disease risk from your real eating habits.",
      },
      { property: "og:title", content: "NutriVision AI" },
      { property: "og:description", content: "AI-powered nutrition intelligence built around your real eating habits." },
    ],
  }),
  component: NutriVision,
});

const NAV_TABS = [
  { k: "overview", l: "Overview" },
  { k: "risk", l: "Risk Engine" },
  { k: "logs", l: "Food Lab" },
  { k: "trends", l: "Trends" },
];

const BOTTOM_NAV = [
  { icon: Home, label: "Home", active: true },
  { icon: LineIcon, label: "Trends" },
  { icon: Plus, label: "Log", fab: true },
  { icon: History, label: "History" },
  { icon: User, label: "Profile" },
];

function NutriVision() {
  const score = useCountUp(84);
  const [active, setActive] = useState("overview");

  return (
    <div className="nv-mesh min-h-screen text-ink pb-28">
      {/* Top bar */}
      <header className="sticky top-0 z-40 nv-glass border-b border-emerald-deep/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-2xl bg-emerald-deep shadow-[0_8px_24px_-12px_rgba(15,118,110,0.7)]">
              <Sparkles className="size-4 text-mint" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold tracking-tight text-emerald-deep">
                NutriVision <span className="text-ink/40">AI</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Personal Nutrition Intelligence</div>
            </div>
          </div>
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
          <div className="flex items-center gap-2">
            <button className="grid size-9 place-items-center rounded-full nv-glass text-ink/60 hover:text-emerald-deep transition-colors">
              <Bell className="size-4" />
            </button>
            <button className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-deep py-2 pl-2 pr-3.5 text-sm font-medium text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.8)] transition-transform hover:scale-[1.02]">
              <Plus className="size-4" /> Log Meal
            </button>
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-deep to-forest text-mint font-semibold text-xs ring-2 ring-white/70">
              JJ
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-5 pt-12 sm:px-8">
        <HeroSection score={score} />
        <RiskGauges />

        <section className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <AIInsightPanel />
            <TrendChart />
          </div>
          <div className="lg:col-span-2">
            <FoodLog />
          </div>
        </section>

        <PredictionPipeline />
        <Recommendations />

        <section className="flex flex-col items-center justify-between gap-4 border-t border-ink/5 pt-8 text-xs text-ink/45 sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-emerald-deep" />
            NutriVision AI · Built for clinicians and the people they care about.
          </div>
          <div className="flex items-center gap-4">
            <span>v0.1 · Capstone Preview</span>
            <span className="inline-flex items-center gap-1">
              <Flame className="size-3" /> 7 day streak
            </span>
          </div>
        </section>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-between gap-1 rounded-t-3xl border border-ink/5 bg-white/90 px-4 pb-7 pt-3 shadow-[0_-20px_40px_-20px_rgba(15,39,36,0.2)] backdrop-blur-xl md:hidden">
        {BOTTOM_NAV.map((n, i) => {
          const Icon = n.icon;
          if (n.fab) {
            return (
              <button key={i} className="-mt-9 grid size-14 place-items-center rounded-full bg-emerald-deep text-mint shadow-[0_18px_36px_-12px_rgba(15,118,110,0.7)] ring-4 ring-white">
                <Icon className="size-6" />
              </button>
            );
          }
          return (
            <button
              key={i}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-tight",
                n.active ? "text-emerald-deep" : "text-ink/40",
              )}
            >
              <Icon className="size-5" />
              {n.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
