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
import type { LogItem } from "@/data/mock";

type DayPoint = { d: string; kcal: number; iron: number };

function buildDailyTrend(logItems: LogItem[]): DayPoint[] {
  const byDate: Record<string, { kcal: number; iron: number }> = {};

  for (const log of logItems) {
    const date = log.logged_at ? log.logged_at.split("T")[0] : null;
    if (!date) continue;
    if (!byDate[date]) byDate[date] = { kcal: 0, iron: 0 };
    const kcalMatch = log.meta.match(/(\d+(?:\.\d+)?)\s*kcal/i);
    const ironMatch = log.meta.match(/(\d+(?:\.\d+)?)\s*mg\s*iron/i);
    if (kcalMatch) byDate[date].kcal += parseFloat(kcalMatch[1]);
    if (ironMatch) byDate[date].iron += parseFloat(ironMatch[1]);
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, v]) => ({
      d:    new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      kcal: Math.round(v.kcal),
      iron: parseFloat(v.iron.toFixed(1)),
    }));
}

export function TrendChart({ fullWidth = false, logItems = [] }: { fullWidth?: boolean; logItems?: LogItem[] }) {
  const data = buildDailyTrend(logItems);
  const uniqueDays = data.length;

  if (uniqueDays < 2) {
    return (
      <div className={cn("rounded-[32px] nv-glass p-7", fullWidth && "w-full")}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Nutrition trend</div>
          <h4 className="font-display text-xl font-medium">Vital Score Evolution</h4>
        </div>
        <div className="mt-5 flex h-60 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ink/8 text-center">
          <span className="text-3xl">📈</span>
          <div>
            <p className="text-sm font-medium text-ink/50">
              {uniqueDays === 0 ? "No trend data yet" : "Log meals on another day to see your trend"}
            </p>
            <p className="mt-0.5 text-xs text-ink/30">Log meals daily to see your score evolve over time</p>
          </div>
        </div>
      </div>
    );
  }

  const maxKcal = Math.max(...data.map((d) => d.kcal), 500);

  return (
    <div className={cn("rounded-[32px] nv-glass p-7", fullWidth && "w-full")}>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Nutrition trend · {uniqueDays} days</div>
          <h4 className="font-display text-xl font-medium">Daily Intake History</h4>
        </div>
      </div>

      <div className={cn("mt-5", fullWidth ? "h-80" : "h-60")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ left: -20, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gKcal" x1="0" y1="0" x2="0" y2="1">
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
              interval={data.length > 14 ? Math.floor(data.length / 7) : 0}
            />
            <YAxis hide domain={[0, maxKcal * 1.2]} />
            <RTooltip
              cursor={{ stroke: "#0F766E", strokeOpacity: 0.2 }}
              contentStyle={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(15,118,110,0.15)",
                borderRadius: 14,
                fontSize: 12,
                backdropFilter: "blur(12px)",
              }}
              formatter={(value: number, name: string) => [
                name === "kcal" ? `${value} kcal` : `${value} mg`,
                name === "kcal" ? "Calories" : "Iron",
              ]}
            />
            <Area type="monotone" dataKey="iron"  stroke="#38BDF8" strokeWidth={2}   fill="url(#gIron)"  isAnimationActive />
            <Area type="monotone" dataKey="kcal"  stroke="#0F766E" strokeWidth={2.5} fill="url(#gKcal)"  isAnimationActive />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-ink/45">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-emerald-deep" />
          Calories (kcal)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-sky" />
          Iron (mg)
        </span>
      </div>
    </div>
  );
}
