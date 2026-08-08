import React from "react";
import { cn } from "@/lib/utils";

/**
 * WidgetShell — a SOLID editorial tile hosting every dashboard widget.
 * Full-opacity GIULIA palette: Metal / Clay Creek / Dark Sand / Blue Ridge Sky /
 * Ancient Marble / Storm. No translucency — solid color blocks with a solid
 * palette accent strip along the top edge. The tile sets a base text color so
 * widget internals inherit readable contrast; `--tile-accent` /
 * `--tile-on-accent` drive the header chip + strip.
 */
const sizeMap = {
  "1x1": "min-h-[168px]",
  "2x1": "min-h-[168px]",
  "1x2": "min-h-[372px]",
  "2x2": "min-h-[372px]",
  "3x2": "min-h-[372px]",
  wide: "min-h-[372px]",
  full: "min-h-[168px]",
};

const radiusMap = {
  soft: "rounded-[20px]",
  medium: "rounded-[24px]",
  large: "rounded-[28px]",
  xl: "rounded-[32px]",
};

const tileMap = {
  // light tiles — dark text
  card:        { cls: "bg-stone text-charcoal border border-charcoal/10",     accent: "hsl(var(--sand))",     on: "hsl(var(--ivory))" },
  translucent: { cls: "bg-blue-grey text-charcoal border border-charcoal/10",  accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))" },
  marble:      { cls: "bg-stone text-charcoal border border-charcoal/10",     accent: "hsl(var(--sand))",     on: "hsl(var(--ivory))" },
  sky:         { cls: "bg-blue-grey text-charcoal border border-charcoal/10", accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))" },
  storm:       { cls: "bg-ivory text-charcoal border border-charcoal/10",     accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))" },
  // dark tiles — light text
  opaque:      { cls: "bg-charcoal text-ivory border border-white/10",        accent: "hsl(var(--sand))",     on: "hsl(var(--ivory))" },
  metal:       { cls: "bg-charcoal text-ivory border border-white/10",        accent: "hsl(var(--sand))",     on: "hsl(var(--ivory))" },
  solid:       { cls: "bg-olive text-ivory border border-white/10",           accent: "hsl(var(--ivory))",    on: "hsl(var(--charcoal))" },
  clay:        { cls: "bg-olive text-ivory border border-white/10",           accent: "hsl(var(--ivory))",    on: "hsl(var(--charcoal))" },
  sand:        { cls: "bg-sand text-ivory border border-white/10",            accent: "hsl(var(--ivory))",    on: "hsl(var(--charcoal))" },
};

export default function WidgetShell({
  size = "1x1",
  radius = "medium",
  glass = "card",
  className,
  children,
  onClick,
  interactive = false,
  style,
  zIndex,
}) {
  const tile = tileMap[glass] || tileMap.card;
  return (
    <div
      onClick={onClick}
      style={{ "--tile-accent": tile.accent, "--tile-on-accent": tile.on, ...style, zIndex }}
      className={cn(
        "relative overflow-hidden flex flex-col h-full animate-fade-up shadow-[0_18px_44px_-16px_hsl(30_10%_20%/0.16)]",
        tile.cls,
        sizeMap[size] || sizeMap["1x1"],
        radiusMap[radius] || radiusMap.medium,
        interactive && "cursor-pointer transition-transform duration-500 hover:-translate-y-1",
        className
      )}
    >
      {/* Solid palette accent strip — the editorial top edge */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--tile-accent)" }} />
      {children}
    </div>
  );
}