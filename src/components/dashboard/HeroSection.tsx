import { useMemo } from "react";
import { Droplet, Flame, Zap } from "lucide-react";
import { FOOD_DATABASE, type LogItem } from "@/data/mock";
import type { RiskScores } from "@/lib/mlApi";
import { type UserProfile, getGoals } from "@/hooks/useProfile";

type Props = {
  name?: string;
  logItems: LogItem[];
  scores?: RiskScores;
  profile?: UserProfile | null;
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

export function HeroSection({ name, logItems, scores, profile }: Props) {
  const { kcalGoal, ironGoal, proteinGoal } = getGoals(profile ?? null);

  const { kcal, iron, protein } = useMemo(() => {
    return logItems.reduce(
      (acc, log) => {
        // Parse kcal and iron directly from the meta string — works for every food
        const kcalMatch = log.meta.match(/(\d+(?:\.\d+)?)\s*kcal/i);
        const ironMatch = log.meta.match(/(\d+(?:\.\d+)?)\s*mg\s*iron/i);
        if (kcalMatch) acc.kcal += parseFloat(kcalMatch[1]);
        if (ironMatch) acc.iron += parseFloat(ironMatch[1]);
        // Protein: parse from meta first (photo-logged items store it there),
        // then fall back to the local food database
        const proteinMatch = log.meta.match(/(\d+(?:\.\d+)?)\s*g\s*protein/i);
        if (proteinMatch) {
          acc.protein += parseFloat(proteinMatch[1]);
        } else {
          const food = FOOD_DATABASE.find((f) => f.name.toLowerCase() === log.name.toLowerCase());
          if (food) acc.protein += food.protein;
        }
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
    <section className="animate-nv-rise relative">

      <div className="space-y-6">

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
            {name ?? "there"}
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
            <div className="mt-0.5 text-[11px] text-ink/35">/ {kcalGoal.toLocaleString()} goal</div>
          </div>

          <div className="rounded-2xl nv-glass p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              <Droplet className="size-3 text-sky" /> Iron
            </div>
            <div className="mt-2 font-display text-2xl font-medium tabular-nums text-ink">
              {iron > 0 ? `${iron.toFixed(1)}` : "—"}
              {iron > 0 && <span className="text-base font-normal text-ink/45"> mg</span>}
            </div>
            <div className="mt-0.5 text-[11px] text-ink/35">/ {ironGoal}mg goal</div>
          </div>

          <div className="rounded-2xl nv-glass p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              <Zap className="size-3 text-amber" /> Protein
            </div>
            <div className="mt-2 font-display text-2xl font-medium tabular-nums text-ink">
              {protein > 0 ? `${Math.round(protein)}` : "—"}
              {protein > 0 && <span className="text-base font-normal text-ink/45"> g</span>}
            </div>
            <div className="mt-0.5 text-[11px] text-ink/35">/ {proteinGoal}g goal</div>
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

    </section>
  );
}
