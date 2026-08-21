import React from "react";
import { cn } from "@/lib/utils";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { accentFor } from "./domainAccent";
import { SHELL_SHADOW } from "./shellCode";

/** Basisoptie 1 — GlassShell + PhotoCard.
 *  Een glazen shell (transparant, blur, domein-accent) met daarin een PhotoCard
 *  die afhankelijk van de vorm links/rechts (horizontaal) of boven/onder
 *  (verticaal) geplaatst wordt. De rest van de shell bevat de widget-content. */

const ASPECTS = { "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]", "16:9": "aspect-[16/9]", "9:16": "aspect-[9/16]", "21:9": "aspect-[21/9]", "3:2": "aspect-[3/2]", "2:3": "aspect-[2/3]", "4:5": "aspect-[4/5]" };
const RADIUS = { soft: "rounded-[20px]", medium: "rounded-[24px]", large: "rounded-[28px]", xl: "rounded-[32px]" };
const INNER = { soft: "rounded-[14px]", medium: "rounded-[18px]", large: "rounded-[22px]", xl: "rounded-[26px]" };

export default function GlassPhotoWidget({
  shape = "4:3",
  photo,
  photoPosition = "left",     // left | right | top | bottom
  photoFraction = 0.42,
  domain = "giulia",
  radius = "large",
  photoOverlay,
  photoChildren,
  children,
  className,
}) {
  const horizontal = photoPosition === "left" || photoPosition === "right";
  const accent = accentFor(domain);
  const photoFirst = photoPosition === "left" || photoPosition === "top";
  const overlay = photoOverlay || "bg-gradient-to-t from-black/45 via-black/20 to-black/15";

  return (
    <div
      className={cn("relative overflow-hidden flex h-full w-full", horizontal ? "flex-row" : "flex-col", ASPECTS[shape], RADIUS[radius], className)}
      style={{
        "--tile-accent": accent.accent,
        "--tile-on-accent": accent.on,
        background: "rgba(48,50,55,0.30)",
        backdropFilter: "blur(22px) saturate(1.35)",
        WebkitBackdropFilter: "blur(22px) saturate(1.35)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)",
        color: "hsl(var(--ivory))",
      }}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${accent.accent} 18%, ${accent.accent} 82%, transparent)` }} />
      <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(130% 90% at 0% 0%, rgba(255,255,255,0.10), transparent 46%)" }} />

      {/* PhotoCard */}
      <div
        className={cn("relative shrink-0 overflow-hidden", RADIUS[radius], horizontal ? "h-full" : "w-full")}
        style={{ flexBasis: `${photoFraction * 100}%`, order: photoFirst ? 1 : 2, boxShadow: SHELL_SHADOW[photoPosition] }}
      >
        <BrandPhoto src={photo} overlay={overlay} className="h-full w-full">{photoChildren}</BrandPhoto>
      </div>

      {/* Glass content area */}
      <div className={cn("relative flex-1 min-w-0 min-h-0 flex flex-col p-4", photoFirst ? "order-2" : "order-1")}>
        {children}
      </div>
    </div>
  );
}