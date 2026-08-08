import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const CATS = ["all", "Notes", "Insights", "Research", "Decisions", "Saved"];

/**
 * KnowledgeWidget — filter by category inline, right in the card.
 */
export default function KnowledgeWidget() {
  const { openModule } = usePanel();
  const { data: items, loading } = useEntityList("Knowledge", { sort: "-created_date" });
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? items : items.filter((k) => k.category === cat);
  const visible = filtered.slice(0, 3);

  return (
    <WidgetShell size="2x1" radius="medium" glass="translucent" interactive onClick={() => openModule("knowledge")} className="min-h-[280px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={BookOpen} label="Kennisbank" count={`${items.length} notities`} />

        <div className="flex flex-wrap gap-1 mb-3" onClick={(e) => e.stopPropagation()}>
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full border transition", cat === c ? "bg-olive text-ivory border-olive" : "bg-foreground/5 text-foreground/60 border-foreground/10 hover:text-foreground")}
            >
              {c === "all" ? "Alles" : c}
            </button>
          ))}
        </div>

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
            <p className="text-xs text-foreground/45">Niets in deze categorie</p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}