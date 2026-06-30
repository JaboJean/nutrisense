import { useState } from "react";
import { RECOMMENDATIONS } from "@/data/mock";

export function Recommendations() {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Personalized for you</div>
          <h3 className="font-display text-2xl font-medium tracking-tight">Foods that will move your numbers</h3>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {RECOMMENDATIONS.map((r, i) => (
          <FoodCard key={r.n} r={r} delay={i * 80} />
        ))}
      </div>
    </section>
  );
}

function FoodCard({ r, delay }: { r: typeof RECOMMENDATIONS[0]; delay: number }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article
      style={{ animationDelay: `${delay}ms` }}
      className="animate-nv-rise group relative overflow-hidden rounded-3xl nv-glass transition-transform hover:-translate-y-1.5 flex flex-col"
    >
      {/* Food photo */}
      <div className="relative h-36 w-full overflow-hidden rounded-t-3xl bg-gradient-to-br from-mint to-emerald-100 shrink-0">
        {!imgFailed ? (
          <img
            src={r.img}
            alt={r.n}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            <span aria-hidden>{r.g}</span>
          </div>
        )}
        {/* Score badge over image */}
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
          {r.s}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-1 p-5 flex-1">
        <h4 className="font-display text-lg font-semibold leading-tight">{r.n}</h4>
        <p className="text-[13px] text-ink/65">{r.b}</p>
        <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-ink/45">
          <span>{r.a}</span>
          <span className="font-semibold text-emerald-deep">3×/week</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
          <div
            className="h-full animate-nv-grow-bar rounded-full bg-gradient-to-r from-emerald-deep to-sky"
            style={{ width: `${r.s}%` }}
          />
        </div>
      </div>
    </article>
  );
}
