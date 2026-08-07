import React from "react";
import { cn } from "@/lib/utils";

/**
 * True Liquid Glass panel: an unfiltered image/background layer, a
 * ".liquid-glass-surface" layer carrying the SVG refraction + specular edge,
 * and a crisp unfiltered content layer on top — never blur-only glassmorphism.
 */
export default function LiquidPanel({
  className,
  contentClassName,
  bgImage,
  radius = "rounded-[28px]",
  children,
  ...props
}) {
  return (
    <div className={cn("relative isolate overflow-hidden", radius, className)} {...props}>
      {bgImage && (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      )}
      <div className={cn("absolute inset-0 liquid-glass-surface", radius)} />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}