import React from "react";
import { cn } from "@/lib/utils";
import { useWidgetTheme } from "@/lib/WidgetThemeContext";

/**
 * WidgetShell — the designed tile hosting every dashboard widget.
 * Glass or a full palette color (Metal / Clay / Sand / Blue Ridge Sky / Storm),
 * with per-widget opacity + blur, a drop shadow for depth, and an accent strip.
 * Text color adapts per tile so widget internals (which use currentColor tints)
 * stay readable on every option — including the light Sky and Storm tiles.
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

const radiusMap = {
  soft: "rounded-[20px]",
  medium: "rounded-[24px]",
  large: "rounded-[28px]",
  xl: "rounded-[32px]",
};

const tileMap = {
  glass:    { text: "text-ivory",    accent: "hsl(var(--sand))",     on: "hsl(var(--ivory))",     token: null },
  charcoal: { text: "text-ivory",    accent: "hsl(var(--sand))",     on: "hsl(var(--ivory))",     token: "charcoal" },
  olive:    { text: "text-ivory",    accent: "hsl(var(--ivory))",    on: "hsl(var(--charcoal))",  token: "olive" },
  sand:     { text: "text-ivory",    accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))",     token: "sand" },
  ridge:    { text: "text-charcoal", accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))",    token: "ridge" },
  storm:    { text: "text-charcoal", accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))",    token: "storm" },
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
  const ctx = useWidgetTheme();
  const opacity = ctx.opacity != null ? ctx.opacity : 1;
  const blur = ctx.blur || 0;
  const resolved = ctx.theme === "solid" ? (ctx.color || "charcoal") : "glass";
  const tile = tileMap[resolved] || tileMap.glass;

  const bg =
    resolved === "glass"
      ? {
          background: `rgba(48,50,55,${0.18 * opacity})`,
          backdropFilter: `blur(${22 + blur}px) saturate(1.35)`,
          WebkitBackdropFilter: `blur(${22 + blur}px) saturate(1.35)`,
        }
      : {
          background: `hsl(var(--${tile.token}) / ${opacity})`,
          ...(blur > 0
            ? { backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }
            : {}),
        };

  return (
    <div
      onClick={onClick}
      style={{
        "--tile-accent": tile.accent,
        "--tile-on-accent": tile.on,
        ...bg,
        boxShadow: "0 28px 64px -26px rgba(0,0,0,0.42), inset 0 1px 0 0 rgba(255,255,255,0.14)",
        ...style,
        zIndex,
      }}
      className={cn(
        "relative overflow-hidden flex flex-col h-full animate-fade-up border border-current/10 ring-1 ring-inset ring-white/10",
        tile.text,
        sizeMap[size] || sizeMap["1x1"],
        radiusMap[radius] || radiusMap.medium,
        interactive && "cursor-pointer transition-transform duration-500 hover:-translate-y-1",
        className
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--tile-accent)" }} />
      {children}
    </div>
  );
}