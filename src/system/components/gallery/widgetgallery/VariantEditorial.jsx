import React, { useState } from "react";
import ColorToggle from "./ColorToggle";
import ActionRow from "./ActionRow";
import Pager from "./Pager";
import WidgetHero from "./WidgetHero";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { accentBg } from "@/lib/widgetAccent";

/**
 * Design 1 — "Glass Over Photo": the real TasksWidget/GiuliaWidget pattern —
 * a glass-3 card fills most of the tile and overlaps down onto a photo strip
 * that peeks below it. Pager flips between the hero graphic and a detail
 * page; the action row carries the widget's real actions.
 */
export default function VariantEditorial({ widget }) {
  const [color, setColor] = useState("transparent");
  const [page, setPage] = useState(0);

  return (
    <div className="relative rounded-[28px] overflow-hidden flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1 cursor-pointer" style={{ minHeight: 340 }}>
      <div className="flex-1 -mb-8 rounded-b-[24px] glass-3 p-5 relative z-10 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
        {color !== "transparent" && <span className={`pointer-events-none absolute inset-0 z-0 ${accentBg[color]} opacity-[0.16]`} />}
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          <WidgetHeader label={widget.label} count={page === 1 ? "detail" : undefined} />
          <div className="flex-1 flex flex-col justify-center min-h-[92px]">
            {page === 0 ? (
              <WidgetHero widget={widget} tone="ivory" />
            ) : (
              <div className="animate-fade-up">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 mb-1.5">{widget.page2.title}</p>
                <p className="text-sm text-ivory/85 leading-snug">{widget.page2.text}</p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-ivory/55 mt-2 mb-3 line-clamp-1">{widget.sub}</p>
          <div className="flex items-center justify-between gap-2">
            <ActionRow actions={widget.actions} accent={widget.accent} tone="ivory" />
            <div className="flex items-center gap-2 shrink-0">
              <Pager page={page} setPage={setPage} dark />
              <ColorToggle value={color} onChange={setColor} dark />
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-24 shrink-0 overflow-hidden">
        <BrandPhoto src={widget.photo} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/70 to-charcoal/10" />
      </div>
    </div>
  );
}