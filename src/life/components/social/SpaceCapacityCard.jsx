import React from "react";
import { spaceCapacityQuadrant } from "@/lib/domainUtils";

/** SpaceCapacityCard — §5.6 the four space×capacity quadrants, shown as
 *  context, never a judgment. */
export default function SpaceCapacityCard({ spacePct, capacity }) {
  const q = spaceCapacityQuadrant(spacePct, capacity.level);
  return (
    <div className="rounded-2xl bg-muted/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Space vs Capacity</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">SPACE</p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-olive rounded-full" style={{ width: `${spacePct}%` }} /></div>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">CAPACITY · {capacity.level}</p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-powder rounded-full" style={{ width: `${capacity.pct}%` }} /></div>
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground">{q.label}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{q.desc}</p>
    </div>
  );
}