import React, { useEffect, useState } from "react";

/** ProgressDial — bespoke radial infographic. The percentage is the hero:
 *  oversized display type inside a hand-drawn arc that animates on load. */
export default function ProgressDial({ value = 0, size = 176, stroke = 14 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(r);
  }, [value]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (shown / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} opacity="0.45" />
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
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-end">
          <span className="text-[56px] font-display font-bold leading-none tabular-nums tracking-tight">{value}</span>
          <span className="text-lg text-muted-foreground mb-1.5 ml-0.5">%</span>
        </div>
        <span className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground mt-1.5">voltooid</span>
      </div>
    </div>
  );
}