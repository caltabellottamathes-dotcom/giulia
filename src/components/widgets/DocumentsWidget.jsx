import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const typeLabel = { pdf: "PDF", image: "IMG", doc: "DOC", sheet: "XLS", figma: "FIG", other: "FILE" };

/**
 * DocumentsWidget — star / unstar a file inline (favorite ↔ recent).
 */
export default function DocumentsWidget() {
  const { openModule } = usePanel();
  const { data: docs, loading, reload } = useEntityList("Document", { sort: "-created_date" });
  const visible = docs.slice(0, 4);

  const toggleFav = async (e, d) => {
    e.stopPropagation();
    try { await base44.entities.Document.update(d.id, { status: d.status === "favorite" ? "recent" : "favorite" }); reload(); } catch {}
  };

  return (
    <WidgetShell size="2x1" radius="medium" glass="translucent" interactive onClick={() => openModule("documents")} className="min-h-[240px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={FileText} label="Documenten" count={`${docs.length}`} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-8 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-2 overflow-hidden">
            {visible.map((d) => (
              <div key={d.id} className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center text-[8px] font-bold text-foreground/60 shrink-0">
                  {typeLabel[d.type] || "FILE"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                  {d.owner && <p className="text-[10px] text-foreground/45 truncate">{d.owner}</p>}
                </div>
                <button onClick={(e) => toggleFav(e, d)} className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center hover:bg-foreground/5 transition" aria-label="Favoriet">
                  <Star className={cn("h-3.5 w-3.5", d.status === "favorite" ? "fill-olive text-olive" : "text-foreground/30")} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Geen bestanden</p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}