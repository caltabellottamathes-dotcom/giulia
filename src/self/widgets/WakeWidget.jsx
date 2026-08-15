import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const SAGE = "hsl(var(--self-accent))";

const PHASES = ["wake", "orient", "routine", "getup"];

/** Wake widget — huidige wake phase en volgende stap. */
export default function WakeWidget() {
  const { openModule } = usePanel();
  const { data: sessions, loading } = useEntityList("WakeSession", { realtime: true, sort: "-created_date", limit: 1 });

  const latest = useMemo(() => (sessions || [])[0], [sessions]);
  const phase = latest?.phase || "orient";

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfwake")} className="min-h-[200px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.selfWake} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/65 via-charcoal/35 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Wake</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: SAGE }}>{phase.toUpperCase()}</span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-3">
            <p className="text-[26px] font-display font-semibold tracking-[-0.02em] leading-[1.05]">Good morning</p>
            {latest?.intention && <p className="text-sm text-ivory/60 mt-2 italic">"{latest.intention}"</p>}
          </div>

          <div className="pt-2 border-t border-ivory/10 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wide text-ivory/55">Next</span>
            <span className="text-[11px] font-medium text-ivory/70">
              {PHASES.indexOf(phase) < PHASES.length - 1 ? PHASES[PHASES.indexOf(phase) + 1] : "Klaar"}
            </span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}