import { useMemo } from "react";

export function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        top: `${Math.round((i * 53) % 100)}%`,
        left: `${Math.round((i * 71) % 100)}%`,
        size: 6 + ((i * 7) % 12),
        delay: (i * 0.4) % 5,
        hue: i % 3 === 0 ? "#38BDF8" : i % 3 === 1 ? "#0F766E" : "#F59E0B",
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full blur-md animate-nv-float animate-nv-pulse"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.hue,
            opacity: 0.25,
            animationDelay: `${d.delay}s, ${d.delay / 2}s`,
          }}
        />
      ))}
    </div>
  );
}
