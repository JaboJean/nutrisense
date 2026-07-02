import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Brain, Camera, ChevronRight, Dna, Flame, Leaf, Shield, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nutrisense-AI — Prevent Disease Through Nutrition" },
      { name: "description", content: "AI-powered nutrition intelligence that predicts anemia, Type 2 diabetes, and overweight risk from your daily meals." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user, loaded: authLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoaded && user) {
      navigate({ to: "/dashboard", search: { tab: "overview" } });
    }
  }, [authLoaded, user, navigate]);

  return (
    <div className="min-h-screen bg-white text-ink overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-emerald-deep shadow-[0_6px_16px_-8px_rgba(15,118,110,0.7)]">
              <Sparkles className="size-3.5 text-mint" />
            </div>
            <span className="font-display text-[15px] font-semibold text-emerald-deep">
              Nutrisense<span className="text-ink/40">-AI</span>
            </span>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-ink/55 md:flex">
            <a href="#features"    className="hover:text-emerald-deep transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-deep transition-colors">How it works</a>
            <a href="#about"       className="hover:text-emerald-deep transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:block text-sm font-semibold text-ink/60 hover:text-emerald-deep transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-1.5 rounded-full bg-emerald-deep px-4 py-2 text-sm font-semibold text-mint shadow-[0_8px_20px_-10px_rgba(15,118,110,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Get started <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative nv-mesh min-h-screen pt-16 flex items-center overflow-hidden">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 size-[600px] rounded-full bg-emerald-deep/6 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-[400px] rounded-full bg-sky/8 blur-[100px]" />

        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-8">

          {/* Copy */}
          <div className="animate-nv-rise">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-deep/8 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-deep">
              <span className="size-1.5 rounded-full bg-emerald-deep animate-nv-pulse" />
              AI-Powered Nutrition Intelligence
            </div>

            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-[64px]">
              Understand your<br />
              nutrition.<br />
              <span className="text-emerald-deep">Prevent disease</span><br />
              before it starts.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/55">
              Nutrisense-AI analyses your daily meals and predicts your personal risk for
              anemia, Type 2 diabetes, and overweight — before symptoms appear.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-full bg-emerald-deep px-6 py-3.5 text-[15px] font-semibold text-mint shadow-[0_14px_32px_-14px_rgba(15,118,110,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Create free account <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full border border-ink/10 bg-white px-6 py-3.5 text-[15px] font-semibold text-ink/70 hover:border-emerald-deep/30 hover:text-emerald-deep transition-colors"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-5 text-[12px] text-ink/40">
              <span className="flex items-center gap-1.5"><Shield className="size-3.5 text-emerald-deep" /> No real data stored</span>
              <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-amber" /> Instant results</span>
              <span className="flex items-center gap-1.5"><Flame className="size-3.5 text-coral" /> Capstone demo</span>
            </div>
          </div>

          {/* App preview card */}
          <div className="relative flex justify-center lg:justify-end animate-nv-float">
            <div className="w-full max-w-[420px] rounded-[28px] bg-white/80 p-6 shadow-[0_40px_80px_-20px_rgba(15,39,36,0.18)] ring-1 ring-ink/6 backdrop-blur-sm">

              {/* Mini header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink/35">Morning brief · Jean Jacques</div>
                  <div className="font-display text-lg font-semibold mt-0.5">Today's risk summary</div>
                </div>
                <div className="grid size-8 place-items-center rounded-xl bg-emerald-deep/10">
                  <Sparkles className="size-3.5 text-emerald-deep" />
                </div>
              </div>

              {/* Health score ring */}
              <div className="flex items-center justify-between mb-5 rounded-2xl bg-gradient-to-br from-emerald-deep/5 to-mint/20 p-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink/40">Health score</div>
                  <div className="font-display text-5xl font-semibold text-emerald-deep mt-1">84</div>
                  <div className="text-xs text-emerald-deep/70 mt-0.5">+6 vs last week</div>
                </div>
                <div className="relative size-20">
                  <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(15,118,110,0.1)" strokeWidth="8" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#0F766E" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 34 * 0.84} ${2 * Math.PI * 34}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-deep">84</div>
                </div>
              </div>

              {/* Risk cards */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Anemia",     pct: 38,  c: "#FB7185", bg: "bg-coral/8",  badge: "Monitor" },
                  { label: "Diabetes",   pct: 21,  c: "#F59E0B", bg: "bg-amber/8",  badge: "Stable"  },
                  { label: "Overweight", pct: 12,  c: "#38BDF8", bg: "bg-sky/8",    badge: "Low"     },
                ].map((r) => (
                  <div key={r.label} className={`rounded-2xl ${r.bg} p-3 ring-1 ring-ink/5`}>
                    <div className="text-[9px] uppercase tracking-wider text-ink/40">{r.label}</div>
                    <div className="font-display text-xl font-semibold mt-1" style={{ color: r.c }}>{r.pct}%</div>
                    <div className="mt-1.5 h-1 rounded-full bg-ink/8">
                      <div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.c }} />
                    </div>
                    <div className="mt-1 text-[9px] font-bold uppercase" style={{ color: r.c }}>{r.badge}</div>
                  </div>
                ))}
              </div>

              {/* Food log mini */}
              <div className="mt-4 space-y-1.5">
                {[
                  { g: "🥬", n: "Spinach", k: "23 kcal", t: "HIGH IRON", tc: "text-emerald-deep" },
                  { g: "🍗", n: "Grilled Chicken", k: "165 kcal", t: "LEAN PROTEIN", tc: "text-amber" },
                ].map((f) => (
                  <div key={f.n} className="flex items-center gap-2.5 rounded-xl bg-ink/3 px-3 py-2">
                    <span className="text-base">{f.g}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold truncate">{f.n}</div>
                      <div className="text-[10px] text-ink/40">{f.k}</div>
                    </div>
                    <span className={`text-[9px] font-bold ${f.tc}`}>{f.t}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg ring-1 ring-ink/8">
              <div className="size-7 grid place-items-center rounded-full bg-emerald-deep/10">
                <Brain className="size-3.5 text-emerald-deep" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink">XGBoost + SHAP</div>
                <div className="text-[9px] text-ink/45">Explainable AI</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-ink/5 bg-ink/[0.02]">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-12 gap-y-4 px-5 py-8 sm:px-8">
          {[
            { v: "3",    l: "diseases monitored" },
            { v: "40+",  l: "food classes recognised" },
            { v: "SHAP", l: "explainable predictions" },
            { v: "<1s",  l: "inference time" },
            { v: "NHANES", l: "training dataset" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-2xl font-bold text-emerald-deep">{s.v}</div>
              <div className="mt-0.5 text-xs text-ink/45">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-5 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-deep mb-3">What Nutrisense-AI does</div>
            <h2 className="font-display text-4xl font-bold leading-tight">Three AI systems.<br />One clear picture.</h2>
            <p className="mt-4 text-ink/55">Built with state-of-the-art computer vision, gradient boosting, and explainability tools used in clinical research.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Camera,
                color: "emerald",
                bg:    "bg-emerald-deep/8",
                tc:    "text-emerald-deep",
                title: "AI Food Recognition",
                desc:  "Upload a meal photo. Our Vision Transformer (ViT-Base/16) trained on Food-41 identifies the food and estimates portion-level nutrients in under a second.",
                tags:  ["ViT-Base/16", "Food-41 dataset", "40+ classes"],
              },
              {
                icon: Dna,
                color: "coral",
                bg:    "bg-coral/8",
                tc:    "text-coral",
                title: "Disease Risk Engine",
                desc:  "Three independent XGBoost binary classifiers — trained on NHANES population data — predict your personal risk for anemia, Type 2 diabetes, and overweight.",
                tags:  ["XGBoost", "NHANES data", "3 classifiers"],
              },
              {
                icon: Brain,
                color: "sky",
                bg:    "bg-sky/8",
                tc:    "text-sky",
                title: "SHAP Explanations",
                desc:  "Every prediction is explained with SHAP TreeExplainer. See exactly which nutrients are driving your risk — and what to eat to change it.",
                tags:  ["SHAP TreeExplainer", "Feature importance", "Actionable"],
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group rounded-3xl bg-white p-7 ring-1 ring-ink/6 hover:ring-emerald-deep/20 hover:shadow-xl transition-all duration-300">
                  <div className={`grid size-11 place-items-center rounded-2xl ${f.bg} mb-5`}>
                    <Icon className={`size-5 ${f.tc}`} />
                  </div>
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink/55">{f.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span key={t} className={`rounded-full ${f.bg} ${f.tc} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide`}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="nv-mesh py-24 px-5 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-deep mb-3">Simple by design</div>
            <h2 className="font-display text-4xl font-bold">From meal to insight in 3 steps</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative">
            {/* Connector line (desktop) */}
            <div className="absolute top-10 left-[calc(16.7%+1.5rem)] right-[calc(16.7%+1.5rem)] hidden h-px bg-gradient-to-r from-transparent via-emerald-deep/20 to-transparent md:block" />

            {[
              {
                step: "01",
                icon: Leaf,
                title: "Log your meals",
                desc:  "Search the food database, use quick-add chips, or upload a meal photo. Every food you log feeds the risk model in real time.",
              },
              {
                step: "02",
                icon: TrendingUp,
                title: "AI calculates risk",
                desc:  "Your nutrient intake is passed to three XGBoost classifiers. Risk scores update as you log, so you always see today's picture.",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Get actionable insights",
                desc:  "SHAP values explain which foods raised or lowered your risk. Personalised recommendations tell you exactly what to eat next.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative flex flex-col items-center text-center rounded-3xl bg-white/70 p-8 ring-1 ring-ink/5">
                  <div className="relative mb-5">
                    <div className="grid size-16 place-items-center rounded-full bg-emerald-deep text-mint shadow-[0_10px_24px_-10px_rgba(15,118,110,0.6)]">
                      <Icon className="size-6" />
                    </div>
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-emerald-deep ring-1 ring-emerald-deep/20">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/50">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-5 sm:px-8 border-t border-ink/5">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-deep mb-3">About the project</div>
              <h2 className="font-display text-4xl font-bold leading-tight">Built as a capstone.<br/>Designed for real impact.</h2>
              <p className="mt-5 text-ink/55 leading-relaxed">
                Nutrisense-AI is a BSc Software Engineering capstone project at African Leadership University, Rwanda.
                It combines a fine-tuned Vision Transformer for food image classification with three XGBoost risk classifiers
                trained on the NHANES population health dataset.
              </p>
              <p className="mt-3 text-ink/55 leading-relaxed">
                SHAP TreeExplainer makes every prediction interpretable — showing users not just their risk score, but the exact
                dietary features driving it, and what they can change.
              </p>
              <Link
                to="/signup"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-deep hover:underline"
              >
                Try it yourself <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "ViT-Base/16",  l: "Image model",         c: "bg-emerald-deep/8 text-emerald-deep" },
                { v: "XGBoost",      l: "Risk classifiers",    c: "bg-coral/8 text-coral"               },
                { v: "NHANES",       l: "Health dataset",      c: "bg-sky/8 text-sky"                   },
                { v: "SHAP",         l: "Explainability",      c: "bg-amber/8 text-amber"               },
                { v: "Food-41",      l: "Image dataset",       c: "bg-emerald-deep/8 text-emerald-deep" },
                { v: "React 19",     l: "Frontend",            c: "bg-sky/8 text-sky"                   },
              ].map((t) => (
                <div key={t.l} className={`rounded-2xl p-4 ring-1 ring-ink/5 ${t.c.split(" ")[0]}`}>
                  <div className={`font-display text-xl font-bold ${t.c.split(" ")[1]}`}>{t.v}</div>
                  <div className="mt-0.5 text-[11px] text-ink/45">{t.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-emerald-deep px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-mint/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-mint mb-6">
            <Sparkles className="size-3.5" /> Free to use · No credit card
          </div>
          <h2 className="font-display text-4xl font-bold text-mint leading-tight">
            Ready to take control<br />of your nutrition?
          </h2>
          <p className="mt-4 text-mint/60 leading-relaxed">
            Create your account in 60 seconds. Start logging meals and see your personalised disease risk scores immediately.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-emerald-deep shadow-[0_14px_40px_-14px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Create free account <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ink/5 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-ink/40 sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-emerald-deep" />
            <span className="font-semibold text-ink/60">Nutrisense-AI</span>
            <span>· BSc Software Engineering Capstone · ALU Rwanda</span>
          </div>
          <div className="flex items-center gap-5">
            <span>Built by JABO Jean Jacques</span>
            <Link to="/login"  className="hover:text-emerald-deep transition-colors">Sign in</Link>
            <Link to="/signup" className="hover:text-emerald-deep transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
