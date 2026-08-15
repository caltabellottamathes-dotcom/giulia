import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { stateLabel, fmtAgo } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Daily State — foto BOVEN als ronde kaart, infographic eronder in glas.
 *  Grote energiekolom + capacity-boog + 8-punts timeline (levend). */
export default function DailyStateEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { realtime: true, sort: "-timestamp", limit: 12, externalTick: learnTick });

  const latest = (checkIns || [])[0];
  const m = MOCK.dailyState;
  const state = latest?.state || m.state;
  const energy = latest?.energy ?? m.energy;
  const capacity = latest?.capacity ?? m.capacity;
  const need = latest?.needs?.[0] || m.need;
  const headline = state === "calm" ? "IN RHYTHM" : state === "charged" ? "CHARGED" : state === "overwhelmed" ? "OVERLOAD" : state === "low" ? "DEPLETED" : "STEADY";

  const recent = useMemo(() => {
    const a = Array.from({ length: 8 }, () => null);
    (checkIns || []).slice(0, 8).forEach((c, i) => { a[7 - i] = c.energy ?? 0; });
    if (!checkIns?.length) m.timeline.forEach((v, i) => { a[i] = v; });
    return a;
  }, [checkIns]);

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfdailystate")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full gap-3 p-3" style={{ color: PLUM }}>
        {/* foto — 4 ronde hoeken, geen overlay */}
        <div className="rounded-2xl overflow-hidden h-[32%] shrink-0">
          <img src={SELF_PHOTO.dailyState} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <WidgetHeader label="Daily State" count={latest ? fmtAgo(latest.timestamp) : "07:12"} />
          <h3 className="text-[26px] leading-[0.98] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1">{stateLabel(state)}</p>

          <div className="mt-3 flex items-stretch gap-3 flex-1 min-h-0">
            {/* energiekolom */}
            <div className="relative w-4 rounded-full overflow-hidden" style={{ background: PLUM_FAINT }}>
              <motion.div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ background: PLUM }} initial={{ height: 0 }} animate={{ height: `${energy}%` }} transition={{ duration: 1.1, ease: "easeOut" }} />
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">Energy</p>
                <span className="text-[52px] leading-none font-display font-semibold tabular-nums">{energy}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">Capacity</p>
                  <span className="text-[11px] tabular-nums font-semibold">{capacity}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: SAGE }}>
                  <motion.div className="h-full rounded-full" style={{ background: PLUM }} animate={{ width: `${capacity}%` }} transition={{ duration: 1.1 }} />
                </div>
              </div>
            </div>
          </div>

          {/* 8-punts timeline — levend */}
          <div className="mt-3 flex items-end gap-1.5 h-12">
            {recent.map((v, i) => (
              <motion.span key={i} className="flex-1 rounded-full" style={{ background: PLUM }} animate={{ height: v != null ? `${Math.max(12, (v / 100) * 100)}%` : "12%", opacity: v != null ? 0.9 : 0.18 }} transition={{ duration: 0.8, delay: i * 0.05 }} />
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between pt-2 border-t" style={{ borderColor: PLUM_FAINT }}>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-60">need · <span className="font-semibold">{need}</span></p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfdailystate"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}