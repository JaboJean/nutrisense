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
import { TREND } from "@/data/mock";

export function TrendChart() {
  const [period, setPeriod] = useState("7d");

  return (
    <div className="rounded-[32px] nv-glass p-7">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Weekly trend</div>
          <h4 className="font-display text-xl font-medium">Vital Score Evolution</h4>
        </div>
        <div className="flex gap-1 rounded-full bg-ink/5 p-1 text-[11px] font-medium">
          {["7d", "30d", "90d"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-full px-2.5 py-1 transition-colors",
                period === p ? "bg-white text-emerald-deep shadow-sm" : "text-ink/50 hover:text-ink",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TREND} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
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
              tick={{ fill: "#13272499", fontSize: 11, fontWeight: 500 }}
            />
            <YAxis hide domain={[60, 100]} />
            <RTooltip
              cursor={{ stroke: "#0F766E", strokeOpacity: 0.2 }}
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(15,118,110,0.15)",
                borderRadius: 14,
                fontSize: 12,
                backdropFilter: "blur(12px)",
              }}
            />
            <Area type="monotone" dataKey="iron" stroke="#38BDF8" strokeWidth={2} fill="url(#gIron)" />
            <Area type="monotone" dataKey="score" stroke="#0F766E" strokeWidth={2.5} fill="url(#gScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
