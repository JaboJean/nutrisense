import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { FOOD_DATABASE, type FoodEntry, type LogItem } from "@/data/mock";

const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (item: LogItem) => void;
};

export function LogMealSheet({ open, onOpenChange, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodEntry | null>(null);
  const [meal, setMeal] = useState<(typeof MEAL_TIMES)[number]>("Lunch");

  const filtered = FOOD_DATABASE.filter((f) =>
    query.length < 1
      ? true
      : f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.category.toLowerCase().includes(query.toLowerCase()),
  );

  function handleAdd() {
    if (!selected) return;
    onAdd({
      id: `log-${Date.now()}`,
      name: selected.name,
      meta: `${meal} · ${selected.kcal} kcal · ${selected.iron}mg Iron`,
      tag: selected.tag,
      tone: selected.tone,
      glyph: selected.glyph,
      meal,
    });
    setSelected(null);
    setQuery("");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-ink/5">
          <SheetTitle className="font-display text-xl font-semibold text-ink">Log a Meal</SheetTitle>
          <p className="text-sm text-ink/50">Search foods and add them to today's log.</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl bg-ink/5 px-4 py-3 ring-1 ring-ink/8 focus-within:ring-emerald-deep/40 transition-shadow">
            <Search className="size-4 shrink-0 text-ink/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              placeholder="Search Spinach, Chicken, Lentils…"
              className="w-full bg-transparent text-sm placeholder:text-ink/35 focus:outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(""); setSelected(null); }}>
                <X className="size-4 text-ink/40 hover:text-ink transition-colors" />
              </button>
            )}
          </div>

          {/* Meal time selector */}
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-ink/40">Meal</div>
            <div className="flex gap-2 flex-wrap">
              {MEAL_TIMES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                    meal === m
                      ? "bg-emerald-deep text-mint shadow-[0_6px_16px_-8px_rgba(15,118,110,0.6)]"
                      : "bg-ink/5 text-ink/60 hover:bg-ink/10",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Food list */}
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-ink/40">
              {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : "All foods"}
            </div>
            <ul className="space-y-2">
              {filtered.map((food) => (
                <li key={food.id}>
                  <button
                    onClick={() => setSelected(selected?.id === food.id ? null : food)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-2xl p-3 text-left ring-1 transition-all",
                      selected?.id === food.id
                        ? "bg-emerald-deep/8 ring-emerald-deep/30"
                        : "bg-white/60 ring-ink/5 hover:ring-emerald-deep/20 hover:bg-white/80",
                    )}
                  >
                    <div className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl text-xl ring-1 ring-ink/5",
                      food.tone === "emerald" && "bg-gradient-to-br from-mint to-emerald-100",
                      food.tone === "amber"   && "bg-gradient-to-br from-amber/15 to-amber/5",
                      food.tone === "sky"     && "bg-gradient-to-br from-sky/15 to-sky/5",
                    )}>
                      {food.glyph}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-ink">{food.name}</span>
                      </div>
                      <div className="text-[11px] text-ink/50">{food.kcal} kcal · {food.iron}mg iron · {food.protein}g protein</div>
                    </div>
                    <div className={cn(
                      "shrink-0 grid size-5 place-items-center rounded-full border-2 transition-all",
                      selected?.id === food.id
                        ? "border-emerald-deep bg-emerald-deep"
                        : "border-ink/20",
                    )}>
                      {selected?.id === food.id && <Check className="size-3 text-mint" />}
                    </div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="py-8 text-center text-sm text-ink/40">
                  No foods match "{query}"
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-ink/5 bg-white/50 backdrop-blur-sm">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-deep/8 p-3 ring-1 ring-emerald-deep/20">
                <span className="text-xl">{selected.glyph}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-emerald-deep">{selected.name}</div>
                  <div className="text-[11px] text-emerald-deep/60">{meal} · {selected.kcal} kcal</div>
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="w-full rounded-2xl bg-emerald-deep py-3 text-sm font-semibold text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.7)] transition-transform active:scale-[0.98] hover:scale-[1.01]"
              >
                Add to {meal} log
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-ink/40">Select a food above to add it</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
