import React from "react";
import { cn } from "@/lib/utils";

const sections = ["Overview", "Tasks", "Timeline", "Milestones", "Files", "Notes", "People", "Communication", "Decisions", "Activity", "Giulia"];

export default function ProjectNav({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border/40 -mx-1 px-1">
      {sections.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "px-4 py-2 text-sm whitespace-nowrap transition-all border-b-2 -mb-px",
            active === s ? "border-olive text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}