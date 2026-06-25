import { Brain, Info } from "lucide-react";
import { RiskGauges } from "@/components/dashboard/RiskGauges";
import { PredictionPipeline } from "@/components/dashboard/PredictionPipeline";
import { SHAP_BY_DISEASE, RISKS } from "@/data/mock";
import { cn } from "@/lib/utils";

function DiseaseSummaryCard({ risk }: { risk: typeof RISKS[0] }) {
  const shap = SHAP_BY_DISEASE[risk.key] ?? [];
  const topPositive = shap.filter((s) => s.v > 0).sort((a, b) => b.v - a.v)[0];
  const topNegative = shap.filter((s) => s.v < 0).sort((a, b) => a.v - b.v)[0];

  return (
    <div className="rounded-[24px] nv-glass p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="grid size-10 place-items-center rounded-2xl"
          style={{ background: `${risk.color}22` }}
        >
          <Brain className="size-4" style={{ color: risk.color }} />
        </div>
        <div>
          <div className="font-display text-base font-semibold text-ink">{risk.label}</div>
          <div className="text-[11px] text-ink/45">{risk.value}% risk · {risk.badge}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-deep/5 p-3 ring-1 ring-emerald-deep/10">
          <div className="text-[9px] uppercase tracking-widest text-emerald-deep/60 mb-1">Top protector</div>
          <div className="text-[12px] font-semibold text-emerald-deep">{topPositive?.f ?? "—"}</div>
          <div className="text-[10px] text-emerald-deep/50">{topPositive?.label}</div>
        </div>
        <div className="rounded-xl bg-coral/5 p-3 ring-1 ring-coral/10">
          <div className="text-[9px] uppercase tracking-widest text-coral/60 mb-1">Top risk factor</div>
          <div className="text-[12px] font-semibold text-coral">{topNegative?.f ?? "—"}</div>
          <div className="text-[10px] text-coral/50">{topNegative?.label}</div>
        </div>
      </div>

      <div className="space-y-2">
        {shap.map((s) => {
          const pos = s.v >= 0;
          const mag = Math.min(90, Math.abs(s.v) * 180);
          return (
            <div key={s.f} className="grid grid-cols-[1fr_80px_40px] items-center gap-2 text-[11px]">
              <span className="truncate text-ink/65">{s.f}</span>
              <div className="relative h-2 rounded-full bg-ink/5">
                <div className="absolute inset-y-0 left-1/2 w-px bg-ink/10" />
                <div
                  className="absolute inset-y-0 rounded-full animate-nv-grow-bar"
                  style={{
                    width: `${mag / 2}%`,
                    [pos ? "left" : "right"]: "50%",
                    background: pos ? "#0F766E" : "#FB7185",
                    transformOrigin: pos ? "left" : "right",
                  }}
                />
              </div>
              <span className={cn("text-right font-mono text-[10px] font-semibold tabular-nums", pos ? "text-emerald-deep" : "text-coral")}>
                {pos ? "+" : ""}{s.v.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RiskEngineSection() {
  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">XGBoost · Multi-output classifier</div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink">Disease Risk Engine</h2>
          <p className="mt-2 max-w-[56ch] text-[15px] text-ink/55">
            Your personalised risk scores, recalculated from today's food log. Click any card to see the feature breakdown.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-deep/8 px-3 py-1.5 text-[11px] font-semibold text-emerald-deep ring-1 ring-emerald-deep/15">
          <Info className="size-3.5" />
          Powered by SHAP
        </div>
      </div>

      <RiskGauges />

      <div>
        <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-ink/40">Feature breakdown per disease</div>
        <div className="grid gap-5 md:grid-cols-3">
          {RISKS.map((r) => (
            <DiseaseSummaryCard key={r.key} risk={r} />
          ))}
        </div>
      </div>

      <PredictionPipeline />
    </div>
  );
}
