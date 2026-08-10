import React from "react";
import { cn } from "@/lib/utils";

/**
 * FoldOutCard — a card that folds open downward to reveal its body.
 * Uses the CSS grid 0fr→1fr trick so the height animates to auto without
 * measuring. The header is always visible; the body slides out below.
 */
export default function FoldOutCard({ open, onToggle, header, children, className }) {
  return (
    <div className={cn("glass rounded-2xl overflow-hidden transition-colors duration-300", open && "glass-2", className)}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3.5 flex items-center gap-3 group"
        aria-expanded={open}
      >
        {header}
        <FoldChevron open={open} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden min-h-0">
          <div className="px-4 pb-4 pt-1 border-t border-border/30">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** A chevron indicator that rotates with the open state. */
export function FoldChevron({ open, className }) {
  return (
    <span className={cn("h-6 w-6 shrink-0 rounded-full glass-1 flex items-center justify-center transition-transform duration-300 group-hover:bg-foreground/10", open && "rotate-180", className)}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={cn("transition-transform", open ? "rotate-0" : "rotate-0")}>
        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/60" />
      </svg>
    </span>
  );
}