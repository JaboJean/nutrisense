import { useEffect, useState, type ReactNode } from "react";

export function Ring({
  value,
  size = 320,
  stroke = 14,
  color = "var(--emerald-deep)",
  track = "color-mix(in oklab, var(--emerald-deep) 10%, transparent)",
  label,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);

  useEffect(() => {
    const id = setTimeout(() => setOffset(c - (c * value) / 100), 80);
    return () => clearTimeout(id);
  }, [c, value]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
        {label && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-deep/60">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
