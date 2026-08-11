import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import WidgetPhotoHeader from "./WidgetPhotoHeader";

/**
 * StatCard — compact expand/collapse row that lives inside the stat-set
 * widget tile. Subtle foreground tint (not a second glass layer) so it reads
 * as a row within the tile. First card open by default.
 */
function StatCard({ data, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = Math.max(0, Math.min(100, Math.round(data.pct || 0)));

  return (
    <div
      className="rounded-2xl bg-foreground/[0.04] border border-foreground/10 text-foreground transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ padding: open ? "16px" : "12px 14px" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3"
      >
        <span className="rounded-full bg-foreground text-background px-2.5 py-0.5 text-[12px] font-medium tracking-tight whitespace-nowrap">
          {data.chip}
        </span>
        <span
          className={cn(
            "ml-auto h-7 w-7 rounded-full border border-foreground/20 bg-foreground/5 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open && "rotate-45"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pt-4" style={{ opacity: open ? 1 : 0, transition: "opacity 0.4s ease" }}>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-display font-semibold tabular-nums tracking-tight leading-none">
                {data.value}
              </span>
              <span className="text-sm font-light text-muted-foreground">{data.unit}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-foreground/15 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-olive transition-[width] duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: open ? `${pct}%` : "0%" }}
              />
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">
                <strong className="font-medium text-foreground">{data.goalStrong}</strong> {data.goal}
              </span>
              <span
                className={cn(
                  "ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                  data.trendUp ? "border-olive/40 text-olive" : "border-destructive/40 text-destructive"
                )}
              >
                {data.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {data.trend}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatCardSet({ cards, image, label, count, onClick }) {
  return (
    <div className="glass-2 rounded-3xl overflow-hidden text-foreground w-full max-w-[360px] mx-auto">
      <WidgetPhotoHeader image={image} label={label} count={count} onClick={onClick} />
      <div className="p-3 flex flex-col gap-2">
        {cards.map((c, i) => (
          <StatCard key={i} data={c} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}