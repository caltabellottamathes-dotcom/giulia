import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import FloatPhoto from "./FloatPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { stateLabel, fmtAgo } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, MOCK } from "./selfEditorial";

const track = "rgba(48,23,40,0.14)";

/** Daily State — foto als rechterregio. Verticale energiekolom + capacity. */
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
    const a = Array.from({ length: 6 }, () => null);
    if (checkIns?.length) checkIns.slice(0, 6).forEach((c, i) => { a[5 - i] = c.energy ?? 0; });
    else m.timeline.forEach((v, i) => { a[i] = v; });
    return a;
  }, [checkIns]);

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfdailystate")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-row h-full p-3 gap-3" style={{ color: PLUM }}>
        <div className="flex-1 p-2 flex flex-col min-w-0">
          <WidgetHeader label="Daily State" count={latest ? fmtAgo(latest.timestamp) : "07:12"} />
          <h3 className="text-[26px] leading-[0.98] font-display font-semibold tracking-[-0.03em]">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1.5">{stateLabel(state)}</p>

          <div className="mt-4 flex items-stretch gap-3 flex-1 min-h-0">
            <div className="relative w-3 rounded-full overflow-hidden" style={{ background: track }}>
              <motion.div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ background: PLUM }} initial={{ height: 0 }} animate={{ height: `${energy}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">Energy</p>
                <span className="text-[42px] leading-none font-display font-semibold tabular-nums">{energy}</span>
              </div>
              <div className="mt-2">
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mb-1">Capacity {capacity}%</p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: track }}>
                  <motion.div className="h-full rounded-full" style={{ background: PLUM }} animate={{ width: `${capacity}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {recent.map((v, i) => (
              <span key={i} className="flex-1 h-1.5 rounded-full" style={{ background: v != null ? PLUM : track, opacity: v != null ? 0.85 : 0.4 }} />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between pt-3 border-t border-black/10">
            <span className="text-[9px] uppercase tracking-[0.2em] opacity-55">need · {need}</span>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfdailystate"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: PLUM, color: "#f2f2f0" }}>Open</button>
          </div>
        </div>
        <FloatPhoto src={SELF_PHOTO.dailyState} className="w-24 h-full" />
      </div>
    </WidgetShell>
  );
}