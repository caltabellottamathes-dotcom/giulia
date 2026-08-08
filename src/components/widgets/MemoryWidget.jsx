import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { Brain, ArrowRight } from "lucide-react";

export default function MemoryWidget() {
  const { openModule } = usePanel();
  const { data: memories, loading } = useEntityList("Memory", { sort: "-created_date" });
  const visible = memories.slice(0, 3);

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("memory")} className="min-h-[220px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={Brain} label="Geheugen" count={`${memories.length} herinneringen`} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {visible.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-olive/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-foreground/45">{m.category}</p>
                  <p className="text-sm text-foreground/85 line-clamp-2 leading-snug">{m.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Nog niets onthouden</p>
          </div>
        )}

        <button onClick={(ev) => { ev.stopPropagation(); openModule("memory"); }} className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-end gap-1 text-[11px] font-semibold text-foreground hover:text-olive transition">
          Openen <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </WidgetShell>
  );
}