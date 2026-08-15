import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  active: "bg-olive/15 text-olive border-olive/25",
  pending: "bg-powder/25 text-steel border-powder/40",
  waiting: "bg-steel/15 text-steel border-steel/25",
  completed: "bg-olive/15 text-olive border-olive/25",
  draft: "bg-steel/10 text-steel border-steel/20",
  urgent: "bg-urgent text-charcoal border-urgent/40",
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