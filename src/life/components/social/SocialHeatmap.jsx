import React from "react";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** SocialHeatmap — §3.5 week × day intensity grid, real timestamps only. */
export default function SocialHeatmap({ grid = [] }) {
  const max = Math.max(1, ...grid.flat());
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {DOW.map((d) => <span key={d} className="text-[9px] text-muted-foreground text-center uppercase">{d}</span>)}
      </div>
      <div className="space-y-1">
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((v, di) => (
              <div key={di} title={`${v} activity`} className="aspect-square rounded-md"
                style={{ background: v ? `hsl(var(--olive) / ${Math.min(1, 0.15 + (v / max) * 0.85)})` : "hsl(var(--muted))" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}