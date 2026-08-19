import React from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { DOMAIN_META } from "@/lib/unifiedStream";
import { Trash2 } from "lucide-react";

const ORDER = ["focus", "life", "self", "giulia"];

/** ActivityWidget — versmolten stream: groepeert de unified Activity-feed per domein. */
export default function ActivityWidget() {
  const { openModule } = usePanel();
  const { data: items, loading, reload } = useEntityList("Activity", { sort: "-created_date" });

  const groups = {};
  items.forEach((it) => { const k = it.domain || "focus"; (groups[k] = groups[k] || []).push(it); });
  const keys = ORDER.filter((k) => groups[k] && groups[k].length);

  const clearDomain = async (k) => { const ids = groups[k].map((g) => g.id); try { await base44.entities.Activity.deleteMany({ id: { $in: ids } }); reload(); } catch {} };

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("activity")} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.topDownWalk} className="h-20 -mb-8 rounded-b-[20px] shadow-[0_14px_24px_-12px_rgba(0,0,0,0.3)] relative z-10" overlay="bg-gradient-to-t from-charcoal/85 to-charcoal/30">
          <div className="absolute inset-0 px-5 flex items-end justify-between pb-2">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">I Do Process! · alles</h3>
            <span className="text-2xl font-display font-semibold text-ivory tabular-nums">{items.length}</span>
          </div>
        </BrandPhoto>
        <div className="p-4 pt-9 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center"><div className="h-7 w-7 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : keys.length ? (
            <div className="space-y-2">
              {keys.map((k) => {
                const list = groups[k];
                const meta = DOMAIN_META[k] || DOMAIN_META.giulia;
                return (
                  <div key={k} className="group flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: meta.color }} />
                    <span className="text-[10px] uppercase tracking-wider font-bold w-14 shrink-0" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="text-[11px] text-current opacity-60 truncate flex-1">{list[0].description}</span>
                    <span className="text-[10px] tabular-nums text-current opacity-50 shrink-0">{list.length}</span>
                    <button onClick={(e) => { e.stopPropagation(); clearDomain(k); }} className="opacity-0 group-hover:opacity-100 text-current/50 hover:text-current transition-opacity shrink-0" aria-label="Wis domein">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Nog geen activiteit</p></div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}