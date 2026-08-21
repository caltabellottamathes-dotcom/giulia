import React from "react";
import { cn } from "@/lib/utils";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { accentFor } from "./domainAccent";
import { peekTransform } from "./shellCode";

/** Optie 1 — ACHTER: GlassShell (ervoor) + PhotoCard (erachter, verschoven).
 *  De foto ligt achter het glas en is verschoven (peek) zodat hij aan één
 *  kant/hoek erachter uit steekt. Content staat op het glas. */

const ASPECTS = { "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]", "16:9": "aspect-[16/9]", "9:16": "aspect-[9/16]", "21:9": "aspect-[21/9]", "3:2": "aspect-[3/2]", "2:3": "aspect-[2/3]", "4:5": "aspect-[4/5]" };
const RADIUS = { soft: "rounded-[20px]", medium: "rounded-[24px]", large: "rounded-[28px]", xl: "rounded-[32px]" };

export default function GlassPhotoBehindWidget({
  shape = "4:3",
  photo,
  peek = "tl",
  peekAmount = 0.09,
  domain = "giulia",
  radius = "large",
  photoOverlay,
  children,
  className,
}) {
  const accent = accentFor(domain);
  const overlay = photoOverlay || "bg-gradient-to-t from-black/40 via-black/15 to-transparent";

  return (
    <div className={cn("relative h-full w-full", ASPECTS[shape], className)} style={{ "--tile-accent": accent.accent, "--tile-on-accent": accent.on, color: "hsl(var(--ivory))" }}>
      {/* PhotoCard erachter, verschoven */}
      <div
        className={cn("absolute inset-0 z-0 overflow-hidden", RADIUS[radius])}
        style={{ transform: peekTransform(peek, peekAmount), boxShadow: "0 18px 42px -18px rgba(0,0,0,0.50)" }}
      >
        <BrandPhoto src={photo} overlay={overlay} className="h-full w-full" />
      </div>

      {/* GlassShell ervoor, met content */}
      <div
        className={cn("absolute inset-0 z-10 overflow-hidden flex flex-col p-4", RADIUS[radius])}
        style={{
          background: "rgba(48,50,55,0.42)",
          backdropFilter: "blur(18px) saturate(1.35)",
          WebkitBackdropFilter: "blur(18px) saturate(1.35)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 14px 34px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent.accent} 18%, ${accent.accent} 82%, transparent)` }} />
        {children}
      </div>
    </div>
  );
}