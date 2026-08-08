import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { Activity as ActivityIcon, ArrowRight } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

export default function ActivityWidget() {
  const { openModule } = usePanel();
  const { data: items, loading } = useEntityList("Activity", { sort: "-created_date" });
  const visible = items.slice(0, 4);

  const when = (a) => {
    const t = a.timestamp || a.created_date;
    if (!t) return "";
    try { return formatDistanceToNowStrict(new Date(t), { addSuffix: true }); } catch { return ""; }
  };

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("activity")} className="min-h-[220px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={ActivityIcon} label="Activiteit" count={`${items.length}`} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-8 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {visible.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.description}</p>
                  <p className="text-[10px] text-foreground/45">{when(a)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Nog geen activiteit</p>
          </div>
        )}

        <button onClick={(ev) => { ev.stopPropagation(); openModule("activity"); }} className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-end gap-1 text-[11px] font-semibold text-foreground hover:text-olive transition">
          Openen <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </WidgetShell>
  );
}