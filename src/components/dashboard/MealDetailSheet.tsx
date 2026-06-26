import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FOOD_DATABASE, SHAP_BY_DISEASE, type LogItem } from "@/data/mock";

type Props = {
  item: LogItem | null;
  onClose: () => void;
};

const DISEASE_COLORS = {
  anemia:     { bg: "bg-coral/8",        ring: "ring-coral/20",        text: "text-coral",        bar: "#FB7185" },
  diabetes:   { bg: "bg-amber/8",        ring: "ring-amber/20",        text: "text-amber",        bar: "#F59E0B" },
  overweight: { bg: "bg-sky/8",          ring: "ring-sky/20",          text: "text-sky",          bar: "#38BDF8" },
};

function getMealImpact(food: typeof FOOD_DATABASE[0]) {
  return [
    {
      key:   "anemia",
      label: "Anemia risk",
      impact: food.iron >= 2 ? "positive" : food.iron < 0.5 ? "negative" : "neutral",
      reason: food.iron >= 2
        ? `${food.iron}mg iron — good contribution`
        : food.vitC >= 20
        ? `${food.vitC}mg Vit C — boosts iron absorption`
        : "Low iron contribution",
    },
    {
      key:   "diabetes",
      label: "Diabetes risk",
      impact: food.fiber >= 3 ? "positive" : food.kcal > 300 && food.fiber < 2 ? "negative" : "neutral",
      reason: food.fiber >= 3
        ? `${food.fiber}g fiber — slows glucose`
        : food.kcal > 300
        ? `${food.kcal} kcal, low fiber — moderate glycemic load`
        : "Neutral glycemic impact",
    },
    {
      key:   "overweight",
      label: "Overweight risk",
      impact: food.kcal < 150 ? "positive" : food.kcal > 350 ? "negative" : "neutral",
      reason: food.kcal < 150
        ? `${food.kcal} kcal — low calorie density`
        : food.kcal > 350
        ? `${food.kcal} kcal — watch portion size`
        : `${food.kcal} kcal — moderate`,
    },
  ] as const;
}

export function MealDetailSheet({ item, onClose }: Props) {
  const food = item
    ? FOOD_DATABASE.find((f) => f.name === item.name) ?? null
    : null;

  const open = item !== null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-sm flex flex-col gap-0 p-0 overflow-hidden">
        {item && (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-ink/5">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-xl text-2xl ring-1 ring-ink/5",
                  item.tone === "emerald" && "bg-gradient-to-br from-mint to-emerald-100",
                  item.tone === "amber"   && "bg-gradient-to-br from-amber/15 to-amber/5",
                  item.tone === "sky"     && "bg-gradient-to-br from-sky/15 to-sky/5",
                )}>
                  {item.glyph}
                </div>
                <div>
                  <SheetTitle className="font-display text-lg font-semibold text-ink leading-tight">
                    {item.name}
                  </SheetTitle>
                  <p className="text-xs text-ink/45 mt-0.5">{item.meta}</p>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Nutrients */}
              {food && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40 mb-3">Nutritional profile</div>
                  <div className="space-y-2.5">
                    {[
                      { l: "Calories",  v: food.kcal,          u: "kcal", max: 600,  c: "amber"   as const },
                      { l: "Protein",   v: food.protein,       u: "g",    max: 40,   c: "sky"     as const },
                      { l: "Iron",      v: food.iron,          u: "mg",   max: 18,   c: "coral"   as const },
                      { l: "Fiber",     v: food.fiber,         u: "g",    max: 20,   c: "emerald" as const },
                      { l: "Vitamin C", v: food.vitC,          u: "mg",   max: 90,   c: "sky"     as const },
                    ].map((n) => (
                      <div key={n.l} className="flex items-center gap-3">
                        <div className="w-20 text-[11px] text-ink/55 shrink-0">{n.l}</div>
                        <div className="flex-1 h-1.5 rounded-full bg-ink/6 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full animate-nv-grow-bar",
                              n.c === "amber"   && "bg-amber",
                              n.c === "sky"     && "bg-sky",
                              n.c === "coral"   && "bg-coral",
                              n.c === "emerald" && "bg-emerald-deep",
                            )}
                            style={{ width: `${Math.min(100, (n.v / n.max) * 100)}%` }}
                          />
                        </div>
                        <div className="w-16 text-right text-[11px] font-semibold tabular-nums text-ink/70">
                          {n.v} {n.u}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disease impact */}
              {food && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40 mb-3">Impact on your risk</div>
                  <div className="space-y-2.5">
                    {getMealImpact(food).map((d) => {
                      const colors = DISEASE_COLORS[d.key as keyof typeof DISEASE_COLORS];
                      return (
                        <div
                          key={d.key}
                          className={cn("flex items-start gap-3 rounded-2xl p-3.5 ring-1", colors.bg, colors.ring)}
                        >
                          <div className={cn(
                            "mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                            d.impact === "positive" && "bg-emerald-deep/15 text-emerald-deep",
                            d.impact === "negative" && "bg-coral/15 text-coral",
                            d.impact === "neutral"  && "bg-ink/10 text-ink/40",
                          )}>
                            {d.impact === "positive" ? "+" : d.impact === "negative" ? "−" : "·"}
                          </div>
                          <div className="min-w-0">
                            <div className={cn("text-[11px] font-semibold", colors.text)}>{d.label}</div>
                            <div className="text-[11px] text-ink/50 mt-0.5">{d.reason}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top SHAP features for context */}
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40 mb-3">Key risk drivers (today's diet)</div>
                <div className="space-y-2">
                  {SHAP_BY_DISEASE.anemia.slice(0, 3).map((s) => {
                    const pos = s.v >= 0;
                    const mag = Math.min(90, Math.abs(s.v) * 170);
                    return (
                      <div key={s.f} className="grid grid-cols-[120px_1fr_44px] items-center gap-2 text-xs">
                        <span className="truncate text-ink/60">{s.f}</span>
                        <div className="relative h-2 rounded-full bg-ink/5">
                          <div className="absolute inset-y-0 left-1/2 w-px bg-ink/10" />
                          <div
                            className="absolute inset-y-0 rounded-full animate-nv-grow-bar"
                            style={{
                              width: `${mag / 2}%`,
                              [pos ? "left" : "right"]: "50%",
                              background: pos ? "#10b981" : "#FB7185",
                              transformOrigin: pos ? "left" : "right",
                            }}
                          />
                        </div>
                        <span className={cn("text-right font-mono text-[10px] font-semibold tabular-nums", pos ? "text-emerald-deep" : "text-coral")}>
                          {pos ? "+" : ""}{s.v.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-ink/35 italic">SHAP values reflect population-level feature importance from your anemia risk model.</p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
