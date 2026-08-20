import React from "react";
import WidgetShell from "@/system/widgets/WidgetShell";

/** PhotoCard — gedeeld frame voor reeks 7: een grote foto als basis met
 *  daar overheen een zwevende glas-kaart (dark glass) waarin de grafische
 *  info leeft. `top` = grote typografie over de foto; `children` = graphic. */
export default function PhotoCard({ photo, onClick, aspectRatio, accent, top, children }) {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={onClick} className="min-h-0" style={{ aspectRatio, "--tile-accent": accent }}>
      <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(38,40,44,0.66), rgba(38,40,44,0.18) 42%, transparent 72%)" }} />
        {top && (
          <div className="absolute left-3 top-3 right-3" style={{ color: "rgba(255,255,255,0.96)", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
            {top}
          </div>
        )}
        <div className="absolute left-2.5 right-2.5 bottom-2.5 rounded-2xl p-3" style={{ background: "rgba(38,40,44,0.55)", backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.95)" }}>
          {children}
        </div>
      </div>
    </WidgetShell>
  );
}