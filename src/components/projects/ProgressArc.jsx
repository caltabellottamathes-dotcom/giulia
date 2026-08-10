import React, { useEffect, useState } from "react";

/**
 * ProgressArc — bespoke radial infographic. A hand-drawn data shape:
 * an animated arc that fills to the project's completion %, with the
 * number counting up on mount. The big number IS the graphic.
 */
export default function ProgressArc({ value = 0, size = 188, stroke = 18 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [v, setV] = useState(0);
  const [offset, setOffset] = useState(c);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 1100;
    const animate = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(eased * value);
      setV(cur);
      setOffset(c - (cur / 100) * c);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, c]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} opacity={0.5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--olive))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 60ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-start">
          <span className="text-6xl font-display font-bold leading-none tabular-nums">{v}</span>
          <span className="text-2xl text-muted-foreground font-display font-semibold mt-1">%</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mt-1.5 font-semibold">Klaar</span>
      </div>
    </div>
  );
}