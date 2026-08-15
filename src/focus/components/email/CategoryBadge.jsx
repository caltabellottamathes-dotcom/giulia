import React from "react";
import { cn } from "@/lib/utils";

const styles = {
  advertising: "bg-steel/15 text-steel border-steel/25",
  newsletter: "bg-powder/25 text-steel border-powder/40",
  junk: "bg-muted text-muted-foreground border-border",
  spam: "bg-destructive/15 text-destructive border-destructive/30",
  important: "bg-olive/15 text-olive border-olive/25",
};

const labels = {
  advertising: "Reclame",
  newsletter: "Nieuwsbrief",
  junk: "Onbelangrijk",
  spam: "Spam",
  important: "Belangrijk",
};

export default function CategoryBadge({ category, className }) {
  if (!category) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider whitespace-nowrap",
        styles[category] || styles.junk,
        className
      )}
    >
      {labels[category] || category}
    </span>
  );
}