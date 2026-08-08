import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { BookOpen, ArrowRight } from "lucide-react";

export default function KnowledgeWidget() {
  const { openModule } = usePanel();
  const { data: items, loading } = useEntityList("Knowledge", { sort: "-created_date" });
  const visible = items.slice(0, 3);

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("knowledge")} className="min-h-[220px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={BookOpen} label="Kennisbank" count={`${items.length} notities`} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {visible.map((k) => (
              <div key={k.id} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-olive/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{k.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/45">{k.category}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Nog geen kennis</p>
          </div>
        )}

        <button onClick={(ev) => { ev.stopPropagation(); openModule("knowledge"); }} className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-end gap-1 text-[11px] font-semibold text-foreground hover:text-olive transition">
          Openen <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </WidgetShell>
  );
}