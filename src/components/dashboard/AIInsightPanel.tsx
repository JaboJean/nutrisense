import { Brain, Salad } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prediction, ShapEntry } from "@/lib/mlApi";

type Props = { prediction?: Prediction | null };

type DiseaseKey = "anemia" | "diabetes" | "overweight";

const DISEASE_LABELS: Record<DiseaseKey, string> = {
  anemia:     "Anemia",
  diabetes:   "Type 2 Diabetes",
  overweight: "Overweight",
};

const DISEASE_INSIGHTS: Record<DiseaseKey, {
  title: (score: number) => string;
  body:  (shap: ShapEntry[]) => string;
  fix:   string;
}> = {
  anemia: {
    title: (s) => `Your anemia risk is at ${s}% — iron intake is the main driver.`,
    body:  (_shap) =>
      "Add iron-rich staples — ibishyimbo, isombe, or doodo — paired with a citrus source to boost absorption. See the SHAP breakdown below for the key dietary drivers.",
    fix: "+1 serving Ibishyimbo or Isombe",
  },
  diabetes: {
    title: (s) => `Your diabetes risk is at ${s}% — glycemic load is elevated.`,
    body:  (shap) => {
      const topBad = shap.filter((e) => e.v < 0).sort((a, b) => a.v - b.v)[0];
      return `${topBad ? `${topBad.f} is the main risk factor. ` : ""}Switch to sorghum ugali or amashaza peas, which have lower glycemic impact than refined starches.`;
    },
    fix: "Swap maize ugali → sorghum ugali",
  },
  overweight: {
    title: (s) => `Your overweight risk is at ${s}% — caloric balance needs attention.`,
    body:  (_shap) =>
      "Total caloric load is higher than your target. Replace one starchy side dish with a low-calorie green like doodo or sweet potato leaves — same volume, far fewer calories.",
    fix:  "Replace one starchy side with leafy greens",
  },
};


export function AIInsightPanel({ prediction }: Props) {
  const now = new Date();
  const timeLabel = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (!prediction) {
    return (
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-deep p-8 text-mint shadow-[0_30px_80px_-40px_rgba(15,118,110,0.7)]">
        <div className="absolute -top-24 -right-12 size-72 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-12 size-72 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-mint/10 ring-1 ring-mint/20">
            <Brain className="size-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-mint/60">AI Insight</div>
            <div className="text-sm font-medium">Waiting for data · {timeLabel}</div>
          </div>
        </div>
        <div className="relative mt-10 flex flex-col items-center gap-4 py-6 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-mint/10 ring-1 ring-mint/20">
            <Salad className="size-7 text-mint/60" />
          </div>
          <div>
            <h3 className="font-display text-xl font-medium text-mint">No meals logged yet</h3>
            <p className="mt-2 max-w-[36ch] text-sm text-mint/55 leading-relaxed">
              Log your first meal above and the AI will instantly analyse your personal disease risk with SHAP explanations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pick the highest-risk disease from live prediction
  const scores = prediction.scores;
  const topKey: DiseaseKey = (Object.entries(scores)
    .filter(([k]) => k !== "overall")
    .sort(([, a], [, b]) => (b as number) - (a as number))[0][0] as DiseaseKey);

  const topScore = scores[topKey];
  const shapData = prediction.shap?.[topKey] ?? [];

  const insight   = DISEASE_INSIGHTS[topKey];
  const reduction = Math.round(topScore * 0.13);
  const isLive    = true;

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-emerald-deep p-8 text-mint shadow-[0_30px_80px_-40px_rgba(15,118,110,0.7)]">
      <div className="absolute -top-24 -right-12 size-72 rounded-full bg-sky/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-12 size-72 rounded-full bg-emerald-300/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-mint/10 backdrop-blur-sm ring-1 ring-mint/20">
          <Brain className="size-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-mint/60">AI Insight</div>
          <div className="text-sm font-medium">
            {isLive ? `Live · ${DISEASE_LABELS[topKey]}` : `Baseline · ${timeLabel}`}
          </div>
        </div>
        {isLive && (
          <span className="ml-auto rounded-full bg-mint/10 px-2.5 py-0.5 text-[10px] font-semibold text-mint ring-1 ring-mint/20">
            LIVE
          </span>
        )}
      </div>

      {/* Insight text */}
      <h3 className="relative mt-6 font-display text-2xl font-medium leading-snug">
        "{insight.title(topScore)}"
      </h3>
      <p className="relative mt-3 max-w-[58ch] text-[15px] leading-relaxed text-mint/75">
        {insight.body(shapData)}
      </p>

      {/* SHAP explainability */}
      <div className="relative mt-7 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
        <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-mint/60">
          <span>What's driving your {DISEASE_LABELS[topKey].toLowerCase()} risk</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-300">↓ lowers</span>
            <span className="text-coral">↑ raises</span>
          </span>
        </div>
        <div className="space-y-3">
          {shapData.map((s) => {
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
                <span className={cn(
                  "text-right font-mono text-[11px] font-semibold tabular-nums",
                  pos ? "text-emerald-200" : "text-coral",
                )}>
                  {pos ? "↓" : "↑"} {Math.abs(s.v).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action cards */}
      <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="text-[10px] uppercase tracking-widest text-mint/50">Potential reduction</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-display text-xl font-medium tabular-nums">−{reduction}%</span>
            <span className="text-xs text-mint/60">if you act today</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="text-[10px] uppercase tracking-widest text-mint/50">Suggested action</div>
          <div className="mt-1">
            <span className="font-display text-sm font-medium leading-snug">{insight.fix}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
