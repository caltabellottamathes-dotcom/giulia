import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { todayRoutines, completedToday, routineStatusColor } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Routines widget — vandaag relevante routines met voortgang dots. */
export default function RoutinesWidget() {
  const { openModule } = usePanel();
  const { data: routines, loading } = useEntityList("SelfRoutine", { realtime: true });

  const today = useMemo(() => todayRoutines(routines || []), [routines]);
  const done = useMemo(() => completedToday(routines || []), [routines]);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfroutines")} className="min-h-[200px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.selfRoutines} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/65 via-charcoal/35 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Routines</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold tabular-nums" style={{ color: SAGE }}>{done.length} / {today.length || 0}</span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-1.5 py-3">
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin self-center" />
            ) : today.length ? (
              today.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: r.status === "completed" ? SAGE : "transparent", border: r.status === "completed" ? "none" : "1px solid rgba(255,255,255,0.3)" }} />
                  <span className={`text-sm font-medium ${r.status === "completed" ? "text-ivory/50 line-through" : "text-ivory/90"}`}>{r.title}</span>
                </div>
              ))
            ) : (
              <p className="text-sm italic text-ivory/45">Geen routines vandaag.</p>
            )}
          </div>

          <div className="pt-2 border-t border-ivory/10 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wide text-ivory/55">Progress</span>
            <div className="flex gap-1">
              {today.length > 0 ? today.slice(0, 6).map((r, i) => (
                <span key={i} className="h-1.5 w-4 rounded-full" style={{ background: r.status === "completed" ? SAGE : "rgba(255,255,255,0.15)" }} />
              )) : <span className="text-[11px] text-ivory/40">—</span>}
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}