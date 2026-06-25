import { Apple } from "lucide-react";
import { FoodLog } from "@/components/dashboard/FoodLog";
import { cn } from "@/lib/utils";
import { FOOD_DATABASE, RECOMMENDATIONS, type LogItem } from "@/data/mock";

type Props = {
  logItems: LogItem[];
  onAdd: (item: LogItem) => void;
  onRemove: (id: string) => void;
  onOpenLogger: () => void;
};

export function FoodLabSection({ logItems, onAdd, onRemove, onOpenLogger }: Props) {
  return (
    <div className="space-y-10">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Dietary intake tracking</div>
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink">Food Lab</h2>
        <p className="mt-2 max-w-[56ch] text-[15px] text-ink/55">
          Log every meal using Rwandan staples. Your nutrient profile updates in real time and feeds the risk model.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Food log (wider column) */}
        <div className="lg:col-span-3">
          <FoodLog logItems={logItems} onAdd={onAdd} onRemove={onRemove} onOpenLogger={onOpenLogger} />
        </div>

        {/* Food database browser */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-[28px] nv-glass p-6">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40 mb-1">Rwandan food database</div>
            <h4 className="font-display text-lg font-semibold text-ink mb-4">Nutrient reference</h4>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {FOOD_DATABASE.map((food) => (
                <div key={food.id} className="flex items-center gap-3 rounded-2xl bg-white/50 p-3 ring-1 ring-ink/5">
                  <span className="text-xl shrink-0">{food.glyph}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-ink truncate">{food.name}</span>
                      <span className="text-[10px] text-ink/35 truncate hidden sm:inline">{food.nameKin}</span>
                    </div>
                    <div className="flex gap-3 mt-0.5 text-[10px] text-ink/45">
                      <span>{food.kcal} kcal</span>
                      <span className="text-coral font-medium">{food.iron}mg Fe</span>
                      <span>{food.protein}g pro</span>
                    </div>
                  </div>
                  <span className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    food.tone === "emerald" && "bg-emerald-deep/10 text-emerald-deep",
                    food.tone === "amber"   && "bg-amber/10 text-amber",
                    food.tone === "sky"     && "bg-sky/10 text-sky",
                  )}>
                    {food.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Based on your deficits</div>
          <h3 className="font-display text-2xl font-medium tracking-tight">Recommended additions</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {RECOMMENDATIONS.map((r, i) => (
            <article
              key={r.n}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-nv-rise group relative overflow-hidden rounded-3xl nv-glass p-5 transition-transform hover:-translate-y-1.5"
            >
              <div className="absolute -top-12 -right-10 size-32 rounded-full bg-mint/60 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-mint to-white text-3xl ring-1 ring-ink/5">
                <span aria-hidden>{r.g}</span>
              </div>
              <div className="relative mt-4 flex items-center justify-between">
                <h4 className="font-display text-lg font-semibold">{r.n}</h4>
                <span className="rounded-md bg-emerald-deep/10 px-2 py-0.5 text-[10px] font-bold text-emerald-deep">{r.s}</span>
              </div>
              <p className="relative mt-1 text-[13px] text-ink/65">{r.b}</p>
              <div className="relative mt-3 flex items-center justify-between text-[11px] text-ink/45">
                <span className="inline-flex items-center gap-1"><Apple className="size-3" /> {r.a}</span>
                <span className="font-semibold text-emerald-deep">3×/week</span>
              </div>
              <button
                onClick={() => {
                  const food = FOOD_DATABASE.find((f) => f.name === r.n);
                  if (food) onAdd({ id: `log-${Date.now()}`, name: food.name, meta: `Recommended · ${food.kcal} kcal · ${food.iron}mg Iron`, tag: food.tag, tone: food.tone, glyph: food.glyph, meal: "Lunch" });
                }}
                className="relative mt-3 w-full rounded-xl bg-emerald-deep/8 py-2 text-[11px] font-semibold text-emerald-deep hover:bg-emerald-deep/15 transition-colors"
              >
                + Add to log
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
