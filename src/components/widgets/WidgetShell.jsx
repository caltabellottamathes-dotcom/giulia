import React from "react";
import { cn } from "@/lib/utils";

/**
 * WidgetShell — the modular glass tile that hosts every dashboard widget.
 * Variable corner radius + depth-aware glass for editorial rhythm.
 */
export default function WidgetShell({
  size = "1x1",
  radius = "medium",
  className,
  children,
  onClick,
  interactive = false,
  style,
}) {
  const sizeMap = {
    "1x1": "min-h-[168px]",
    "2x1": "min-h-[168px]",
    "1x2": "min-h-[372px]",
    "2x2": "min-h-[372px]",
    "3x2": "min-h-[372px]",
    "wide": "min-h-[372px]",
    "full": "min-h-[168px]",
  };
  const radiusMap = {
    soft: "rounded-[20px]",
    medium: "rounded-[24px]",
    large: "rounded-[28px]",
    xl: "rounded-[32px]",
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "relative glass-2 overflow-hidden flex flex-col h-full animate-fade-up",
        sizeMap[size] || sizeMap["1x1"],
        radiusMap[radius] || radiusMap.medium,
        interactive && "cursor-pointer transition-transform duration-500 hover:-translate-y-1",
        className
      )}
    >
      {/* Top/left inner highlight — the editorial glass edge */}
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