import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtAgo } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Daily State — smal & hoog (1×2). Foto boven, energiekolom + timeline eronder. */
export default function DailyStateEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { realtime: true, sort: "-timestamp", limit: 12, externalTick: learnTick });

  const latest = (checkIns || [])[0];
  const m = MOCK.dailyState;
  const state = latest?.state || m.state;
  const energy = latest?.energy ?? m.energy;
  const capacity = latest?.capacity ?? m.capacity;
  const headline = state === "calm" ? "IN RHYTHM" : state === "charged" ? "CHARGED" : state === "overwhelmed" ? "OVERLOAD" : state === "low" ? "DEPLETED" : "STEADY";

  const recent = useMemo(() => {
    const a = Array.from({ length: 8 }, () => null);
    (checkIns || []).slice(0, 8).forEach((c, i) => { a[7 - i] = c.energy ?? 0; });
    if (!checkIns?.length) m.timeline.forEach((v, i) => { a[i] = v; });
    return a;
  }, [checkIns]);

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("dailystate")} className="min-h-[210px]" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full gap-2 p-2.5" style={{ color: PLUM }}>
        <div className="rounded-xl overflow-hidden h-14 shrink-0">
          <img src={SELF_PHOTO.dailyState} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <WidgetHeader label="How I'm Doing." count={latest ? fmtAgo(latest.timestamp) : "07:12"} />
          <h3 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">{headline}</h3>

          <div className="mt-2 flex items-stretch gap-2 flex-1 min-h-0">
            <div className="relative w-3 rounded-full overflow-hidden" style={{ background: PLUM_FAINT }}>
              <motion.div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ background: PLUM }} initial={{ height: 0 }} animate={{ height: `${energy}%` }} transition={{ duration: 1.1, ease: "easeOut" }} />
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div>
                <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">Energy</p>
                <span className="text-[34px] leading-none font-display font-semibold tabular-nums">{energy}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">Capacity</p>
                  <span className="text-[10px] tabular-nums font-semibold">{capacity}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: SAGE }}>
                  <motion.div className="h-full rounded-full" style={{ background: PLUM }} animate={{ width: `${capacity}%` }} transition={{ duration: 1.1 }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-end gap-1 h-7">
            {recent.map((v, i) => (
              <motion.span key={i} className="flex-1 rounded-full" style={{ background: PLUM }} animate={{ height: v != null ? `${Math.max(20, v)}%` : "20%", opacity: v != null ? 0.9 : 0.18 }} transition={{ duration: 0.8, delay: i * 0.05 }} />
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}