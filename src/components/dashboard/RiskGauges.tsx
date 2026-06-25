import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Ring } from "@/components/Ring";
import { RISKS } from "@/data/mock";

export function RiskGauges() {
  return (
    <section className="grid gap-5 sm:grid-cols-3">
      {RISKS.map((r, i) => (
        <article
          key={r.key}
          style={{ animationDelay: `${i * 80}ms` }}
          className="animate-nv-rise group relative overflow-hidden rounded-[28px] nv-glass p-6 transition-transform hover:-translate-y-1"
        >
          <div
            className="absolute -top-16 -right-16 size-44 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-60"
            style={{ background: r.color }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                {r.label}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-medium tracking-tighter text-ink tabular-nums">
                  {r.value}%
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-semibold",
                    r.trendUp ? "text-coral" : "text-emerald-deep",
                  )}
                >
                  {r.trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {r.trend}
                </span>
              </div>
            </div>
            <Ring value={r.value} size={64} stroke={6} color={r.color} track={`${r.color}22`}>
              <span className="text-[10px] font-semibold text-ink/60">{r.value}</span>
            </Ring>
          </div>
          <div className="relative mt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
              <div
                className="h-full animate-nv-grow-bar rounded-full"
                style={{ width: `${r.value}%`, background: r.color }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-ink/35">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          <p className="relative mt-4 text-[13px] leading-relaxed text-ink/65">{r.note}</p>
          <button className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-deep hover:gap-1.5 transition-all">
            Why am I seeing this? <ChevronRight className="size-3" />
          </button>
          <span
            className={cn(
              "absolute right-5 top-5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              r.badgeTone === "coral" && "bg-coral/10 text-coral",
              r.badgeTone === "amber" && "bg-amber/10 text-amber",
              r.badgeTone === "sky" && "bg-sky/10 text-sky",
            )}
          >
            {r.badge}
          </span>
        </article>
      ))}
    </section>
  );
}
