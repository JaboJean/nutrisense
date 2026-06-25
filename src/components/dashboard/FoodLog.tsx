import { Mic, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOODS, RWANDAN_FOODS } from "@/data/mock";

export function FoodLog() {
  return (
    <div className="space-y-5">
      {/* Search / Log entry */}
      <div className="rounded-3xl nv-glass p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-base font-semibold">Log a meal</h4>
          <button className="grid size-8 place-items-center rounded-full bg-emerald-deep text-mint hover:scale-105 transition-transform">
            <Mic className="size-3.5" />
          </button>
        </div>
        <label className="mt-3 flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2.5 ring-1 ring-ink/5 focus-within:ring-emerald-deep/40">
          <Search className="size-4 text-ink/40" />
          <input
            placeholder="Search Isombe, Matoke, Ubugali…"
            className="w-full bg-transparent text-sm placeholder:text-ink/35 focus:outline-none"
          />
          <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 text-[10px] font-mono text-ink/40">⌘K</kbd>
        </label>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {RWANDAN_FOODS.map((f) => (
            <button
              key={f}
              className="rounded-full bg-mint/40 px-2.5 py-1 text-[11px] font-medium text-emerald-deep hover:bg-mint transition-colors"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Recent entries */}
      <div className="rounded-3xl nv-glass p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-base font-semibold">Today</h4>
          <button className="text-[11px] font-semibold uppercase tracking-widest text-emerald-deep">
            Full log
          </button>
        </div>
        <ul className="mt-3 space-y-2.5">
          {FOODS.map((f, i) => (
            <li
              key={f.name}
              style={{ animationDelay: `${i * 70}ms` }}
              className="animate-nv-rise flex items-center gap-3 rounded-2xl bg-white/55 p-3 ring-1 ring-ink/5 transition-transform hover:-translate-y-0.5"
            >
              <div
                className={cn(
                  "grid size-12 place-items-center rounded-xl text-2xl ring-1 ring-ink/5",
                  f.tone === "emerald" && "bg-gradient-to-br from-mint to-emerald-100",
                  f.tone === "amber" && "bg-gradient-to-br from-amber/15 to-amber/5",
                  f.tone === "sky" && "bg-gradient-to-br from-sky/15 to-sky/5",
                )}
              >
                <span aria-hidden>{f.glyph}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink">{f.name}</div>
                <div className="truncate text-[11px] text-ink/50">{f.meta}</div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  f.tone === "emerald" && "bg-emerald-deep/10 text-emerald-deep",
                  f.tone === "amber" && "bg-amber/10 text-amber",
                  f.tone === "sky" && "bg-sky/10 text-sky",
                )}
              >
                {f.tag}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weekly target */}
      <div className="rounded-3xl bg-sky/8 p-5 ring-1 ring-sky/15">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky">Weekly Nutrient Target</div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-display text-3xl font-medium tabular-nums">12,400</span>
          <span className="mb-1 text-sm text-ink/45">/ 15,000 kcal</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sky/15">
          <div className="h-full w-4/5 animate-nv-grow-bar rounded-full bg-sky" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { l: "Iron", v: "9.4mg", c: "coral" as const },
            { l: "Fiber", v: "28g", c: "emerald" as const },
            { l: "Sugar", v: "42g", c: "amber" as const },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-white/60 p-2.5 ring-1 ring-ink/5">
              <div
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-widest",
                  s.c === "coral" && "text-coral",
                  s.c === "emerald" && "text-emerald-deep",
                  s.c === "amber" && "text-amber",
                )}
              >
                {s.l}
              </div>
              <div className="font-display text-base font-medium tabular-nums">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
