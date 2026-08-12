import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import CountUp from "./CountUp";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const CATS = ["Notes", "Insights", "Research", "Decisions", "Saved"];

/** KnowledgeWidget — glass floats over a bottom photo; count + category bars. */
export default function KnowledgeWidget() {
  const { openModule } = usePanel();
  const { data: items, loading } = useEntityList("Knowledge", { sort: "-created_date" });
  const [cat, setCat] = useState("all");
  const counts = CATS.reduce((acc, c) => { acc[c] = items.filter((k) => k.category === c).length; return acc; }, {});
  const maxC = Math.max(1, ...Object.values(counts));

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("knowledge")} className="min-h-[240px]">
      <div className="flex flex-col h-full">
        <div className="flex-1 -mb-8 rounded-b-[24px] glass-3 p-5 relative z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          <WidgetHeader label="Kennisbank" count={`${items.length} notities`} />
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : items.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-end gap-3 mb-4">
                <CountUp value={items.length} className="text-5xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory" />
                <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 mb-1.5">notities</p>
              </div>
              <div className="flex items-end gap-2 flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
                {CATS.map((c) => (
                  <button key={c} onClick={() => setCat(cat === c ? "all" : c)} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="w-full rounded-md transition-all duration-500" style={{ height: `${Math.max(8, (counts[c] / maxC) * 100)}%`, background: "var(--tile-accent)", opacity: cat === "all" || cat === c ? 1 : 0.4 }} />
                    <span className="text-[8px] uppercase tracking-wide text-ivory/45">{c.slice(0, 3)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center"><p className="text-xs text-ivory/45">Nog niets opgeslagen</p></div>
          )}
        </div>
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.chairWater} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/70 to-charcoal/20" />
        </div>
      </div>
    </WidgetShell>
  );
}