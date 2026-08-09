import React from "react";
import { cn } from "@/lib/utils";

/**
 * BrandPhoto — a contained branding image block with a gradient overlay for
 * depth and text legibility. Used as a designed design element inside widgets
 * and panels (not as a full-bleed background, so the tile color stays visible).
 */
export default function BrandPhoto({ src, className, overlay = "bg-gradient-to-tr from-black/55 via-black/15 to-transparent", imgClassName, children }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img src={src} alt="" draggable={false} className={cn("h-full w-full object-cover", imgClassName)} />
      <div className={cn("absolute inset-0", overlay)} />
      {children}
    </div>
  );
}