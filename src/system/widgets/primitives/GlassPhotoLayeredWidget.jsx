import React from "react";
import { cn } from "@/lib/utils";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { accentFor } from "./domainAccent";
import { SHELL_SHADOW, layeredCardStyle, layeredContentPad } from "./shellCode";

/** Optie 1 — LAAG: GlassShell + PhotoCard (gelaagd).
 *  De glazen shell ligt als basis; de PhotoCard zweeft over de shell-rand
 *  (overhangt buiten, reikt naar binnen) met 4 afgeronde hoeken + schaduw.
 *  Content staat op het glas, aan de open kant. */

const ASPECTS = { "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]", "16:9": "aspect-[16/9]", "9:16": "aspect-[9/16]", "21:9": "aspect-[21/9]", "3:2": "aspect-[3/2]", "2:3": "aspect-[2/3]", "4:5": "aspect-[4/5]" };
const RADIUS = { soft: "rounded-[20px]", medium: "rounded-[24px]", large: "rounded-[28px]", xl: "rounded-[32px]" };

export default function GlassPhotoLayeredWidget({
  shape = "4:3",
  photo,
  photoPosition = "left",
  photoFraction = 0.42,
  overhang = 0.1,
  domain = "giulia",
  radius = "large",
  photoOverlay,
  photoChildren,
  children,
  className,
}) {
  const accent = accentFor(domain);
  const cardStyle = layeredCardStyle(photoPosition, photoFraction, overhang);
  const contentPad = layeredContentPad(photoPosition, photoFraction);
  const overlay = photoOverlay || "bg-gradient-to-t from-black/45 via-black/20 to-black/15";

  return (
    <div className={cn("relative h-full w-full", ASPECTS[shape], className)} style={{ "--tile-accent": accent.accent, "--tile-on-accent": accent.on, color: "hsl(var(--ivory))" }}>
      {/* glass shell — basislaag */}
      <div
        className={cn("absolute inset-0 overflow-hidden", RADIUS[radius])}
        style={{ background: "rgba(48,50,55,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)" }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent.accent} 18%, ${accent.accent} 82%, transparent)` }} />
        <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(130% 90% at 0% 0%, rgba(255,255,255,0.10), transparent 46%)" }} />
      </div>

      {/* content op glas, aan de open kant */}
      <div className="absolute inset-0 z-0 flex flex-col" style={contentPad}>{children}</div>

      {/* PhotoCard zweeft over de rand */}
      <div className={cn("absolute z-10 overflow-hidden", RADIUS[radius])} style={{ ...cardStyle, boxShadow: SHELL_SHADOW[photoPosition] }}>
        <BrandPhoto src={photo} overlay={overlay} className="h-full w-full">{photoChildren}</BrandPhoto>
      </div>
    </div>
  );
}