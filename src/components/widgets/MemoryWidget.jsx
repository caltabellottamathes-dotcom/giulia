import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Brain, Minus, Plus } from "lucide-react";

/**
 * MemoryWidget — adjust how confident Giulia is about each memory, inline.
 */
export default function MemoryWidget() {
  const { openModule } = usePanel();
  const { data: memories, loading, reload } = useEntityList("Memory", { sort: "-created_date" });
  const visible = memories.slice(0, 3);

  const setConf = async (e, m, delta) => {
    e.stopPropagation();
    const c = Math.max(0, Math.min(1, +(m.confidence || 0.5) + delta));
    try { await base44.entities.Memory.update(m.id, { confidence: +c.toFixed(2) }); reload(); } catch {}
  };

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("memory")} className="min-h-[260px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={Brain} label="Geheugen" count={`${memories.length} herinneringen`} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-3 overflow-hidden">
            {visible.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-olive/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-ivory/45">{m.category}</p>
                  <p className="text-sm text-ivory/85 line-clamp-2 leading-snug">{m.content}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button onClick={(e) => setConf(e, m, -0.1)} className="h-5 w-5 rounded-md bg-ivory/5 border border-ivory/10 flex items-center justify-center text-ivory/60 hover:text-ivory transition" aria-label="Minder zeker">
                      <Minus className="h-2.5 w-2.5" />
                    </button>
                    <div className="flex-1 h-1.5 rounded-full bg-ivory/10 overflow-hidden">
                      <div className="h-full bg-olive rounded-full transition-all" style={{ width: `${Math.round((m.confidence || 0.5) * 100)}%` }} />
                    </div>
                    <button onClick={(e) => setConf(e, m, 0.1)} className="h-5 w-5 rounded-md bg-ivory/5 border border-ivory/10 flex items-center justify-center text-ivory/60 hover:text-ivory transition" aria-label="Meer zeker">
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-ivory/45">Nog niets onthouden</p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}