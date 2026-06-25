import { Droplet, Heart, Wind } from "lucide-react";
import { Ring } from "@/components/Ring";
import { Particles } from "@/components/Particles";

export function HeroSection({ score }: { score: number }) {
  return (
    <section className="animate-nv-rise relative grid items-center gap-12 md:grid-cols-2">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full nv-glass px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-deep">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-deep opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-deep" />
          </span>
          Morning Brief · Jean Jacques
        </div>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-[56px]">
          Understand your nutrition. <br />
          <span className="text-emerald-deep">Prevent disease</span> before it starts.
        </h1>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-ink/65">
          AI-powered nutrition intelligence built around your real eating habits. NutriVision watches the
          patterns most clinicians miss — and tells you, gently, what to change next.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-deep/8 px-4 py-2 text-sm font-medium text-emerald-deep ring-1 ring-emerald-deep/15">
            <Heart className="size-4" /> Metabolic Phase: Recovery
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sky/10 px-4 py-2 text-sm font-medium text-sky ring-1 ring-sky/20">
            <Droplet className="size-4" /> Hydration: Optimal
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber/10 px-4 py-2 text-sm font-medium text-amber ring-1 ring-amber/20">
            <Wind className="size-4" /> Iron: Low 5d
          </span>
        </div>
      </div>

      <div className="relative grid place-items-center">
        <Particles />
        <div className="absolute inset-x-12 top-12 -z-10 h-[280px] rounded-full bg-mint/60 blur-3xl" />
        <Ring value={score} label="Health Score">
          <span className="font-display text-7xl font-medium tracking-tighter text-ink tabular-nums">{score}</span>
          <span className="mt-1 text-xs font-medium text-ink/50">+6 vs last week</span>
        </Ring>
        <div className="absolute -right-2 top-6 hidden rounded-2xl nv-glass px-3 py-2 text-xs md:block">
          <div className="text-[10px] uppercase tracking-widest text-ink/40">Calories</div>
          <div className="font-display text-lg font-medium tabular-nums">1,840</div>
        </div>
        <div className="absolute -left-2 bottom-8 hidden rounded-2xl nv-glass px-3 py-2 text-xs md:block">
          <div className="text-[10px] uppercase tracking-widest text-ink/40">Protein</div>
          <div className="font-display text-lg font-medium tabular-nums">86g</div>
        </div>
      </div>
    </section>
  );
}
