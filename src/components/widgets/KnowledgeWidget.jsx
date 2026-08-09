import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import CountUp from "./CountUp";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const CATS = ["Notes", "Insights", "Research", "Decisions", "Saved"];

/**
 * KnowledgeWidget — total notes as hero, a bespoke category bar chart (color
 * blocks = category signal, tap to filter), and a branded photo accent.
 */
export default function KnowledgeWidget() {
  const { openModule } = usePanel();
  const { data: items, loading } = useEntityList("Knowledge", { sort: "-created_date" });
  const [cat, setCat] = useState("all");
  const counts = CATS.reduce((acc, c) => { acc[c] = items.filter((k) => k.category === c).length; return acc; }, {});
  const maxC = Math.max(1, ...Object.values(counts));

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("knowledge")} className="min-h-[280px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="Kennisbank" count={`${items.length} notities`} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : items.length > 0 ? (
          <div className="flex-1 flex gap-4">
            <div className="flex-1 flex flex-col">
              <div className="flex items-end gap-3 mb-4">
                <CountUp value={items.length} className="text-5xl font-display font-semibold tracking-[-0.03em] leading-none text-current" />
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-50 mb-1.5">notities</p>
              </div>
              <div className="flex items-end gap-2 flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
                {CATS.map((c) => (
                  <button key={c} onClick={() => setCat(cat === c ? "all" : c)} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="w-full rounded-md transition-all duration-500" style={{ height: `${Math.max(8, (counts[c] / maxC) * 100)}%`, background: "var(--tile-accent)", opacity: cat === "all" || cat === c ? 1 : 0.35 }} />
                    <span className="text-[8px] uppercase tracking-wide opacity-45">{c.slice(0, 3)}</span>
                  </button>
                ))}
              </div>
            </div>
            <BrandPhoto src={IMAGES.chairWater} className="w-20 rounded-2xl shrink-0" overlay="bg-gradient-to-t from-black/45 to-transparent" />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Nog niets opgeslagen</p></div>
        )}
      </div>
    </WidgetShell>
  );
}