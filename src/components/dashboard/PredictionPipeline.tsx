import { Activity, Brain, Compass, Heart, Utensils } from "lucide-react";
import { Particles } from "@/components/Particles";

const STEPS = [
  { icon: <Utensils className="size-4" />, label: "Food Data", sub: "Local + global database" },
  { icon: <Activity className="size-4" />, label: "Nutrient Analysis", sub: "32 micronutrients tracked" },
  { icon: <Brain className="size-4" />, label: "AI Model", sub: "Gradient boosted + SHAP" },
  { icon: <Heart className="size-4" />, label: "Health Prediction", sub: "Risk + recommendation" },
];

export function PredictionPipeline() {
  return (
    <section className="relative overflow-hidden rounded-[36px] nv-glass p-8 sm:p-10">
      <Particles />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">AI Prediction Engine</div>
          <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            From your plate to a personalized prognosis.
          </h3>
        </div>
        <a
          href="https://jeanjabo-nutrisense-api.hf.space/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-deep/10 px-4 py-2 text-sm font-semibold text-emerald-deep ring-1 ring-emerald-deep/20 hover:bg-emerald-deep/20 transition-colors"
        >
          <Compass className="size-4" /> See live model
        </a>
      </div>

      <ol className="relative mt-8 grid gap-6 sm:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step.label} className="relative">
            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-ink/5 backdrop-blur-md transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-2 text-emerald-deep">
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-deep/10">{step.icon}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
                  Step {i + 1}
                </span>
              </div>
              <div className="mt-3 font-display text-base font-semibold">{step.label}</div>
              <div className="text-[12px] text-ink/55">{step.sub}</div>
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
  );
}
