import React from "react";
import { cn } from "@/lib/utils";

/**
 * WidgetShell — Klassiek Zürich tile: vlak inkt-paneel, harde 1px lijst,
 * géén blur, géén schaduw, scherpe hoeken. Licht schrift (papyrus-wit),
 * accent is het Zwitserse signaalrood via --tile-accent, zodat alle
 * widget-internes (die de var gebruiken) automatisch meegaan.
 */
const sizeMap = {
  "1x1": "min-h-[124px]",
  "2x1": "min-h-[124px]",
  "1x2": "min-h-[176px]",
  "2x2": "min-h-[176px]",
  "3x2": "min-h-[176px]",
  wide: "min-h-[176px]",
  full: "min-h-[124px]",
};

export default function WidgetShell({
  size = "1x1",
  className,
  children,
  onClick,
  interactive = false,
  style,
  zIndex,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        "--tile-accent": "hsl(var(--accent))",
        "--tile-on-accent": "hsl(var(--ivory))",
        background: "hsl(var(--charcoal))",
        ...style,
        zIndex,
      }}
      className={cn(
        "relative overflow-hidden flex flex-col h-full animate-fade-up border border-foreground text-ivory",
        sizeMap[size] || sizeMap["1x1"],
        interactive && "cursor-pointer transition-colors duration-150 hover:border-accent",
        className
      )}
    >
      {children}
    </div>
  );
}