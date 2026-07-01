import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Ring } from "@/components/Ring";
import { RISKS, SHAP_BY_DISEASE } from "@/data/mock";
import type { RiskScores, ShapEntry } from "@/lib/mlApi";

function ShapBar({ shap }: { shap: { f: string; v: number }[] }) {
  return (
    <div className="animate-nv-expand mt-4 space-y-2.5 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.18em] opacity-50">
        <span>Feature influence</span>
        <span>SHAP</span>
      </div>
      {shap.map((s) => {
        const pos = s.v >= 0;
        const mag = Math.min(90, Math.abs(s.v) * 180);
        return (
          <div key={s.f} className="grid grid-cols-[120px_1fr_40px] items-center gap-2 text-[11px]">
            <span className="truncate opacity-75">{s.f}</span>
            <div className="relative h-2 rounded-full bg-white/10">
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
              <div
                className="absolute inset-y-0 rounded-full animate-nv-grow-bar"
                style={{
                  width: `${mag / 2}%`,
                  [pos ? "left" : "right"]: "50%",
                  background: pos ? "#34D399" : "#FB7185",
                  transformOrigin: pos ? "left" : "right",
                }}
              />
            </div>
            <span className={cn("text-right font-mono text-[10px] font-semibold tabular-nums", pos ? "text-emerald-300" : "text-rose-300")}>
              {pos ? "+" : ""}{s.v.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

type Props = {
  scores?: RiskScores;
  shap?:   { anemia: ShapEntry[]; diabetes: ShapEntry[]; overweight: ShapEntry[] };
};

function badgeForScore(score: number): { badge: string; badgeTone: "coral" | "amber" | "sky" } {
  if (score >= 60) return { badge: "HIGH",    badgeTone: "coral" };
  if (score >= 35) return { badge: "MONITOR", badgeTone: "amber" };
  return               { badge: "LOW",     badgeTone: "sky"   };
}

export function RiskGauges({ scores, shap }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="grid gap-5 sm:grid-cols-3">
      {RISKS.map((r, i) => {
        const isOpen  = expanded === r.key;
        const dynVal  = scores?.[r.key as keyof RiskScores];
        const value   = dynVal !== undefined ? dynVal : r.value;
        const dynBadge = dynVal !== undefined ? badgeForScore(dynVal) : { badge: r.badge, badgeTone: r.badgeTone };
        const shapData = shap?.[r.key as keyof typeof shap] ?? SHAP_BY_DISEASE[r.key] ?? [];
        const trendUp  = dynVal !== undefined ? dynVal > 40 : r.trendUp;
        return (
          <article
            key={r.key}
            style={{ animationDelay: `${i * 80}ms` }}
            className={cn(
              "animate-nv-rise group relative overflow-hidden rounded-[28px] nv-glass p-6 transition-all duration-300 cursor-pointer select-none",
              isOpen ? "ring-2 ring-emerald-deep/30 shadow-lg" : "hover:-translate-y-1",
            )}
            onClick={() => setExpanded(isOpen ? null : r.key)}
          >
            <div
              className="absolute -top-16 -right-16 size-44 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-60"
              style={{ background: r.color }}
            />

            {/* Header row */}
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{r.label}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-medium tracking-tighter text-ink tabular-nums">{value}%</span>
                  <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", trendUp ? "text-coral" : "text-emerald-deep")}>
                    {trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {r.trend}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Ring value={value} size={64} stroke={6} color={r.color} track={`${r.color}22`}>
                  <span className="text-[10px] font-semibold text-ink/60">{value}</span>
                </Ring>
                <span className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  dynBadge.badgeTone === "coral" && "bg-coral/10 text-coral",
                  dynBadge.badgeTone === "amber" && "bg-amber/10 text-amber",
                  dynBadge.badgeTone === "sky"   && "bg-sky/10 text-sky",
                )}>
                  {dynBadge.badge}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative mt-5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                <div className="h-full animate-nv-grow-bar rounded-full" style={{ width: `${value}%`, background: r.color }} />
              </div>
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-ink/35">
                <span>Low</span><span>High</span>
              </div>
            </div>

            <p className="relative mt-4 text-[13px] leading-relaxed text-ink/65">{r.note}</p>

            {/* Expand toggle */}
            <button className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-deep transition-all">
              {isOpen ? <><ChevronDown className="size-3" /> Hide detail</> : <><ChevronRight className="size-3" /> Why am I seeing this?</>}
            </button>

            {/* SHAP detail (expanded) */}
            {isOpen && (
              <div className="relative">
                <ShapBar shap={shapData} />
              </div>
            )}

          </article>
        );
      })}
    </section>
  );
}
