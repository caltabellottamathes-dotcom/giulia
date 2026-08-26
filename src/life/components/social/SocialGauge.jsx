import React from "react";

/**
 * SocialGauge — §1.2 editorial progress-ring met tick-rand en knop.
 * Geen platte SVG-ring, maar een fysiek instrument:
 * buitenste tick-schaal, dikke boog met afgeronde dop, schuifknop aan het
 * uiteinde, en een groot display-getal in het centrum met sub-label.
 */
export default function SocialGauge({ pct = 0, size = 132, stroke = 10, color = "hsl(var(--olive))", track = "hsl(var(--muted-foreground) / 0.12)", label, sub, sub2 }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  // knoppositie op de boog
  const angle = (clamped / 100) * 360 - 90;
  const knobX = size / 2 + r * Math.cos((angle * Math.PI) / 180);
  const knobY = size / 2 + r * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* tick-schaal — buitenste ring met 60 markeringen */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "repeating-conic-gradient(from 0deg, hsl(var(--muted-foreground) / 0.16) 0deg 0.6deg, transparent 0.6deg 6deg)",
          mask: "radial-gradient(circle, transparent 0 62%, #000 62% 82%, transparent 82%)",
          WebkitMask: "radial-gradient(circle, transparent 0 62%, #000 62% 82%, transparent 82%)",
        }}
      />

      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>

      {/* knop aan het uiteinde van de boog */}
      <span
        className="absolute rounded-full bg-foreground ring-4 ring-background"
        style={{
          width: stroke + 2,
          height: stroke + 2,
          left: knobX - (stroke + 2) / 2,
          top: knobY - (stroke + 2) / 2,
          transition: "left 1.2s cubic-bezier(0.16,1,0.3,1), top 1.2s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      />

      {/* centrum display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label != null && (
          <span className="font-display font-bold tabular-nums leading-none text-foreground" style={{ fontSize: size * 0.26 }}>
            {label}
          </span>
        )}
        {sub && <span className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground mt-1.5">{sub}</span>}
        {sub2 && <span className="text-[10px] text-muted-foreground/70 mt-0.5">{sub2}</span>}
      </div>
    </div>
  );
}