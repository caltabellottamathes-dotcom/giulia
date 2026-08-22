import React from "react";
import { cn } from "@/lib/utils";
import { accentFor } from "./domainAccent";
import { SHELL_SHADOW, layeredCardStyle } from "./shellCode";

/** Optie 2 — LAAG: PhotoShell + GlassCard (gelaagd).
 *  De foto ligt als full-bleed basis; de GlassCard zweeft over de shell-rand
 *  (overhangt buiten, reikt naar binnen) met 4 afgeronde hoeken + schaduw.
 *  Content staat in de GlassCard. */

const ASPECTS = { "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]", "16:9": "aspect-[16/9]", "9:16": "aspect-[9/16]", "21:9": "aspect-[21/9]", "3:2": "aspect-[3/2]", "2:3": "aspect-[2/3]", "4:5": "aspect-[4/5]" };
const RADIUS = { soft: "rounded-[20px]", medium: "rounded-[24px]", large: "rounded-[28px]", xl: "rounded-[32px]" };

export default function PhotoGlassLayeredWidget({
  shape = "4:3",
  photo,
  glassPosition = "left",
  glassFraction = 0.42,
  overhang = 0.1,
  domain = "giulia",
  radius = "large",
  overlay = "bg-gradient-to-t from-black/55 via-black/25 to-black/15",
  photoChildren,
  children,
  onClick,
  className,
  glassBlur = 12,
  glassBorder = "1px solid rgba(255,255,255,0.18)",
}) {
  const accent = accentFor(domain);
  const cardStyle = layeredCardStyle(glassPosition, glassFraction, overhang);

  return (
    <div onClick={onClick} className={cn("relative h-full w-full", ASPECTS[shape], className)} style={{ "--tile-accent": accent.accent, "--tile-on-accent": accent.on, color: "hsl(var(--ivory))" }}>
      {/* foto shell — basislaag */}
      <div className={cn("absolute inset-0 overflow-hidden", RADIUS[radius])}>
        <img src={photo} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
        <div className={cn("absolute inset-0", overlay)} />
        {photoChildren}
      </div>

      {/* GlassCard zweeft over de rand, content binnenin */}
      <div
        className={cn("absolute z-10 overflow-hidden flex flex-col p-3.5", RADIUS[radius])}
        style={{
          ...cardStyle,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: `blur(${glassBlur}px) saturate(1.35)`,
          WebkitBackdropFilter: `blur(${glassBlur}px) saturate(1.35)`,
          border: glassBorder,
          boxShadow: `${SHELL_SHADOW[glassPosition]}, inset 0 1px 0 rgba(255,255,255,0.22)`,
        }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent.accent} 18%, ${accent.accent} 82%, transparent)` }} />
        {children}
      </div>
    </div>
  );
}