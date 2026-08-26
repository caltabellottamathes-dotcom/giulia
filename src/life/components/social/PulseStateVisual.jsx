import React from "react";
import { PULSE_LABEL } from "@/lib/domainUtils";

/** PulseStateVisual — §3.1 the big central pulse indicator for the Pulse tab. */
export default function PulseStateVisual({ state, mi, invitationsCount = 0, plansCount = 0 }) {
  const dots = Math.min(7, Math.max(1, mi.total));
  return (
    <div className="flex flex-col items-center text-center py-6">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Social Pulse</p>
      <p className="font-display text-3xl font-bold text-foreground mb-4">{PULSE_LABEL[state] || "Unknown"}</p>
      <div className="flex items-center gap-1.5 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < dots ? "bg-olive" : "bg-muted"}`} />
        ))}
      </div>
      <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap justify-center">
        <span>{mi.total} meaningful moments</span>
        <span>{invitationsCount} invitations</span>
        <span>{plansCount} upcoming plans</span>
      </div>
    </div>
  );
}