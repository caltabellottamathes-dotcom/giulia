import React from "react";
import { cn } from "@/lib/utils";
import { MATERIALS } from "@/lib/materials";

/**
 * The one shared Card/Widget component for every entity type. Always the
 * same five-part anatomy: icon-in-circle, headline, one line of support
 * copy, exactly one glanceable visual, optional status pill.
 */
export default function Widget({
  icon: Icon,
  material = "projects",
  headline,
  subtext,
  visual,
  status,
  onClick,
  className,
}) {
  const m = MATERIALS[material] || MATERIALS.projects;

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-1 rounded-2xl p-5 text-left relative flex flex-col transition-all duration-300 hover:scale-[1.015] hover:shadow-lg w-full",
        className
      )}
    >
      {status && (
        <span className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full bg-foreground/[0.06] text-muted-foreground whitespace-nowrap">
          {status}
        </span>
      )}
      <div className={cn("h-9 w-9 rounded-full bg-gradient-to-br flex items-center justify-center mb-4", m.grad)}>
        <Icon className={cn("h-4 w-4", m.icon)} />
      </div>
      <p className="text-sm font-semibold leading-tight mb-1 pr-14">{headline}</p>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 truncate">{subtext}</p>
      {visual && <div className="mt-auto">{visual}</div>}
    </button>
  );
}