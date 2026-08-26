import React from "react";

/** SocialRing — light-theme progress ring (OS foreground/muted tokens),
 *  used instead of the dark-glass AnimatedRing which assumes light text. */
export default function SocialRing({ pct, size = 120, stroke = 10, color = "hsl(var(--olive))", track = "hsl(var(--muted))", label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label != null && <span className="text-foreground text-3xl font-display font-bold tabular-nums leading-none">{label}</span>}
        {sub && <span className="text-muted-foreground text-[10px] tracking-[0.2em] mt-1.5 uppercase">{sub}</span>}
      </div>
    </div>
  );
}