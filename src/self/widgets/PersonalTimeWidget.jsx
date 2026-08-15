import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { totalPersonalTimeToday, sumPersonalTime, fmtDuration, timeBlockColor } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";

/** Personal Time widget — beschermde tijd vandaag met breakdown. */
export default function PersonalTimeWidget() {
  const { openModule } = usePanel();
  const { data: blocks, loading } = useEntityList("PersonalTimeBlock", { realtime: true });

  const total = useMemo(() => totalPersonalTimeToday(blocks || []), [blocks]);
  const rest = useMemo(() => sumPersonalTime(blocks?.filter((b) => {
    if (!b.start) return false;
    return new Date(b.start).toDateString() === new Date().toDateString();
  }), "rest"), [blocks]);
  const free = useMemo(() => sumPersonalTime(blocks?.filter((b) => {
    if (!b.start) return false;
    return new Date(b.start).toDateString() === new Date().toDateString();
  }), "free"), [blocks]);
  const recovery = useMemo(() => sumPersonalTime(blocks?.filter((b) => {
    if (!b.start) return false;
    return new Date(b.start).toDateString() === new Date().toDateString();
  }), "recovery"), [blocks]);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfpersonaltime")} className="min-h-[200px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.selfPersonalTime} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/65 via-charcoal/35 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Personal Time</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: SAGE }}>TODAY</span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-3">
            <p className="text-[28px] font-display font-semibold tracking-[-0.02em] leading-[1.05]">{fmtDuration(total)}</p>
            <p className="text-sm text-ivory/60 mt-1">protected</p>
          </div>

          <div className="pt-2 border-t border-ivory/10 grid grid-cols-3 gap-2">
            <MiniStat label="Rest" value={fmtDuration(rest)} color={timeBlockColor("rest")} />
            <MiniStat label="Free" value={fmtDuration(free)} color={timeBlockColor("free")} />
            <MiniStat label="Recovery" value={fmtDuration(recovery)} color={timeBlockColor("recovery")} />
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-ivory/55">{label}</p>
      <p className="text-sm font-semibold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}