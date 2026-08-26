import React from "react";

/**
 * RhythmWave — §2.6 typisch ritme vs huidige stand, als een golf.
 * Een zachte sine-golf toont het persoonlijke ritme (every ~N days);
 * een schuifmarkering geeft aan waar "nu" is op die golf.
 * Als de marker voorbij de piek komt (overdue) → urgent-geel.
 */
export default function RhythmWave({ freqDays = 30, sinceDays = Infinity }) {
  const ratio = sinceDays === Infinity ? 2 : sinceDays / (freqDays || 30);
  const overdue = ratio > 1;
  const markerPct = Math.min(100, (ratio / 2) * 100); // 1 ritme = 50%, 2x = 100%

  // golf-pad
  const w = 240, h = 56, amp = 14;
  const points = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = h / 2 + Math.sin((i / steps) * Math.PI * 4) * amp;
    points.push(`${x},${y}`);
  }
  const waveColor = overdue ? "hsl(var(--urgent))" : "hsl(var(--olive))";

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Typical rhythm</p>
        <div className="relative w-full overflow-hidden rounded-lg bg-muted/30 py-1">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none">
            {/* golf-achtergrond (gedimd) */}
            <polyline
              fill="none"
              stroke="hsl(var(--muted-foreground) / 0.2)"
              strokeWidth={2}
              points={points.join(" ")}
            />
            {/* gevulde golf tot marker */}
            <polyline
              fill="none"
              stroke={waveColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              points={points.slice(0, Math.floor((markerPct / 100) * steps) + 1).join(" ")}
            />
            {/* marker */}
            <circle
              cx={(markerPct / 100) * w}
              cy={h / 2 + Math.sin((markerPct / 100) * Math.PI * 4) * amp}
              r={5}
              fill={waveColor}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          </svg>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">every ~{freqDays} days</p>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Now</span>
        <span className={`text-sm font-display font-bold tabular-nums ${overdue ? "text-urgent" : "text-foreground"}`}>
          {sinceDays === Infinity ? "no contact" : `${sinceDays}d`}
        </span>
      </div>
    </div>
  );
}