import React from "react";
import { spaceCapacityQuadrant } from "@/lib/domainUtils";

/**
 * QuadrantMatrix — §5.6 de vier Space × Capacity kwadranten als een
 * 2×2 matrix, met het actieve kwadrant belicht en de andere gedimd.
 * Geen twee platte balkjes, maar een echt beslissingsrooster.
 */
export default function QuadrantMatrix({ spacePct = 50, capacity = { level: "MED", pct: 50 } }) {
  const q = spaceCapacityQuadrant(spacePct, capacity.level);
  const highSpace = spacePct >= 50;
  const highCap = capacity.level === "HIGH";

  // 2×2: links = lage space, rechts = hoge space / onder = lage cap, boven = hoge cap
  const quadrants = [
    { x: "high", y: "high", label: "SOCIAL OPPORTUNITY", active: highSpace && highCap },
    { x: "low", y: "high", label: "SOCIAL LOAD HIGH", active: !highSpace && highCap },
    { x: "high", y: "low", label: "FREE / RECOVERY", active: highSpace && !highCap },
    { x: "low", y: "low", label: "PROTECT SPACE", active: !highSpace && !highCap },
  ];

  return (
    <div>
      {/* as-labels */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Capacity →</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">↓ Space</span>
      </div>

      {/* matrix */}
      <div className="grid grid-cols-2 gap-2">
        {quadrants.map((qd) => (
          <div
            key={qd.label}
            className={`rounded-xl p-3 min-h-[72px] flex flex-col justify-center border transition-all duration-300 ${
              qd.active
                ? "bg-olive/15 border-olive/50 shadow-sm"
                : "bg-muted/30 border-transparent opacity-45"
            }`}
          >
            <span className={`text-[10px] font-semibold tracking-wide leading-tight ${qd.active ? "text-foreground" : "text-muted-foreground"}`}>
              {qd.label}
            </span>
            {qd.active && (
              <span className="text-[10px] text-muted-foreground mt-1 leading-snug">{q.desc}</span>
            )}
            {qd.active && <span className="mt-2 h-1 w-6 rounded-full bg-olive" />}
          </div>
        ))}
      </div>

      {/* meter-strip onder de matrix */}
      <div className="mt-4 space-y-2.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Space</span>
            <span className="text-[10px] font-semibold tabular-nums text-foreground">{spacePct}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-olive transition-all duration-700" style={{ width: `${spacePct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Capacity</span>
            <span className="text-[10px] font-semibold tabular-nums text-foreground">{capacity.level} · {capacity.pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-powder transition-all duration-700" style={{ width: `${capacity.pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}