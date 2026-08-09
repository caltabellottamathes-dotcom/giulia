import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import Ring from "./Ring";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

/**
 * MemoryWidget — a bespoke confidence ring (average certainty) with the latest
 * memory beside it and tactile ± controls. A branded photo bleeds off the
 * bottom edge.
 */
export default function MemoryWidget() {
  const { openModule } = usePanel();
  const { data: memories, loading, reload } = useEntityList("Memory", { sort: "-created_date" });
  const top = memories[0];
  const avg = memories.length ? memories.reduce((s, m) => s + (m.confidence || 0.5), 0) / memories.length : 0;
  const setConf = async (e, m, delta) => { e.stopPropagation(); const c = Math.max(0, Math.min(1, +(m.confidence || 0.5) + delta)); try { await base44.entities.Memory.update(m.id, { confidence: +c.toFixed(2) }); reload(); } catch {} };

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("memory")} className="min-h-[260px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="Geheugen" count={`${memories.length} herinneringen`} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : memories.length > 0 ? (
          <div className="flex-1 flex items-center gap-5">
            <Ring value={avg} max={1} size={112} stroke={12}>
              <div className="text-center">
                <span className="text-2xl font-display font-semibold leading-none text-current">{Math.round(avg * 100)}</span>
                <p className="text-[9px] uppercase tracking-wider opacity-45 mt-0.5">zeker</p>
              </div>
            </Ring>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider opacity-45">{top.category}</p>
              <p className="text-sm text-current opacity-80 line-clamp-2 leading-snug mt-0.5">{top.content}</p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={(e) => setConf(e, top, -0.1)} className="h-8 w-8 rounded-full border border-current/15 text-current text-lg leading-none flex items-center justify-center transition hover:bg-current/5">−</button>
                <button onClick={(e) => setConf(e, top, 0.1)} className="h-8 w-8 rounded-full border border-current/15 text-current text-lg leading-none flex items-center justify-center transition hover:bg-current/5">+</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Nog niets onthouden</p></div>
        )}
      </div>
      <BrandPhoto src={IMAGES.loungeChairs} className="h-10 w-full" overlay="bg-gradient-to-t from-black/30 to-transparent" />
    </WidgetShell>
  );
}