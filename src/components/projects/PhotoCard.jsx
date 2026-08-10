import React from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import { cn } from "@/lib/utils";

/** PhotoCard — a glass card with a branded photo strip as a design element
 *  at the top. The photo is an accent, not the content; readability stays. */
export default function PhotoCard({ src, stripHeight = "h-16", level = 1, className, contentClassName, children, ...props }) {
  return (
    <GlassPanel level={level} className={cn("overflow-hidden p-0", className)} {...props}>
      <div className={cn("relative w-full overflow-hidden", stripHeight)}>
        <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
      </div>
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </GlassPanel>
  );
}