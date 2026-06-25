import { Activity, Droplet, Flame, TrendingUp } from "lucide-react";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TREND_7D } from "@/data/mock";

const latest = TREND_7D[TREND_7D.length - 1];
const prev = TREND_7D[0];
const scoreDelta = latest.score - prev.score;
const ironDelta = latest.iron - prev.iron;

const STAT_CARDS = [
  {
    label: "Health Score",
    value: latest.score,
    unit: "pts",
    delta: `${scoreDelta > 0 ? "+" : ""}${scoreDelta} this week`,
    positive: scoreDelta >= 0,
    icon: TrendingUp,
    color: "emerald",
  },
  {
    label: "Daily Iron",
    value: latest.iron,
    unit: "mg",
    delta: `${ironDelta > 0 ? "+" : ""}${ironDelta}mg vs Mon`,
    positive: ironDelta >= 0,
    icon: Activity,
    color: "coral",
  },
  {
    label: "Avg Hydration",
    value: 1.8,
    unit: "L",
    delta: "Optimal range",
    positive: true,
    icon: Droplet,
    color: "sky",
  },
  {
    label: "7-day Streak",
    value: 7,
    unit: "days",
    delta: "Keep it up!",
    positive: true,
    icon: Flame,
    color: "amber",
  },
] as const;

export function TrendsSection() {
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
      <TrendChart fullWidth />

      {/* Weekly breakdown table */}
      <div className="rounded-[28px] nv-glass p-6 overflow-x-auto">
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40 mb-4">Day-by-day breakdown</div>
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
