import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Brain,
  ChevronRight,
  Compass,
  Droplet,
  Flame,
  Heart,
  History,
  Home,
  LineChart as LineIcon,
  Mic,
  Plus,
  Search,
  Sparkles,
  User,
  Utensils,
  Wind,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriVision AI — Understand Your Nutrition. Prevent Disease Before It Starts." },
      {
        name: "description",
        content:
          "AI-powered nutrition intelligence that predicts and prevents nutrition-related disease risk from your real eating habits.",
      },
      { property: "og:title", content: "NutriVision AI" },
      {
        property: "og:description",
        content:
          "AI-powered nutrition intelligence built around your real eating habits.",
      },
    ],
  }),
  component: NutriVision,
});

/* ------------------------------ Helpers ------------------------------ */

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function Ring({
  value,
  size = 320,
  stroke = 14,
  color = "var(--emerald-deep)",
  track = "color-mix(in oklab, var(--emerald-deep) 10%, transparent)",
  label,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);
  useEffect(() => {
    const id = setTimeout(() => setOffset(c - (c * value) / 100), 80);
    return () => clearTimeout(id);
  }, [c, value]);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
        {label && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-deep/60">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        top: `${Math.round((i * 53) % 100)}%`,
        left: `${Math.round((i * 71) % 100)}%`,
        size: 6 + ((i * 7) % 12),
        delay: (i * 0.4) % 5,
        hue: i % 3 === 0 ? "#38BDF8" : i % 3 === 1 ? "#0F766E" : "#F59E0B",
      })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full blur-md animate-nv-float animate-nv-pulse"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.hue,
            opacity: 0.25,
            animationDelay: `${d.delay}s, ${d.delay / 2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------ Data ------------------------------ */

const RISKS = [
  {
    key: "anemia",
    label: "Anemia Risk",
    value: 38,
    badge: "MONITOR",
    badgeTone: "coral" as const,
    trend: "+2.4%",
    trendUp: true,
    note: "Iron intake under target 5 days. Suggest Isombe + Ibishyimbo at lunch.",
    color: "#FB7185",
  },
  {
    key: "diabetes",
    label: "Type 2 Diabetes",
    value: 21,
    badge: "STABLE",
    badgeTone: "amber" as const,
    trend: "−1.1%",
    trendUp: false,
    note: "Evening starch loads from Ubugali nudging fasting glucose.",
    color: "#F59E0B",
  },
  {
    key: "overweight",
    label: "Overweight Risk",
    value: 12,
    badge: "LOW",
    badgeTone: "sky" as const,
    trend: "Stable",
    trendUp: false,
    note: "Caloric balance aligned with movement levels this week.",
    color: "#38BDF8",
  },
];

const FOODS = [
  { name: "Isombe & Rice", meta: "Lunch · 420 kcal · 12mg Iron", tag: "High Iron", tone: "emerald", glyph: "🥬" },
  { name: "Ubugali & Ibishyimbo", meta: "Dinner · 580 kcal · Beans", tag: "Complex Carb", tone: "amber", glyph: "🫘" },
  { name: "Steamed Matoke", meta: "Breakfast · 310 kcal · Plantain", tag: "Balanced", tone: "sky", glyph: "🍌" },
  { name: "Sweet Potato & Sorghum", meta: "Snack · 240 kcal · Fiber", tag: "Low GI", tone: "emerald", glyph: "🍠" },
];

const TREND = [
  { d: "Mon", score: 71, iron: 8 },
  { d: "Tue", score: 74, iron: 10 },
  { d: "Wed", score: 70, iron: 7 },
  { d: "Thu", score: 78, iron: 11 },
  { d: "Fri", score: 80, iron: 12 },
  { d: "Sat", score: 82, iron: 13 },
  { d: "Sun", score: 84, iron: 14 },
];

const SHAP = [
  { f: "Iron intake", v: -0.42, label: "Below target" },
  { f: "Vitamin C", v: -0.18, label: "Limits absorption" },
  { f: "Legumes (Ibishyimbo)", v: +0.34, label: "Protective" },
  { f: "Leafy greens (Isombe)", v: +0.26, label: "Protective" },
  { f: "Sugar load", v: -0.12, label: "Slight" },
];

/* ------------------------------ Page ------------------------------ */

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
            {[
              { k: "overview", l: "Overview" },
              { k: "risk", l: "Risk Engine" },
              { k: "logs", l: "Food Lab" },
              { k: "trends", l: "Trends" },
            ].map((t) => (
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
        {/* HERO */}
        <section className="animate-nv-rise relative grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full nv-glass px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-deep">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-deep opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-deep" />
              </span>
              Morning Brief · Jean Jacques
            </div>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-[56px]">
              Understand your nutrition. <br />
              <span className="text-emerald-deep">Prevent disease</span> before it starts.
            </h1>
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-ink/65">
              AI-powered nutrition intelligence built around your real eating habits. NutriVision watches the
              patterns most clinicians miss — and tells you, gently, what to change next.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-deep/8 px-4 py-2 text-sm font-medium text-emerald-deep ring-1 ring-emerald-deep/15">
                <Heart className="size-4" /> Metabolic Phase: Recovery
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky/10 px-4 py-2 text-sm font-medium text-sky ring-1 ring-sky/20">
                <Droplet className="size-4" /> Hydration: Optimal
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber/10 px-4 py-2 text-sm font-medium text-amber ring-1 ring-amber/20">
                <Wind className="size-4" /> Iron: Low 5d
              </span>
            </div>
          </div>

          <div className="relative grid place-items-center">
            <Particles />
            <div className="absolute inset-x-12 top-12 -z-10 h-[280px] rounded-full bg-mint/60 blur-3xl" />
            <Ring value={score} label="Health Score">
              <span className="font-display text-7xl font-medium tracking-tighter text-ink tabular-nums">{score}</span>
              <span className="mt-1 text-xs font-medium text-ink/50">+6 vs last week</span>
            </Ring>
            <div className="absolute -right-2 top-6 hidden rounded-2xl nv-glass px-3 py-2 text-xs md:block">
              <div className="text-[10px] uppercase tracking-widest text-ink/40">Calories</div>
              <div className="font-display text-lg font-medium tabular-nums">1,840</div>
            </div>
            <div className="absolute -left-2 bottom-8 hidden rounded-2xl nv-glass px-3 py-2 text-xs md:block">
              <div className="text-[10px] uppercase tracking-widest text-ink/40">Protein</div>
              <div className="font-display text-lg font-medium tabular-nums">86g</div>
            </div>
          </div>
        </section>

        {/* RISK GAUGES */}
        <section className="grid gap-5 sm:grid-cols-3">
          {RISKS.map((r, i) => (
            <article
              key={r.key}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-nv-rise group relative overflow-hidden rounded-[28px] nv-glass p-6 transition-transform hover:-translate-y-1"
            >
              <div
                className="absolute -top-16 -right-16 size-44 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-60"
                style={{ background: r.color }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                    {r.label}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-medium tracking-tighter text-ink tabular-nums">
                      {r.value}%
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-semibold",
                        r.trendUp ? "text-coral" : "text-emerald-deep",
                      )}
                    >
                      {r.trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {r.trend}
                    </span>
                  </div>
                </div>
                <Ring value={r.value} size={64} stroke={6} color={r.color} track={`${r.color}22`}>
                  <span className="text-[10px] font-semibold text-ink/60">{r.value}</span>
                </Ring>
              </div>
              <div className="relative mt-5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full animate-nv-grow-bar rounded-full"
                    style={{ width: `${r.value}%`, background: r.color }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-ink/35">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <p className="relative mt-4 text-[13px] leading-relaxed text-ink/65">{r.note}</p>
              <button className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-deep hover:gap-1.5 transition-all">
                Why am I seeing this? <ChevronRight className="size-3" />
              </button>
              <span
                className={cn(
                  "absolute right-5 top-5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  r.badgeTone === "coral" && "bg-coral/10 text-coral",
                  r.badgeTone === "amber" && "bg-amber/10 text-amber",
                  r.badgeTone === "sky" && "bg-sky/10 text-sky",
                )}
              >
                {r.badge}
              </span>
            </article>
          ))}
        </section>

        {/* AI INSIGHT + FOOD LOG */}
        <section className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            {/* AI Insight */}
            <div className="relative overflow-hidden rounded-[32px] bg-emerald-deep p-8 text-mint shadow-[0_30px_80px_-40px_rgba(15,118,110,0.7)]">
              <div className="absolute -top-24 -right-12 size-72 rounded-full bg-sky/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-12 size-72 rounded-full bg-emerald-300/10 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-mint/10 backdrop-blur-sm ring-1 ring-mint/20">
                  <Brain className="size-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-mint/60">AI Insight</div>
                  <div className="text-sm font-medium">Daily Intelligence · 09:42</div>
                </div>
              </div>
              <h3 className="relative mt-6 font-display text-2xl font-medium leading-snug">
                “Your iron intake has been below recommended levels for 5 consecutive days.”
              </h3>
              <p className="relative mt-3 max-w-[58ch] text-[15px] leading-relaxed text-mint/75">
                To keep your anemia risk from creeping up, add 150g of <span className="text-mint">Isombe</span> or a side
                of <span className="text-mint">Ibishyimbo</span> at lunch. Your absorption will improve if paired with a
                citrus or tomato source for vitamin C.
              </p>

              {/* SHAP-style explainability */}
              <div className="relative mt-7 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-mint/60">
                  <span>What influences your anemia risk</span>
                  <span>SHAP · explainable AI</span>
                </div>
                <div className="space-y-3">
                  {SHAP.map((s) => {
                    const pos = s.v >= 0;
                    const mag = Math.min(95, Math.abs(s.v) * 180);
                    return (
                      <div key={s.f} className="grid grid-cols-[140px_1fr_60px] items-center gap-3 text-xs">
                        <span className="truncate text-mint/80">{s.f}</span>
                        <div className="relative h-2.5 rounded-full bg-white/5">
                          <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                          <div
                            className="absolute inset-y-0 animate-nv-grow-bar rounded-full"
                            style={{
                              width: `${mag / 2}%`,
                              [pos ? "left" : "right"]: "50%",
                              background: pos ? "#34D399" : "#FB7185",
                              transformOrigin: pos ? "left" : "right",
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-right font-mono text-[11px] font-semibold tabular-nums",
                            pos ? "text-emerald-200" : "text-coral",
                          )}
                        >
                          {pos ? "+" : ""}
                          {s.v.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-[10px] uppercase tracking-widest text-mint/50">Impact on Risk</div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-display text-xl font-medium tabular-nums">−6.2%</span>
                    <span className="text-xs text-mint/60">if you act today</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-[10px] uppercase tracking-widest text-mint/50">Suggested Correction</div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-display text-xl font-medium">+150g Isombe</span>
                    <span className="text-xs text-mint/60">at lunch</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trends Chart */}
            <div className="rounded-[32px] nv-glass p-7">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Weekly trend</div>
                  <h4 className="font-display text-xl font-medium">Vital Score Evolution</h4>
                </div>
                <div className="flex gap-1 rounded-full bg-ink/5 p-1 text-[11px] font-medium">
                  {["7d", "30d", "90d"].map((p, i) => (
                    <button
                      key={p}
                      className={cn(
                        "rounded-full px-2.5 py-1 transition-colors",
                        i === 0 ? "bg-white text-emerald-deep shadow-sm" : "text-ink/50 hover:text-ink",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F766E" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gIron" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#0F2724" strokeOpacity={0.06} vertical={false} />
                    <XAxis
                      dataKey="d"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#13272499", fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis hide domain={[60, 100]} />
                    <RTooltip
                      cursor={{ stroke: "#0F766E", strokeOpacity: 0.2 }}
                      contentStyle={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(15,118,110,0.15)",
                        borderRadius: 14,
                        fontSize: 12,
                        backdropFilter: "blur(12px)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="iron"
                      stroke="#38BDF8"
                      strokeWidth={2}
                      fill="url(#gIron)"
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#0F766E"
                      strokeWidth={2.5}
                      fill="url(#gScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Food log column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Search / Log entry */}
            <div className="rounded-3xl nv-glass p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-base font-semibold">Log a meal</h4>
                <button className="grid size-8 place-items-center rounded-full bg-emerald-deep text-mint hover:scale-105 transition-transform">
                  <Mic className="size-3.5" />
                </button>
              </div>
              <label className="mt-3 flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2.5 ring-1 ring-ink/5 focus-within:ring-emerald-deep/40">
                <Search className="size-4 text-ink/40" />
                <input
                  placeholder="Search Isombe, Matoke, Ubugali…"
                  className="w-full bg-transparent text-sm placeholder:text-ink/35 focus:outline-none"
                />
                <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 text-[10px] font-mono text-ink/40">⌘K</kbd>
              </label>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Isombe", "Ubugali", "Ibishyimbo", "Matoke", "Sweet Potato", "Cassava", "Rice", "Sorghum"].map(
                  (f) => (
                    <button
                      key={f}
                      className="rounded-full bg-mint/40 px-2.5 py-1 text-[11px] font-medium text-emerald-deep hover:bg-mint transition-colors"
                    >
                      {f}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Recent entries */}
            <div className="rounded-3xl nv-glass p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-base font-semibold">Today</h4>
                <button className="text-[11px] font-semibold uppercase tracking-widest text-emerald-deep">
                  Full log
                </button>
              </div>
              <ul className="mt-3 space-y-2.5">
                {FOODS.map((f, i) => (
                  <li
                    key={f.name}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className="animate-nv-rise flex items-center gap-3 rounded-2xl bg-white/55 p-3 ring-1 ring-ink/5 transition-transform hover:-translate-y-0.5"
                  >
                    <div
                      className={cn(
                        "grid size-12 place-items-center rounded-xl text-2xl ring-1 ring-ink/5",
                        f.tone === "emerald" && "bg-gradient-to-br from-mint to-emerald-100",
                        f.tone === "amber" && "bg-gradient-to-br from-amber/15 to-amber/5",
                        f.tone === "sky" && "bg-gradient-to-br from-sky/15 to-sky/5",
                      )}
                    >
                      <span aria-hidden>{f.glyph}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-ink">{f.name}</div>
                      <div className="truncate text-[11px] text-ink/50">{f.meta}</div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        f.tone === "emerald" && "bg-emerald-deep/10 text-emerald-deep",
                        f.tone === "amber" && "bg-amber/10 text-amber",
                        f.tone === "sky" && "bg-sky/10 text-sky",
                      )}
                    >
                      {f.tag}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weekly target */}
            <div className="rounded-3xl bg-sky/8 p-5 ring-1 ring-sky/15">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky">Weekly Nutrient Target</div>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-display text-3xl font-medium tabular-nums">12,400</span>
                <span className="mb-1 text-sm text-ink/45">/ 15,000 kcal</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sky/15">
                <div className="h-full w-4/5 animate-nv-grow-bar rounded-full bg-sky" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { l: "Iron", v: "9.4mg", c: "coral" as const },
                  { l: "Fiber", v: "28g", c: "emerald" as const },
                  { l: "Sugar", v: "42g", c: "amber" as const },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-white/60 p-2.5 ring-1 ring-ink/5">
                    <div
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-widest",
                        s.c === "coral" && "text-coral",
                        s.c === "emerald" && "text-emerald-deep",
                        s.c === "amber" && "text-amber",
                      )}
                    >
                      {s.l}
                    </div>
                    <div className="font-display text-base font-medium tabular-nums">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI PREDICTION PIPELINE */}
        <section className="relative overflow-hidden rounded-[36px] nv-glass p-8 sm:p-10">
          <Particles />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">AI Prediction Engine</div>
              <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                From your plate to a personalized prognosis.
              </h3>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-emerald-deep/10 px-4 py-2 text-sm font-semibold text-emerald-deep ring-1 ring-emerald-deep/20">
              <Compass className="size-4" /> See live model
            </button>
          </div>

          <ol className="relative mt-8 grid gap-6 sm:grid-cols-4">
            {[
              { i: <Utensils className="size-4" />, l: "Food Data", s: "Local + global database" },
              { i: <Activity className="size-4" />, l: "Nutrient Analysis", s: "32 micronutrients tracked" },
              { i: <Brain className="size-4" />, l: "AI Model", s: "Gradient boosted + SHAP" },
              { i: <Heart className="size-4" />, l: "Health Prediction", s: "Risk + recommendation" },
            ].map((step, i) => (
              <li key={step.l} className="relative">
                <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-ink/5 backdrop-blur-md transition-transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 text-emerald-deep">
                    <span className="grid size-8 place-items-center rounded-xl bg-emerald-deep/10">{step.i}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
                      Step {i + 1}
                    </span>
                  </div>
                  <div className="mt-3 font-display text-base font-semibold">{step.l}</div>
                  <div className="text-[12px] text-ink/55">{step.s}</div>
                </div>
                {i < 3 && (
                  <div className="absolute right-[-14px] top-1/2 hidden -translate-y-1/2 sm:block">
                    <div className="h-px w-7 bg-gradient-to-r from-emerald-deep/40 to-transparent" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* RECOMMENDATIONS */}
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Personalized for you</div>
              <h3 className="font-display text-2xl font-medium tracking-tight">Foods that will move your numbers</h3>
            </div>
            <button className="text-[11px] font-semibold uppercase tracking-widest text-emerald-deep hover:underline">
              View all
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "Isombe", b: "+12mg Iron · −6% Anemia", a: "Local · in season", s: 96, g: "🥬" },
              { n: "Ibishyimbo", b: "Plant protein · low GI", a: "Local · pantry staple", s: 92, g: "🫘" },
              { n: "Sweet Potato", b: "Vit A · stable energy", a: "Local · market", s: 88, g: "🍠" },
              { n: "Sorghum porridge", b: "Fiber · slow carb", a: "Local · breakfast swap", s: 84, g: "🌾" },
            ].map((r, i) => (
              <article
                key={r.n}
                style={{ animationDelay: `${i * 80}ms` }}
                className="animate-nv-rise group relative overflow-hidden rounded-3xl nv-glass p-5 transition-transform hover:-translate-y-1.5"
              >
                <div className="absolute -top-12 -right-10 size-32 rounded-full bg-mint/60 blur-2xl transition-opacity group-hover:opacity-100 opacity-70" />
                <div className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-mint to-white text-3xl ring-1 ring-ink/5">
                  <span aria-hidden>{r.g}</span>
                </div>
                <div className="relative mt-4 flex items-center justify-between">
                  <h4 className="font-display text-lg font-semibold">{r.n}</h4>
                  <span className="rounded-md bg-emerald-deep/10 px-2 py-0.5 text-[10px] font-bold text-emerald-deep">
                    {r.s}
                  </span>
                </div>
                <p className="relative mt-1 text-[13px] text-ink/65">{r.b}</p>
                <div className="relative mt-3 flex items-center justify-between text-[11px] text-ink/45">
                  <span className="inline-flex items-center gap-1">
                    <Apple className="size-3" /> {r.a}
                  </span>
                  <span className="font-semibold text-emerald-deep">3×/week</span>
                </div>
                <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full animate-nv-grow-bar rounded-full bg-gradient-to-r from-emerald-deep to-sky"
                    style={{ width: `${r.s}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Footer brand line */}
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
        {[
          { i: Home, l: "Home", a: true },
          { i: LineIcon, l: "Trends" },
          { i: Plus, l: "Log", fab: true },
          { i: History, l: "History" },
          { i: User, l: "Profile" },
        ].map((n, i) => {
          const Icon = n.i;
          if (n.fab) {
            return (
              <button
                key={i}
                className="-mt-9 grid size-14 place-items-center rounded-full bg-emerald-deep text-mint shadow-[0_18px_36px_-12px_rgba(15,118,110,0.7)] ring-4 ring-white"
              >
                <Icon className="size-6" />
              </button>
            );
          }
          return (
            <button
              key={i}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-tight",
                n.a ? "text-emerald-deep" : "text-ink/40",
              )}
            >
              <Icon className="size-5" />
              {n.l}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

