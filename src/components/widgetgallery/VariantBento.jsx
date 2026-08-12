import React, { useState } from "react";
import ColorToggle from "./ColorToggle";
import ActionRow from "./ActionRow";
import Pager from "./Pager";
import WidgetHero from "./WidgetHero";
import WidgetHeader from "@/components/widgets/WidgetHeader";
import BrandPhoto from "@/components/widgets/BrandPhoto";
import { accentBg } from "@/lib/widgetAccent";

/**
 * Design 2 — "Photo Over Glass": the real EmailWidget pattern reversed — a
 * dark glass tile with an oversized bold stat, and a photo band floating on
 * TOP of the glass edge (-mt-8, rounded top corners) carrying the color
 * toggle + context line. Actions sit below as a real button row.
 */
export default function VariantBento({ widget }) {
  const [color, setColor] = useState("transparent");
  const [page, setPage] = useState(0);

  return (
    <div className="relative rounded-[28px] overflow-hidden flex flex-col glass-dark shadow-[0_28px_60px_-26px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1 cursor-pointer" style={{ minHeight: 340 }}>
      {color !== "transparent" && <span className={`pointer-events-none absolute inset-0 z-0 ${accentBg[color]} opacity-[0.14]`} />}
      <span className={`absolute top-0 left-6 right-6 h-[3px] rounded-b-full z-10 ${accentBg[widget.accent]}`} />

      <div className="relative z-10 p-5 pb-0 flex flex-col flex-1 min-h-0">
        <div className="flex items-start justify-between">
          <WidgetHeader label={widget.label} />
          <Pager page={page} setPage={setPage} dark />
        </div>
        <div className="flex-1 flex flex-col justify-center min-h-[120px]">
          {page === 0 ? (
            <WidgetHero widget={widget} tone="ivory" size="xl" />
          ) : (
            <div className="animate-fade-up">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 mb-1.5">{widget.page2.title}</p>
              <p className="text-sm text-ivory/85 leading-snug">{widget.page2.text}</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 -mt-8 shrink-0">
        <BrandPhoto
          src={widget.photo}
          className="h-24 w-full rounded-t-[24px] shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.4)]"
          overlay="bg-gradient-to-t from-charcoal/55 via-transparent to-transparent"
        >
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <p className="text-xs text-ivory/85 truncate pr-3" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{widget.sub}</p>
            <ColorToggle value={color} onChange={setColor} dark />
          </div>
        </BrandPhoto>
      </div>

      <div className="relative z-10 p-5 pt-4">
        <ActionRow actions={widget.actions} accent={widget.accent} tone="ivory" />
      </div>
    </div>
  );
}