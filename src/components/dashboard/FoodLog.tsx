import { useRef, useState } from "react";
import { Mic, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUICK_ADD_FOODS, FOOD_DATABASE, type LogItem } from "@/data/mock";

function FoodImage({ item }: { item: LogItem }) {
  const [failed, setFailed] = useState(false);
  const dbImg = FOOD_DATABASE.find(
    (f) => f.name.toLowerCase() === item.name.toLowerCase(),
  )?.img;
  const src = (!failed && item.img) ? item.img : dbImg;
  if (src) {
    return (
      <img
        src={src}
        alt={item.name}
        className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-ink/5"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={cn(
      "grid size-12 shrink-0 place-items-center rounded-xl text-2xl ring-1 ring-ink/5",
      item.tone === "emerald" && "bg-gradient-to-br from-mint to-emerald-100",
      item.tone === "amber"   && "bg-gradient-to-br from-amber/15 to-amber/5",
      item.tone === "sky"     && "bg-gradient-to-br from-sky/15 to-sky/5",
    )}>
      <span aria-hidden>{item.glyph}</span>
    </div>
  );
}

type Props = {
  logItems: LogItem[];
  onAdd: (item: LogItem) => void;
  onRemove: (id: string) => void;
  onOpenLogger: () => void;
  onMealClick?: (item: LogItem) => void;
};

export function FoodLog({ logItems, onAdd, onRemove, onOpenLogger, onMealClick }: Props) {
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = query.length > 0
    ? FOOD_DATABASE.filter((f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.category.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 5)
    : [];

  function handleChipAdd(name: string) {
    const food = FOOD_DATABASE.find((f) => f.name === name);
    if (!food) return;
    onAdd({
      id: `log-${Date.now()}`,
      name: food.name,
      meta: `Quick add · ${food.kcal} kcal · ${food.iron}mg Iron`,
      tag: food.tag,
      tone: food.tone,
      glyph: food.glyph,
      img: food.img,
      meal: "Snack",
    });
  }

  function handleSuggestionAdd(food: typeof FOOD_DATABASE[0]) {
    onAdd({
      id: `log-${Date.now()}`,
      name: food.name,
      meta: `Quick add · ${food.kcal} kcal · ${food.iron}mg Iron`,
      tag: food.tag,
      tone: food.tone,
      glyph: food.glyph,
      img: food.img,
      meal: "Snack",
    });
    setQuery("");
  }

  function handleRemove(id: string) {
    setRemoving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onRemove(id);
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 280);
  }

  const { totalKcal, totalIron, totalFiber, totalProtein } = logItems.reduce(
    (acc, item) => {
      const kcalMatch = item.meta.match(/(\d+(?:\.\d+)?)\s*kcal/i);
      const ironMatch = item.meta.match(/(\d+(?:\.\d+)?)\s*mg\s*iron/i);
      if (kcalMatch) acc.totalKcal  += parseFloat(kcalMatch[1]);
      if (ironMatch) acc.totalIron  += parseFloat(ironMatch[1]);
      const food = FOOD_DATABASE.find((f) => f.name.toLowerCase() === item.name.toLowerCase());
      if (food) {
        acc.totalFiber   += food.fiber;
        acc.totalProtein += food.protein;
      }
      return acc;
    },
    { totalKcal: 0, totalIron: 0, totalFiber: 0, totalProtein: 0 },
  );

  return (
    <div className="space-y-5">
      {/* Search / Log entry */}
      <div className="rounded-3xl nv-glass p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-base font-semibold">Log a meal</h4>
          <button
            onClick={onOpenLogger}
            className="grid size-8 place-items-center rounded-full bg-emerald-deep text-mint hover:scale-105 transition-transform shadow-[0_6px_16px_-8px_rgba(15,118,110,0.7)]"
            title="Full food logger"
          >
            <Mic className="size-3.5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <label className="flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2.5 ring-1 ring-ink/5 focus-within:ring-emerald-deep/40 transition-shadow">
            <Search className="size-4 shrink-0 text-ink/40" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Ugali, Ibishyimbo, Isombe…"
              className="w-full bg-transparent text-sm placeholder:text-ink/35 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="size-4 text-ink/30 hover:text-ink/60 transition-colors" />
              </button>
            )}
          </label>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-ink/8">
              {suggestions.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSuggestionAdd(food)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-mint/30 transition-colors"
                >
                  <span className="text-lg">{food.glyph}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink">{food.name}</div>
                    <div className="text-[11px] text-ink/45">{food.kcal} kcal · {food.iron}mg iron</div>
                  </div>
                  <span className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    food.tone === "emerald" && "bg-emerald-deep/10 text-emerald-deep",
                    food.tone === "amber"   && "bg-amber/10 text-amber",
                    food.tone === "sky"     && "bg-sky/10 text-sky",
                  )}>
                    {food.tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick-add chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_ADD_FOODS.map((f: string) => (
            <button
              key={f}
              onClick={() => handleChipAdd(f)}
              className="rounded-full bg-mint/40 px-2.5 py-1 text-[11px] font-medium text-emerald-deep hover:bg-mint hover:scale-105 transition-all active:scale-95"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Today's log */}
      <div className="rounded-3xl nv-glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-base font-semibold">Today</h4>
            {logItems.length > 0 && (
              <p className="text-[11px] text-ink/45">{logItems.length} item{logItems.length !== 1 ? "s" : ""} · {totalKcal.toLocaleString()} kcal total</p>
            )}
          </div>
          <button
            onClick={onOpenLogger}
            className="text-[11px] font-semibold uppercase tracking-widest text-emerald-deep hover:underline"
          >
            + Add
          </button>
        </div>

        {logItems.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-4 text-center">
            <span className="text-3xl">🍽️</span>
            <p className="text-sm text-ink/40">Nothing logged yet. Add your first meal above.</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {logItems.map((f, i) => (
              <li
                key={f.id}
                style={{ animationDelay: `${i * 50}ms` }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl bg-white/55 p-3 ring-1 ring-ink/5 cursor-pointer hover:ring-emerald-deep/20 hover:bg-white/80 transition-all",
                  removing.has(f.id) ? "animate-nv-slide-out" : "animate-nv-slide-in",
                )}
                onClick={() => onMealClick?.(f)}
              >
                <FoodImage item={f} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-ink">{f.name}</div>
                  <div className="truncate text-[11px] text-ink/50">{f.meta}</div>
                </div>
                <span className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  f.tone === "emerald" && "bg-emerald-deep/10 text-emerald-deep",
                  f.tone === "amber"   && "bg-amber/10 text-amber",
                  f.tone === "sky"     && "bg-sky/10 text-sky",
                )}>
                  {f.tag}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(f.id); }}
                  className="ml-1 grid size-6 shrink-0 place-items-center rounded-full text-ink/25 hover:bg-red-50 hover:text-red-400 transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Today's nutrient summary */}
      <div className="rounded-3xl bg-sky/8 p-5 ring-1 ring-sky/15">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky">Today's Intake</div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-display text-3xl font-medium tabular-nums">
            {totalKcal > 0 ? totalKcal.toLocaleString() : "0"}
          </span>
          <span className="mb-1 text-sm text-ink/45">/ 2,200 kcal goal</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sky/15">
          <div
            className="h-full rounded-full bg-sky transition-all duration-700"
            style={{ width: `${Math.min(100, (totalKcal / 2200) * 100)}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { l: "Iron",    v: totalIron    > 0 ? `${totalIron.toFixed(1)}mg`    : "—", c: "coral"   as const },
            { l: "Fiber",   v: totalFiber   > 0 ? `${totalFiber.toFixed(1)}g`    : "—", c: "emerald" as const },
            { l: "Protein", v: totalProtein > 0 ? `${Math.round(totalProtein)}g` : "—", c: "amber"   as const },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-white/60 p-2.5 ring-1 ring-ink/5">
              <div className={cn(
                "text-[10px] font-semibold uppercase tracking-widest",
                s.c === "coral"   && "text-coral",
                s.c === "emerald" && "text-emerald-deep",
                s.c === "amber"   && "text-amber",
              )}>
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
