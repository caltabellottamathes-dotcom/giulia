import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { fmtDate } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";

/** Therapy widget — actieve trajecten en volgende afspraak. */
export default function TherapyWidget() {
  const { openModule } = usePanel();
  const { data: trajectories, loading } = useEntityList("TherapyTrajectory", { realtime: true });

  const active = useMemo(() => (trajectories || []).filter((t) => t.status === "active"), [trajectories]);
  const openGoals = useMemo(() => active.reduce((n, t) => n + (t.goals?.length || 0), 0), [active]);
  const next = useMemo(() => {
    return active
      .filter((t) => t.next_appointment)
      .sort((a, b) => new Date(a.next_appointment) - new Date(b.next_appointment))[0];
  }, [active]);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selftherapy")} className="min-h-[200px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.selfTherapy} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/65 via-charcoal/35 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Therapy</h3>
            {active.length > 0 && <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: SAGE }}>{active.length} actief</span>}
          </div>

          <div className="flex-1 flex flex-col justify-center py-3">
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin self-center" />
            ) : next ? (
              <>
                <p className="text-[22px] font-display font-semibold tracking-[-0.02em] leading-tight">{next.title}</p>
                <p className="text-sm text-ivory/60 mt-1.5">Next · {fmtDate(next.next_appointment)}</p>
              </>
            ) : active.length ? (
              <>
                <p className="text-[22px] font-display font-semibold tracking-[-0.02em] leading-tight">{active.length} trajecten</p>
                <p className="text-sm text-ivory/60 mt-1.5">Geen afspraak gepland</p>
              </>
            ) : (
              <p className="text-sm italic text-ivory/45">Geen actieve trajecten.</p>
            )}
          </div>

          <div className="pt-2 border-t border-ivory/10 grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-ivory/55">Open goals</p>
              <p className="text-lg font-display font-semibold tabular-nums" style={{ color: SAGE }}>{openGoals}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-ivory/55">Trajecten</p>
              <p className="text-lg font-display font-semibold tabular-nums text-ivory/70">{active.length}</p>
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}