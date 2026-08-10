import React from "react";
import { cn } from "@/lib/utils";
import { statusBlockColor, isTaskDone, parseContext } from "@/lib/projectStatus";

/**
 * StatusGrid — the signature information-design graphic for projects.
 * One solid block per task, colored by its status, read in under a second:
 * the distribution of colour tells you the state of the whole subonderdeel
 * without a single number. Hover any block for the task title.
 *
 * `columns` controls how the blocks wrap into a tidy mosaic.
 */
export default function StatusGrid({ tasks, columns = "auto", size = "md", className }) {
  if (!tasks.length) return null;
  const heights = { xs: "h-1.5", sm: "h-2", md: "h-2.5", lg: "h-3.5" };
  const widths = { xs: "w-1.5", sm: "w-2", md: "w-2.5", lg: "w-3.5" };
  const gridClass = columns === "auto" ? "flex flex-wrap gap-[3px]" : cn("grid gap-[3px]", columns);

  return (
    <div className={cn(gridClass, className)}>
      {tasks.map((t, i) => (
        <div
          key={t.id || i}
          title={`${t.title} — ${t.status}`}
          className={cn(
            "rounded-[3px] transition-all duration-300 hover:scale-110 hover:z-10",
            heights[size] || heights.md,
            widths[size] || widths.md,
            statusBlockColor[t.status] || "bg-foreground/15"
          )}
        />
      ))}
    </div>
  );
}

/** A compact legend for the StatusGrid colour vocabulary. */
export function StatusLegend({ tasks }) {
  const counts = {};
  tasks.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
  const order = ["klaar", "actief", "gepland", "wacht", "te_specifieren", "gepauzeerd"];
  const present = order.filter((s) => counts[s]);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {present.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={cn("h-2 w-2 rounded-[2px]", statusBlockColor[s])} />
          {s === "klaar" ? "Klaar" : s === "actief" ? "Actief" : s === "gepland" ? "Gepland" : s === "wacht" ? "Wacht op" : s === "te_specifieren" ? "Te specificeren" : "Gepauzeerd"}
          <span className="tabular-nums font-medium text-foreground/70">{counts[s]}</span>
        </span>
      ))}
    </div>
  );
}