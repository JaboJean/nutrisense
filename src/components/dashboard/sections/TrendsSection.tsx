import { Activity, Droplet, Flame, TrendingUp } from "lucide-react";
import { TrendChart } from "@/components/dashboard/TrendChart";
import type { LogItem } from "@/data/mock";
import type { Prediction } from "@/lib/mlApi";
import { type UserProfile, getGoals } from "@/hooks/useProfile";

interface DayRow {
  d: string;
  meals: number;
  kcal: number;
  iron: number;
  protein: number;
}

function buildDailyRows(logItems: LogItem[]): DayRow[] {
  const byDate: Record<string, { kcal: number; iron: number; protein: number; meals: number }> = {};
  for (const log of logItems) {
    const date = log.logged_at ? log.logged_at.split("T")[0] : null;
    if (!date) continue;
    if (!byDate[date]) byDate[date] = { kcal: 0, iron: 0, protein: 0, meals: 0 };
    byDate[date].meals++;
    const kcalMatch    = log.meta.match(/(\d+(?:\.\d+)?)\s*kcal/i);
    const ironMatch    = log.meta.match(/(\d+(?:\.\d+)?)\s*mg\s*iron/i);
    const proteinMatch = log.meta.match(/(\d+(?:\.\d+)?)\s*g\s*protein/i);
    if (kcalMatch)    byDate[date].kcal    += parseFloat(kcalMatch[1]);
    if (ironMatch)    byDate[date].iron    += parseFloat(ironMatch[1]);
    if (proteinMatch) byDate[date].protein += parseFloat(proteinMatch[1]);
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, v]) => ({
      d: new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      meals:   v.meals,
      kcal:    Math.round(v.kcal),
      iron:    parseFloat(v.iron.toFixed(1)),
      protein: Math.round(v.protein),
    }));
}

type Props = {
  prediction?: Prediction | null;
  logItems?: LogItem[];
  profile?: UserProfile | null;
};

export function TrendsSection({ prediction, logItems = [], profile }: Props) {
  const { ironGoal } = getGoals(profile ?? null);
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
      delta: todayIron > 0 ? `${((todayIron / ironGoal) * 100).toFixed(0)}% of ${ironGoal}mg goal` : "No meals logged yet",
      positive: todayIron >= ironGoal / 2,
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
          Track how your health score and key nutrients evolve as you log meals each day.
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

      {/* Day-by-day breakdown table */}
      {(() => {
        const rows = buildDailyRows(logItems);
        return (
          <div className="rounded-[28px] nv-glass p-6 overflow-x-auto">
            <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-ink/40">Day-by-day breakdown</div>
            {rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink/35">
                No meal history yet — log meals across multiple days to see the breakdown.
              </p>
            ) : (
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-ink/5">
                    <th className="pb-3 text-left   text-[10px] uppercase tracking-widest text-ink/40 font-medium">Day</th>
                    <th className="pb-3 text-right  text-[10px] uppercase tracking-widest text-ink/40 font-medium">Meals</th>
                    <th className="pb-3 text-right  text-[10px] uppercase tracking-widest text-ink/40 font-medium">Calories</th>
                    <th className="pb-3 text-right  text-[10px] uppercase tracking-widest text-ink/40 font-medium">Iron (mg)</th>
                    <th className="pb-3 text-right  text-[10px] uppercase tracking-widest text-ink/40 font-medium">Protein (g)</th>
                    <th className="pb-3 text-right  text-[10px] uppercase tracking-widest text-ink/40 font-medium">Iron Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const ironDelta = i === 0 ? null : parseFloat((row.iron - rows[i - 1].iron).toFixed(1));
                    return (
                      <tr key={row.d} className="border-b border-ink/5 last:border-0">
                        <td className="py-3 font-medium text-ink">{row.d}</td>
                        <td className="py-3 text-right tabular-nums text-ink/60">{row.meals}</td>
                        <td className="py-3 text-right tabular-nums text-ink">{row.kcal > 0 ? row.kcal.toLocaleString() : "—"}</td>
                        <td className="py-3 text-right tabular-nums text-ink/60">{row.iron > 0 ? row.iron : "—"}</td>
                        <td className="py-3 text-right tabular-nums text-ink/60">{row.protein > 0 ? row.protein : "—"}</td>
                        <td className="py-3 text-right">
                          {ironDelta === null ? (
                            <span className="text-ink/30">—</span>
                          ) : (
                            <span className={`text-xs font-semibold ${ironDelta >= 0 ? "text-emerald-deep" : "text-coral"}`}>
                              {ironDelta > 0 ? "+" : ""}{ironDelta}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })()}
    </div>
  );
}
