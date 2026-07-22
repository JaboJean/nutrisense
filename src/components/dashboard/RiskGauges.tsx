import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Ring } from "@/components/Ring";
import { RISKS } from "@/data/mock";
import type { RiskScores, ShapEntry } from "@/lib/mlApi";

function ShapBar({ shap }: { shap: { f: string; v: number }[] }) {
  return (
    <div className="animate-nv-expand mt-4 space-y-2.5 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.18em] opacity-50">
        <span>What's driving your risk</span>
        <span className="flex items-center gap-2">
          <span className="text-emerald-300">↓ lowers</span>
          <span className="text-rose-300">↑ raises</span>
        </span>
      </div>
      {shap.map((s) => {
        const pos = s.v >= 0;
        const mag = Math.min(90, Math.abs(s.v) * 180);
        return (
          <div key={s.f} className="grid grid-cols-[120px_1fr_48px] items-center gap-2 text-[11px]">
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
              {pos ? "↓" : "↑"} {Math.abs(s.v).toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

type Props = {
  scores?:     RiskScores;
  shap?:       { anemia: ShapEntry[]; diabetes: ShapEntry[]; overweight: ShapEntry[] };
  predicting?: boolean;
};

function generateNote(key: string, score: number | undefined, shap: ShapEntry[] | undefined): string {
  if (score === undefined) {
    return RISKS.find((r) => r.key === key)?.note ?? "";
  }
  const topBad  = shap?.filter((s) => s.v < 0).sort((a, b) => a.v - b.v)[0];
  const topGood = shap?.filter((s) => s.v > 0).sort((a, b) => b.v - a.v)[0];
  const badF  = topBad  ? topBad.f.toLowerCase()  : null;
  const goodF = topGood ? topGood.f.toLowerCase() : null;

  if (key === "anemia") {
    if (score < 15) return `Iron levels are well managed${goodF ? ` — ${goodF} is a top protective factor` : ""}. Keep up your current diet.`;
    if (score < 40) return `Iron intake needs a boost. Add Ibishyimbo or Isombe to today's meals. Expand below to see the SHAP driver breakdown.`;
    return `High anemia risk detected. Prioritise iron-rich foods like Isombe and Doodo at every meal. Expand below to see the SHAP driver breakdown.`;
  }
  if (key === "diabetes") {
    if (score < 15) return `Glycemic load is low${goodF ? ` — ${goodF} is stabilising glucose` : ""}. Good fiber balance today.`;
    if (score < 40) return `Moderate glycemic load. Consider swapping maize Ugali for Sorghum Ugali. Expand below to see what's driving it.`;
    return `Elevated glucose risk. Reduce refined starches and increase fiber-rich legumes. Expand below to see the SHAP driver breakdown.`;
  }
  if (key === "overweight") {
    if (score < 20) return `Caloric profile is well balanced${goodF ? ` — ${goodF} is a protective factor` : ""}. Keep it up.`;
    if (score < 45) return `Caloric density is a contributing factor. Balance energy-dense meals with leafy greens like Doodo. Expand to see drivers.`;
    return `High caloric load detected. Reduce portion size or pair with low-calorie vegetables. Expand below to see the SHAP driver breakdown.`;
  }
  return RISKS.find((r) => r.key === key)?.note ?? "";
}

function badgeForScore(score: number): { badge: string; badgeTone: "coral" | "amber" | "sky" } {
  if (score >= 60) return { badge: "HIGH",    badgeTone: "coral" };
  if (score >= 35) return { badge: "MONITOR", badgeTone: "amber" };
  return               { badge: "LOW",     badgeTone: "sky"   };
}

export function RiskGauges({ scores, shap, predicting }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!scores) {
    return (
      <section className="grid gap-5 sm:grid-cols-3">
        {RISKS.map((r) => (
          <div key={r.key} className="flex flex-col items-center justify-center gap-3 rounded-[28px] nv-glass p-8 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-ink/5">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">{r.label}</div>
              <div className="mt-1 font-display text-2xl font-medium text-ink/20">—%</div>
              <p className="mt-2 text-[12px] text-ink/35">Log meals to see your {r.label.toLowerCase().replace(/ risk$/i, "")} risk</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {predicting && (
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-deep/10 px-3 py-1 text-[10px] font-semibold text-emerald-deep ring-1 ring-emerald-deep/15">
            <Loader2 className="size-3 animate-spin" /> AI recalculating…
          </span>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-3">
      {RISKS.map((r, i) => {
        const isOpen  = expanded === r.key;
        const dynVal  = scores?.[r.key as keyof RiskScores];
        const value   = dynVal !== undefined ? dynVal : r.value;
        const dynBadge = dynVal !== undefined ? badgeForScore(dynVal) : { badge: r.badge, badgeTone: r.badgeTone };
        const shapData = shap?.[r.key as keyof typeof shap] ?? [];
        const trendUp  = dynVal !== undefined ? dynVal > 40 : r.trendUp;
        const trendText = dynVal !== undefined
          ? dynVal >= 60 ? "High risk" : dynVal >= 35 ? "Needs attention" : "Stable"
          : r.trend;
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
                    {trendText}
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

            <p className="relative mt-4 text-[13px] leading-relaxed text-ink/65">
              {generateNote(r.key, dynVal, shap?.[r.key as keyof typeof shap])}
            </p>

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
      </div>
    </section>
  );
}
