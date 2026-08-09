import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";

const SRC_COLOR = { email: "bg-olive", whatsapp: "bg-sand", task: "bg-charcoal", calendar: "bg-olive", system: "bg-sand" };

/**
 * ActivityWidget — a timeline, not a list. A bespoke horizontal route-line
 * carries a dot per recent event (color = source); the latest dot pulses.
 * Hero is the total count with the most recent action beside it.
 */
export default function ActivityWidget() {
  const { openModule } = usePanel();
  const { data: items, loading } = useEntityList("Activity", { sort: "-created_date" });
  const visible = items.slice(0, 8);
  const latest = items[0];

  const when = (a) => {
    const t = a.timestamp || a.created_date;
    if (!t) return "";
    try { return formatDistanceToNowStrict(new Date(t), { addSuffix: true }); } catch { return ""; }
  };

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("activity")} className="min-h-[200px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="Activiteit" count={`${items.length}`} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
        ) : items.length > 0 ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative h-8 flex items-center">
              <div className="absolute inset-x-0 h-0.5 rounded-full bg-ivory/10" />
              <div className="relative flex justify-between w-full">
                {visible.map((a, i) => (
                  <span
                    key={a.id}
                    className={cn("h-3 w-3 rounded-full border-2 border-ivory/20", i !== 0 && (SRC_COLOR[(a.source || "").toLowerCase()] || "bg-current"), i === 0 && "animate-pulse-soft")}
                    style={i === 0 ? { background: "var(--tile-accent)" } : undefined}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-display font-semibold text-current">{items.length}</span>
              <span className="text-[11px] opacity-50">acties · laatste {latest ? when(latest) : ""}</span>
            </div>
            {latest && <p className="text-sm opacity-70 truncate mt-1">{latest.description}</p>}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center"><p className="text-xs text-ivory/45">Nog geen activiteit</p></div>
        )}
      </div>
    </WidgetShell>
  );
}