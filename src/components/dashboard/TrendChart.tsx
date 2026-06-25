import { useState } from "react";
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
import { TREND_7D, TREND_30D, TREND_90D } from "@/data/mock";

const PERIODS = [
  { key: "7d",  label: "7d",  data: TREND_7D,  domain: [60, 100] as [number,number] },
  { key: "30d", label: "30d", data: TREND_30D, domain: [55, 95]  as [number,number] },
  { key: "90d", label: "90d", data: TREND_90D, domain: [50, 95]  as [number,number] },
] as const;

export function TrendChart({ fullWidth = false }: { fullWidth?: boolean }) {
  const [periodKey, setPeriodKey] = useState<"7d" | "30d" | "90d">("7d");
  const period = PERIODS.find((p) => p.key === periodKey)!;

  return (
    <div className={cn("rounded-[32px] nv-glass p-7", fullWidth && "w-full")}>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Nutrition trend</div>
          <h4 className="font-display text-xl font-medium">Vital Score Evolution</h4>
        </div>
        <div className="flex gap-1 rounded-full bg-ink/5 p-1 text-[11px] font-medium">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriodKey(p.key)}
              className={cn(
                "rounded-full px-2.5 py-1 transition-all duration-200",
                periodKey === p.key
                  ? "bg-white text-emerald-deep shadow-sm"
                  : "text-ink/50 hover:text-ink",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("mt-5", fullWidth ? "h-80" : "h-60")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={periodKey}
            data={period.data}
            margin={{ left: -20, right: 8, top: 8, bottom: 0 }}
          >
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
              interval={periodKey === "30d" ? 4 : 0}
              tick={{ fill: "#13272499", fontSize: 11, fontWeight: 500 }}
            />
            <YAxis hide domain={period.domain} />
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
                name === "score" ? `${value} pts` : `${value} mg`,
                name === "score" ? "Health Score" : "Iron",
              ]}
            />
            <Area type="monotone" dataKey="iron"  stroke="#38BDF8" strokeWidth={2}   fill="url(#gIron)"  isAnimationActive />
            <Area type="monotone" dataKey="score" stroke="#0F766E" strokeWidth={2.5} fill="url(#gScore)" isAnimationActive />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-ink/45">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-emerald-deep" />
          Health Score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-sky" />
          Iron (mg)
        </span>
      </div>
    </div>
  );
}
