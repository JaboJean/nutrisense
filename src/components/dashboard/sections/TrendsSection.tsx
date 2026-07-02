import { Activity, Droplet, Flame, TrendingUp } from "lucide-react";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TREND_7D, type LogItem } from "@/data/mock";
import type { Prediction } from "@/lib/mlApi";

type Props = {
  prediction?: Prediction | null;
  logItems?: LogItem[];
};

export function TrendsSection({ prediction, logItems = [] }: Props) {
  const todayScore = prediction ? Math.round(100 - prediction.scores.overall) : null;
  const todayIron = logItems.reduce((acc, item) => {
    const m = item.meta.match(/(\d+(?:\.\d+)?)\s*mg\s*iron/i);
    return acc + (m ? parseFloat(m[1]) : 0);
  }, 0);
  const todayMeals = logItems.length;

  const STAT_CARDS = [
    {
      label: "Health Score",
      value: todayScore !== null ? `${todayScore}` : "—",
      unit: "pts",
      delta: todayScore !== null ? "Live · based on today's log" : "Log meals to calculate",
      positive: true,
      icon: TrendingUp,
      color: "emerald",
    },
    {
      label: "Daily Iron",
      value: todayIron > 0 ? `${todayIron.toFixed(1)}` : "—",
      unit: "mg",
      delta: todayIron > 0 ? `${((todayIron / 18) * 100).toFixed(0)}% of 18mg goal` : "No meals logged yet",
      positive: todayIron >= 9,
      icon: Activity,
      color: "coral",
    },
    {
      label: "Meals Today",
      value: `${todayMeals}`,
      unit: "logged",
      delta: todayMeals === 0 ? "Add your first meal" : todayMeals >= 3 ? "Great consistency!" : "Keep logging",
      positive: todayMeals >= 3,
      icon: Flame,
      color: "amber",
    },
    {
      label: "Hydration",
      value: "—",
      unit: "L",
      delta: "Tracking coming soon",
      positive: true,
      icon: Droplet,
      color: "sky",
    },
  ] as const;

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Progress over time</div>
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink">Nutrition Trends</h2>
        <p className="mt-2 max-w-[56ch] text-[15px] text-ink/55">
          Track how your health score and key nutrients evolve as you log meals. Switch between 7, 30, and 90 day windows.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="animate-nv-rise rounded-[24px] nv-glass p-5">
              <div className={`mb-3 grid size-9 place-items-center rounded-xl ${
                s.color === "emerald" ? "bg-emerald-deep/10" :
                s.color === "coral"   ? "bg-coral/10"   :
                s.color === "sky"     ? "bg-sky/10"     : "bg-amber/10"
              }`}>
                <Icon className={`size-4 ${
                  s.color === "emerald" ? "text-emerald-deep" :
                  s.color === "coral"   ? "text-coral"   :
                  s.color === "sky"     ? "text-sky"     : "text-amber"
                }`} />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-ink/40">{s.label}</div>
              <div className="mt-1 font-display text-3xl font-medium tabular-nums">
                {s.value}
                <span className="text-sm font-normal text-ink/40 ml-0.5">{s.unit}</span>
              </div>

              <div className={`mt-1 text-[11px] font-medium ${s.positive ? "text-emerald-deep" : "text-coral"}`}>
                {s.delta}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-width trend chart */}
      <div>
        <TrendChart fullWidth logItems={logItems} />
      </div>

      {/* Weekly breakdown table */}
      <div className="rounded-[28px] nv-glass p-6 overflow-x-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Day-by-day breakdown</div>
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink/35">Illustrative</span>
        </div>
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-ink/5">
              <th className="pb-3 text-left text-[10px] uppercase tracking-widest text-ink/40 font-medium">Day</th>
              <th className="pb-3 text-right text-[10px] uppercase tracking-widest text-ink/40 font-medium">Score</th>
              <th className="pb-3 text-right text-[10px] uppercase tracking-widest text-ink/40 font-medium">Iron (mg)</th>
              <th className="pb-3 text-right text-[10px] uppercase tracking-widest text-ink/40 font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {TREND_7D.map((row, i) => {
              const delta = i === 0 ? 0 : row.score - TREND_7D[i - 1].score;
              return (
                <tr key={row.d} className="border-b border-ink/5 last:border-0">
                  <td className="py-3 font-medium text-ink">{row.d}</td>
                  <td className="py-3 text-right tabular-nums font-semibold text-ink">{row.score}</td>
                  <td className="py-3 text-right tabular-nums text-ink/60">{row.iron}</td>
                  <td className="py-3 text-right">
                    {i === 0 ? (
                      <span className="text-ink/30">—</span>
                    ) : (
                      <span className={`text-xs font-semibold ${delta >= 0 ? "text-emerald-deep" : "text-coral"}`}>
                        {delta > 0 ? "+" : ""}{delta}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
