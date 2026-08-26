import React from "react";

/** RhythmBar — §2.6 typical vs current, so the gap is seen, not stated. */
export default function RhythmBar({ freqDays = 30, sinceDays }) {
  const ratio = Math.min(2, sinceDays === Infinity ? 2 : sinceDays / (freqDays || 30));
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Typical rhythm</p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
              {i < 3 && <span className="flex-1 h-px bg-border" />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">every ~{freqDays}d</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Current</p>
        <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${ratio > 1 ? "bg-urgent" : "bg-olive"}`} style={{ width: `${Math.min(100, ratio * 50)}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{sinceDays === Infinity ? "no contact recorded" : `${sinceDays}d since last contact`}</p>
      </div>
    </div>
  );
}