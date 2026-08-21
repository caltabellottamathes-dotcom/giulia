import React from "react";
import { cn } from "@/lib/utils";
import { accentFor } from "./domainAccent";

/** Basisoptie 2 — PhotoShell + GlassCard.
 *  Een foto als full-bleed shell met daarin een zwevende GlassCard die
 *  afhankelijk van de vorm links/rechts (horizontaal) of boven/onder
 *  (verticaal) geplaatst wordt. De rest van de shell toont de foto. */

const ASPECTS = { "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]", "16:9": "aspect-[16/9]", "9:16": "aspect-[9/16]", "21:9": "aspect-[21/9]", "3:2": "aspect-[3/2]", "2:3": "aspect-[2/3]", "4:5": "aspect-[4/5]" };
const RADIUS = { soft: "rounded-[20px]", medium: "rounded-[24px]", large: "rounded-[28px]", xl: "rounded-[32px]" };
const INNER = { soft: "rounded-[14px]", medium: "rounded-[18px]", large: "rounded-[22px]", xl: "rounded-[26px]" };

export default function PhotoGlassWidget({
  shape = "4:3",
  photo,
  glassPosition = "left",      // left | right | top | bottom
  glassFraction = 0.42,
  domain = "giulia",
  radius = "large",
  overlay = "bg-gradient-to-t from-black/55 via-black/25 to-black/15",
  photoChildren,
  glassChildren,
  className,
}) {
  const horizontal = glassPosition === "left" || glassPosition === "right";
  const accent = accentFor(domain);
  const justify = glassPosition === "right" || glassPosition === "bottom" ? "justify-end" : "justify-start";

  return (
    <div       className={cn("relative overflow-hidden flex h-full w-full", horizontal ? "flex-row" : "flex-col", justify, ASPECTS[shape], RADIUS[radius], className)}>
      {/* full-bleed foto-shell */}
      <img src={photo} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
      <div className={cn("absolute inset-0", overlay)} />
      {photoChildren}

      {/* zwevende GlassCard */}
      <div
        className={cn("relative shrink-0 z-10 overflow-hidden", horizontal ? "h-full" : "w-full")}
        style={{
          "--tile-accent": accent.accent,
          "--tile-on-accent": accent.on,
          flexBasis: `${glassFraction * 100}%`,
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(14px) saturate(1.4)",
          WebkitBackdropFilter: "blur(14px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 14px 34px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22)",
          color: "hsl(var(--ivory))",
        }}
      >
        <div className="relative h-full w-full flex flex-col p-3.5">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent.accent} 18%, ${accent.accent} 82%, transparent)` }} />
          {glassChildren}
        </div>
      </div>
    </div>
  );
}