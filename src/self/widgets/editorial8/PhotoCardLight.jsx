import React from "react";
import WidgetShell from "@/system/widgets/WidgetShell";

/** Lichte Giulia-palette — burgundy + soft sage + charcoal, op wit glas. */
export const BURG = "#5C333D";
export const INK = "#2D2D2D";
export const SAGE_SOFT = "#8A9A5B";

/** PhotoCardLight — grote foto + een zachte, afgeronde witte frosted-glas-kaart
 *  die er overheen zweeft. Licht, rond, zachter — niet technisch. Reeks 8. */
export default function PhotoCardLight({ photo, onClick, aspectRatio, top, children, cardStyle }) {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={onClick} className="min-h-0" style={{ aspectRatio, "--tile-accent": BURG }}>
      <div className="relative h-full w-full overflow-hidden rounded-[28px]">
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(245,244,242,0.30), rgba(245,244,242,0.04) 46%, transparent 72%)" }} />
        {top && (
          <div className="absolute left-4 top-4 right-4" style={{ color: INK, textShadow: "0 1px 12px rgba(255,255,255,0.65)" }}>
            {top}
          </div>
        )}
        <div className="absolute left-3 right-3 bottom-3 rounded-[24px] p-4" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(30px) saturate(1.3)", WebkitBackdropFilter: "blur(30px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 18px 40px -20px rgba(0,0,0,0.28)", color: INK, ...cardStyle }}>
          {children}
        </div>
      </div>
    </WidgetShell>
  );
}