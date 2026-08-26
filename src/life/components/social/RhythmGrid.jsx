import React from "react";

const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const DOW_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * RhythmGrid — §3.5 week × dag intensiteit, als een kalender-heatmap
 * met afgeronde cellen, week-labels links, vandaag gemarkeerd met een ring.
 * Olive-palet oplopend van 0 → max.
 */
export default function RhythmGrid({ grid = [] }) {
  const max = Math.max(1, ...grid.flat());
  const today = new Date();
  const todayDow = today.getDay() === 0 ? 6 : today.getDay() - 1;
  // jongste week = laatste rij → Markeer vandaag in die rij
  const isToday = (wi, di) => wi === grid.length - 1 && di === todayDow;

  const cellColor = (v) => {
    if (!v) return "hsl(var(--muted-foreground) / 0.06)";
    const t = 0.18 + (v / max) * 0.82;
    return `hsl(var(--olive) / ${t})`;
  };

  return (
    <div>
      {/* dag-header */}
      <div className="grid grid-cols-[24px_repeat(7,1fr)] gap-1.5 mb-2">
        <span />
        {DOW.map((d, i) => (
          <span key={i} className="text-[9px] text-muted-foreground text-center font-medium uppercase tracking-wide">{d}</span>
        ))}
      </div>

      {/* weken */}
      <div className="space-y-1.5">
        {grid.map((week, wi) => {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - ((grid.length - 1 - wi) * 7 + todayDow));
          return (
            <div key={wi} className="grid grid-cols-[24px_repeat(7,1fr)] gap-1.5 items-center">
              <span className="text-[9px] text-muted-foreground tabular-nums text-right pr-0.5">
                {weekStart.getDate()}
              </span>
              {week.map((v, di) => (
                <div
                  key={di}
                  title={`${DOW_FULL[di]} · ${v} activity`}
                  className="aspect-square rounded-[7px] relative transition-transform hover:scale-110"
                  style={{
                    background: cellColor(v),
                    boxShadow: isToday(wi, di) ? `0 0 0 1.5px hsl(var(--foreground))` : "none",
                  }}
                >
                  {v > 0 && v >= max && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/85">
                      {v}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* schaal-legenda */}
      <div className="mt-4 flex items-center gap-1.5 justify-end">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide mr-1">Less</span>
        {[0.1, 0.3, 0.55, 0.8, 1].map((t, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: `hsl(var(--olive) / ${t})` }} />
        ))}
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide ml-1">More</span>
      </div>
    </div>
  );
}