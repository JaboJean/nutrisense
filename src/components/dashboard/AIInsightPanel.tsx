import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { SHAP_BY_DISEASE } from "@/data/mock";

const shap = SHAP_BY_DISEASE.anemia;

export function AIInsightPanel() {
  return (
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
        "Your iron intake has been below recommended levels for 5 consecutive days."
      </h3>
      <p className="relative mt-3 max-w-[58ch] text-[15px] leading-relaxed text-mint/75">
        To keep your anemia risk from creeping up, add 150g of <span className="text-mint font-semibold">spinach</span> or
        a side of <span className="text-mint font-semibold">lentils</span> at lunch. Pair with a citrus or tomato
        source to boost vitamin C absorption.
      </p>

      {/* SHAP explainability */}
      <div className="relative mt-7 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
        <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-mint/60">
          <span>What influences your anemia risk</span>
          <span>SHAP · explainable AI</span>
        </div>
        <div className="space-y-3">
          {shap.map((s) => {
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
                <span className={cn("text-right font-mono text-[11px] font-semibold tabular-nums", pos ? "text-emerald-200" : "text-coral")}>
                  {pos ? "+" : ""}{s.v.toFixed(2)}
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
            <span className="font-display text-xl font-medium">+150g Spinach</span>
            <span className="text-xs text-mint/60">at lunch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
