import { Apple } from "lucide-react";
import { RECOMMENDATIONS } from "@/data/mock";

export function Recommendations() {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Personalized for you</div>
          <h3 className="font-display text-2xl font-medium tracking-tight">Foods that will move your numbers</h3>
        </div>
        <button className="text-[11px] font-semibold uppercase tracking-widest text-emerald-deep hover:underline">
          View all
        </button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {RECOMMENDATIONS.map((r, i) => (
          <article
            key={r.n}
            style={{ animationDelay: `${i * 80}ms` }}
            className="animate-nv-rise group relative overflow-hidden rounded-3xl nv-glass p-5 transition-transform hover:-translate-y-1.5"
          >
            <div className="absolute -top-12 -right-10 size-32 rounded-full bg-mint/60 blur-2xl transition-opacity group-hover:opacity-100 opacity-70" />
            <div className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-mint to-white text-3xl ring-1 ring-ink/5">
              <span aria-hidden>{r.g}</span>
            </div>
            <div className="relative mt-4 flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold">{r.n}</h4>
              <span className="rounded-md bg-emerald-deep/10 px-2 py-0.5 text-[10px] font-bold text-emerald-deep">
                {r.s}
              </span>
            </div>
            <p className="relative mt-1 text-[13px] text-ink/65">{r.b}</p>
            <div className="relative mt-3 flex items-center justify-between text-[11px] text-ink/45">
              <span className="inline-flex items-center gap-1">
                <Apple className="size-3" /> {r.a}
              </span>
              <span className="font-semibold text-emerald-deep">3×/week</span>
            </div>
            <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
              <div
                className="h-full animate-nv-grow-bar rounded-full bg-gradient-to-r from-emerald-deep to-sky"
                style={{ width: `${r.s}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
