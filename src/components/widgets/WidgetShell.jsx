import React from "react";
import { cn } from "@/lib/utils";

/**
 * WidgetShell — modular grey-glass tile. Variable radius, layered depth,
 * tangible hover lift, and a sheen sweep. Feels like a physical object
 * floating above the desktop.
 */
export default function WidgetShell({
  size = "1x1",
  radius = "medium",
  depth = 2,
  className,
  children,
  onClick,
  interactive = false,
  style,
}) {
  const sizeMap = {
    "1x1": "min-h-[168px]",
    "2x1": "min-h-[200px]",
    "1x2": "min-h-[372px]",
    "2x2": "min-h-[420px]",
    "3x2": "min-h-[420px]",
    "wide": "min-h-[372px]",
    "full": "min-h-[200px]",
  };
  const radiusMap = {
    soft: "rounded-[22px]",
    medium: "rounded-[26px]",
    large: "rounded-[30px]",
    xl: "rounded-[34px]",
  };
  const depthMap = { 1: "depth-1", 2: "depth-2", 3: "depth-3" };

  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "relative glass-2 overflow-hidden flex flex-col h-full animate-fade-up widget-sheen",
        sizeMap[size] || sizeMap["1x1"],
        radiusMap[radius] || radiusMap.medium,
        depthMap[depth] || depthMap[2],
        interactive && "widget-hover cursor-pointer",
        className
      )}
    >
      {/* top inner highlight — the editorial glass edge */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(40 34% 100% / 0.8) 30%, hsl(40 34% 100% / 0.55) 70%, transparent)",
        }}
      />
      {children}
    </div>
  );
}