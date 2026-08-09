import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { formatDistanceToNowStrict } from "date-fns";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

const SRC_COLOR = { email: "bg-olive", whatsapp: "bg-sand", task: "bg-charcoal", calendar: "bg-olive", system: "bg-sand" };

/**
 * ActivityWidget — a timeline, not a list. A branded banner carries the count;
 * a bespoke route-line below holds a dot per event (color = source, latest
 * pulses).
 */
export default function ActivityWidget() {
  const { openModule } = usePanel();
  const { data: items, loading } = useEntityList("Activity", { sort: "-created_date" });
  const visible = items.slice(0, 8);
  const latest = items[0];
  const when = (a) => { const t = a.timestamp || a.created_date; if (!t) return ""; try { return formatDistanceToNowStrict(new Date(t), { addSuffix: true }); } catch { return ""; } };

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("activity")} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.topDownWalk} className="h-16" overlay="bg-gradient-to-t from-charcoal/85 to-transparent">
          <div className="absolute inset-0 px-5 flex items-end justify-between pb-2">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Activiteit</h3>
            <span className="text-2xl font-display font-semibold text-ivory tabular-nums">{items.length}</span>
          </div>
        </BrandPhoto>
        <div className="p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : items.length > 0 ? (
            <>
              <div className="relative h-8 flex items-center">
                <div className="absolute inset-x-0 h-0.5 rounded-full bg-current/10" />
                <div className="relative flex justify-between w-full">
                  {visible.map((a, i) => (
                    <span key={a.id} className={cn("h-3 w-3 rounded-full border-2 border-current/20", i !== 0 && (SRC_COLOR[(a.source || "").toLowerCase()] || "bg-current"), i === 0 && "animate-pulse-soft")} style={i === 0 ? { background: "var(--tile-accent)" } : undefined} />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[11px] opacity-50">laatste {latest ? when(latest) : ""}</span>
              </div>
              {latest && <p className="text-sm opacity-70 truncate mt-1">{latest.description}</p>}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Nog geen activiteit</p></div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}