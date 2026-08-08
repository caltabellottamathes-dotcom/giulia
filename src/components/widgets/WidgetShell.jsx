import React from "react";
import { cn } from "@/lib/utils";

/**
 * WidgetShell — the modular glass tile that hosts every dashboard widget.
 * `glass`: "card" (readable, default), "translucent" (lighter layer), "solid".
 * `zIndex` lets cards stack for overlapping, layered compositions.
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

const glassMap = {
  card: "glass-card",
  translucent: "glass-card-2",
  solid: "glass-4",
  opaque: "bg-card border border-foreground/10",
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
  return (
    <div
      onClick={onClick}
      style={{ ...style, zIndex }}
      className={cn(
        "relative overflow-hidden flex flex-col h-full animate-fade-up",
        glassMap[glass] || glassMap.card,
        sizeMap[size] || sizeMap["1x1"],
        radiusMap[radius] || radiusMap.medium,
        interactive &&
          "cursor-pointer transition-transform duration-500 hover:-translate-y-1",
        className
      )}
    >
      {/* Top inner highlight — the editorial glass edge */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(40 20% 100% / 0.7) 30%, hsl(40 20% 100% / 0.5) 70%, transparent)",
        }}
      />
      {children}
    </div>
  );
}