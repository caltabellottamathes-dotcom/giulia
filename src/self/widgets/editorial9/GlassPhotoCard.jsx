import React from "react";
import WidgetShell from "@/system/widgets/WidgetShell";

export const BURG = "#5C333D";
export const INK = "#2D2D2D";
export const SAGE_SOFT = "#8A9A5B";

/** GlassPhotoCard — omgekeerd: grote glas-kaart is het hoofdoppervlak, de
 *  kleine foto-kaart zweeft er bovenop. Licht, rond, zachter. Reeks 9. */
export default function GlassPhotoCard({ photo, onClick, aspectRatio, top, children, photoSide = "right" }) {
  const right = photoSide === "right";
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={onClick} className="min-h-0" style={{ aspectRatio, "--tile-accent": BURG }}>
      <div className="relative h-full w-full rounded-[28px] p-4" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(30px) saturate(1.3)", WebkitBackdropFilter: "blur(30px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 18px 40px -20px rgba(0,0,0,0.28)", color: INK }}>
        <div className="absolute rounded-2xl overflow-hidden shadow-[0_14px_30px_-14px_rgba(0,0,0,0.45)]" style={{ top: 12, [right ? "right" : "left"]: 12, width: "38%", height: "34%", border: "1px solid rgba(255,255,255,0.8)" }}>
          <img src={photo} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className={right ? "pr-[42%]" : "pl-[42%]"}>{top}</div>
        <div className="mt-3">{children}</div>
      </div>
    </WidgetShell>
  );
}