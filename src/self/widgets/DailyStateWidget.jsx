import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { stateColor, stateLabel, energyColor, levelLabel, fmtTime } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Daily State widget — visuele samenvatting van de actuele persoonlijke toestand. */
export default function DailyStateWidget() {
  const { openModule } = usePanel();
  const { data: checkIns, loading } = useEntityList("SelfCheckIn", { realtime: true, sort: "-timestamp", limit: 1 });

  const latest = useMemo(() => (checkIns || [])[0], [checkIns]);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfdailystate")} className="min-h-[200px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.selfDailyState} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/65 via-charcoal/35 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Daily State</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: SAGE }}>CURRENT</span>
          </div>

          {/* Central state indicator */}
          <div className="flex-1 flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ background: stateColor(latest?.state) }} />
              <span className="h-px w-8" style={{ background: "rgba(255,255,255,0.2)" }} />
              <span className="h-2 w-2 rounded-full" style={{ background: stateColor(latest?.state) }} />
            </div>
            <p className="text-[22px] font-display font-semibold tracking-[-0.02em] mt-2">{latest ? stateLabel(latest.state) : "—"}</p>
          </div>

          {/* Energy + Capacity bars */}
          <div className="space-y-2.5 pt-2 border-t border-ivory/10">
            <Bar label="Energy" value={latest?.energy} />
            <Bar label="Capacity" value={latest?.capacity} />
            {latest?.needs?.[0] && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] uppercase tracking-wide text-ivory/55">Need</span>
                <span className="text-[11px] font-medium" style={{ color: URGENT }}>{latest.needs[0]}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wide text-ivory/55">Last check-in</span>
              <span className="text-[11px] font-medium text-ivory/70">{fmtTime(latest?.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

function Bar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] uppercase tracking-wide text-ivory/55">{label}</span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: energyColor(value) }}>{value != null ? `${value}%` : "—"}</span>
      </div>
      <div className="h-1.5 rounded-full bg-ivory/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value || 0}%`, background: energyColor(value) }} />
      </div>
    </div>
  );
}