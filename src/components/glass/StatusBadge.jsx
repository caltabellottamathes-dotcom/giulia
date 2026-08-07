import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  active: "bg-olive/15 text-olive border-olive/20",
  pending: "bg-amber-400/10 text-amber-700 border-amber-600/20",
  waiting: "bg-blue-grey/15 text-blue-grey border-blue-grey/20",
  completed: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
  draft: "bg-stone/30 text-foreground/60 border-stone/40",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20",
  muted: "bg-muted text-muted-foreground border-border",
};

export default function StatusBadge({ variant = "muted", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}