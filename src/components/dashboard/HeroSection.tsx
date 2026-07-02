import { useMemo } from "react";
import { Droplet, Flame, Loader2, Zap } from "lucide-react";
import { Ring } from "@/components/Ring";
import { Particles } from "@/components/Particles";
import { FOOD_DATABASE, type LogItem } from "@/data/mock";
import type { RiskScores } from "@/lib/mlApi";

type Props = {
  score: number;
  name?: string;
  logItems: LogItem[];
  scores?: RiskScores;
  predicting?: boolean;
  hasLogs?: boolean;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDateLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const RISK_LABELS: Record<string, string> = {
  anemia: "Anemia",
  diabetes: "Type 2 Diabetes",
  overweight: "Overweight",
};

export function HeroSection({ score, name, logItems, scores, predicting, hasLogs }: Props) {
  const { kcal, iron, protein } = useMemo(() => {
    return logItems.reduce(
      (acc, log) => {
        // Parse kcal and iron directly from the meta string — works for every food
        const kcalMatch = log.meta.match(/(\d+(?:\.\d+)?)\s*kcal/i);
        const ironMatch = log.meta.match(/(\d+(?:\.\d+)?)\s*mg\s*iron/i);
        if (kcalMatch) acc.kcal += parseFloat(kcalMatch[1]);
        if (ironMatch) acc.iron += parseFloat(ironMatch[1]);
        // Protein is not stored in meta, look it up from the database
        const food = FOOD_DATABASE.find((f) => f.name.toLowerCase() === log.name.toLowerCase());
        if (food) acc.protein += food.protein;
        return acc;
      },
      { kcal: 0, iron: 0, protein: 0 },
    );
  }, [logItems]);

  const highestRisk = scores
    ? (Object.entries(scores) as [string, number][])
        .filter(([k]) => k !== "overall")
        .sort(([, a], [, b]) => b - a)[0]
    : null;

  return (
    <section className="animate-nv-rise relative grid items-center gap-10 md:grid-cols-5">

      {/* ── Left: greeting + stats ── */}
      <div className="md:col-span-3 space-y-6">

        {/* Date pill */}
        <div className="inline-flex items-center gap-2 rounded-full nv-glass px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-deep">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-deep opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-deep" />
          </span>
          {getDateLabel()}
        </div>

        {/* Personalized greeting */}
        <div>
          <p className="text-sm text-ink/45 font-medium">{getGreeting()}</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {name ?? "Jean Jacques"}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/55">
            {logItems.length === 0
              ? "No meals logged yet. Add your first meal to see your nutrition score update in real time."
              : `${logItems.length} meal${logItems.length !== 1 ? "s" : ""} logged today — your risk scores are live.`}
          </p>
        </div>

        {/* Live stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl nv-glass p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              <Flame className="size-3 text-coral" /> Calories
            </div>
            <div className="mt-2 font-display text-2xl font-medium tabular-nums text-ink">
              {kcal > 0 ? kcal.toLocaleString() : "—"}
            </div>
            <div className="mt-0.5 text-[11px] text-ink/35">/ 2,200 goal</div>
          </div>

          <div className="rounded-2xl nv-glass p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              <Droplet className="size-3 text-sky" /> Iron
            </div>
            <div className="mt-2 font-display text-2xl font-medium tabular-nums text-ink">
              {iron > 0 ? `${iron.toFixed(1)}` : "—"}
              {iron > 0 && <span className="text-base font-normal text-ink/45"> mg</span>}
            </div>
            <div className="mt-0.5 text-[11px] text-ink/35">/ 18mg goal</div>
          </div>

          <div className="rounded-2xl nv-glass p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              <Zap className="size-3 text-amber" /> Protein
            </div>
            <div className="mt-2 font-display text-2xl font-medium tabular-nums text-ink">
              {protein > 0 ? `${Math.round(protein)}` : "—"}
              {protein > 0 && <span className="text-base font-normal text-ink/45"> g</span>}
            </div>
            <div className="mt-0.5 text-[11px] text-ink/35">/ 50g goal</div>
          </div>
        </div>

        {/* Highest risk alert — only shows if ML has run and risk > 35% */}
        {highestRisk && highestRisk[1] > 35 && (
          <div className="flex items-center gap-3 rounded-2xl bg-coral/8 px-4 py-3.5 ring-1 ring-coral/20">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-coral/15">
              <span className="text-[11px] font-bold text-coral">{highestRisk[1]}%</span>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink">
                {RISK_LABELS[highestRisk[0]]} risk needs attention
              </div>
              <div className="text-[11px] text-ink/50">
                See Risk Engine tab for what's driving it
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: health score ring ── */}
      <div className="md:col-span-2 relative grid place-items-center">
        <Particles />
        <div className="absolute inset-x-12 top-8 -z-10 h-[220px] rounded-full bg-mint/60 blur-3xl" />
        <Ring value={hasLogs ? score : 0} label="Nutrition Score">
          {hasLogs ? (
            <span className="font-display text-7xl font-medium tracking-tighter text-ink tabular-nums">
              {score}
            </span>
          ) : (
            <span className="font-display text-5xl font-medium tracking-tighter text-ink/25">—</span>
          )}
          <span className="mt-1 text-xs font-medium text-ink/45">
            {hasLogs ? "out of 100" : "log a meal"}
          </span>
          {predicting && (
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-deep">
              <Loader2 className="size-3 animate-spin" /> Updating…
            </span>
          )}
        </Ring>
      </div>
    </section>
  );
}
