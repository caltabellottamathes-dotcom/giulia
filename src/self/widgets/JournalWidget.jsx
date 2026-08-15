import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { fmtTime } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";

/** Journal widget — vandaag's momenten en open threads. */
export default function JournalWidget() {
  const { openModule } = usePanel();
  const { data: entries, loading } = useEntityList("JournalEntry", { realtime: true, sort: "-date" });

  const today = useMemo(() => {
    const d = new Date().toDateString();
    return (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === d);
  }, [entries]);

  const moments = useMemo(() => today.filter((e) => e.type === "moment" || e.type === "highlight"), [today]);
  const openThreads = useMemo(() => (entries || []).filter((e) => e.type === "thread" && !e.is_highlight).length, [entries]);
  const lastUpdate = useMemo(() => (entries || [])[0], [entries]);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfjournal")} className="min-h-[200px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.selfJournal} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/65 via-charcoal/35 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Journal</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: SAGE }}>TODAY</span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-3">
            <p className="text-[26px] font-display font-semibold tracking-[-0.02em] leading-[1.05]">{moments.length} meaningful moments</p>
            {openThreads > 0 && <p className="text-sm text-ivory/60 mt-2">{openThreads} open thread{openThreads > 1 ? "s" : ""}</p>}
          </div>

          <div className="pt-2 border-t border-ivory/10 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wide text-ivory/55">Last update</span>
            <span className="text-[11px] font-medium text-ivory/70">{fmtTime(lastUpdate?.date)}</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}