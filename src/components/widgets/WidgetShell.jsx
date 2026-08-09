import React from "react";
import { cn } from "@/lib/utils";
import { useWidgetTheme } from "@/lib/WidgetThemeContext";

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
  glass:    { cls: "glass-card text-ivory",                          accent: "rgba(255,255,255,0.14)", on: "rgba(255,255,255,0.92)" },
  charcoal: { cls: "bg-charcoal text-ivory border border-white/10", accent: "hsl(var(--sand))",      on: "hsl(var(--ivory))" },
  olive:    { cls: "bg-olive text-ivory border border-white/10",     accent: "hsl(var(--ivory))",     on: "hsl(var(--charcoal))" },
  sand:     { cls: "bg-sand text-ivory border border-white/10",      accent: "hsl(var(--ivory))",     on: "hsl(var(--charcoal))" },
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
  const ctxTheme = useWidgetTheme();
  const resolved = ctxTheme.theme === "solid" ? (ctxTheme.color || "charcoal") : "glass";
  const tile = tileMap[resolved] || tileMap.glass;
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