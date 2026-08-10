import React from "react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

/**
 * PhotoBlock — a curated editorial photograph used as a *design element*
 * (a mood band, a section divider), not a content thumbnail. An eyebrow and
 * optional caption sit over a directional dark gradient so the photo carries
 * the section's mood while text stays legible.
 */
export default function PhotoBlock({ src, eyebrow, caption, className, aspect = "aspect-[16/6]", focalPointX, focalPointY }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl float-shadow", aspect, className)}>
      <Image
        src={src}
        fittingType="fill"
        focalPointX={focalPointX}
        focalPointY={focalPointY}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/35 to-charcoal/10" />
      <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.24em] text-ivory/60 font-semibold mb-1.5">{eyebrow}</p>
        )}
        {caption && <p className="text-sm text-ivory/90 max-w-md leading-relaxed">{caption}</p>}
      </div>
    </div>
  );
}