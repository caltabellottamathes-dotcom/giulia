import React, { useState } from "react";
import ColorToggle from "./ColorToggle";
import ActionRow from "./ActionRow";
import WidgetHero from "./WidgetHero";
import { accentBg } from "@/lib/widgetAccent";

/**
 * Design 3 — "Side-by-Side Editorial": the real GiuliaWidget pattern — a
 * full-height editorial photo column (rounded inner edge) beside a glass
 * content column. A tab switch ("Overzicht" / "Details") is the multi-page
 * interaction; sides alternate left/right across the grid for rhythm.
 */
export default function VariantGlassDepth({ widget, index = 0 }) {
  const [color, setColor] = useState("transparent");
  const [tab, setTab] = useState(0);
  const reversed = index % 2 === 1;

  return (
    <div
      className="relative rounded-[28px] overflow-hidden flex bg-charcoal shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-1 cursor-pointer"
      style={{ minHeight: 340, flexDirection: reversed ? "row-reverse" : "row" }}
    >
      <div className={`relative w-[36%] shrink-0 overflow-hidden ${reversed ? "rounded-l-[24px]" : "rounded-r-[24px]"}`}>
        <img src={widget.photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
        <div className="absolute left-3 bottom-3">
          <p className="text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/75">{widget.label}</p>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col text-ivory min-h-0 relative">
        {color !== "transparent" && <span className={`pointer-events-none absolute inset-0 z-0 ${accentBg[color]} opacity-[0.14]`} />}
        <div className="relative z-10 flex items-center justify-between mb-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <button onClick={() => setTab(0)} className={tab === 0 ? "text-ivory" : "text-ivory/40 hover:text-ivory/70"}>Overzicht</button>
            <button onClick={() => setTab(1)} className={tab === 1 ? "text-ivory" : "text-ivory/40 hover:text-ivory/70"}>Details</button>
          </div>
          <ColorToggle value={color} onChange={setColor} dark />
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center min-h-[100px]">
          {tab === 0 ? (
            <WidgetHero widget={widget} tone="ivory" />
          ) : (
            <div className="animate-fade-up">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 mb-1.5">{widget.page2.title}</p>
              <p className="text-sm text-ivory/85 leading-snug">{widget.page2.text}</p>
            </div>
          )}
        </div>
        <p className="relative z-10 text-[11px] text-ivory/50 mb-3 line-clamp-1">{widget.sub}</p>
        <div className="relative z-10">
          <ActionRow actions={widget.actions} accent={widget.accent} tone="ivory" />
        </div>
      </div>
    </div>
  );
}