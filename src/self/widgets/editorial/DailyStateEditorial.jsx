import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import FloatPhoto from "./FloatPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { stateLabel, energyColor, fmtAgo } from "@/lib/selfUtils";
import { SELF_PHOTO, CONTRAST, URGENT, CONCRETE, MOCK } from "./selfEditorial";

/** Daily State — standaardglas + zwevende foto-kaart onderaan. Verticale
 *  energiekolom + capacity-balk + 6-punts statustimeline. */
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
    if (checkIns?.length) (checkIns).slice(0, 6).forEach((c, i) => { a[5 - i] = c.energy ?? 0; });
    else m.timeline.forEach((v, i) => { a[i] = v; });
    return a;
  }, [checkIns]);

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfdailystate")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": CONTRAST, overflow: "visible" }}>
      <div className="relative z-10 h-full p-5 pb-20 flex flex-col text-ivory">
        <WidgetHeader label="Daily State" count={latest ? fmtAgo(latest.timestamp) : m.timeline && "07:12"} />
        <h3 className="text-[30px] leading-[0.98] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-1.5">{stateLabel(state)}</p>

        <div className="mt-4 flex items-stretch gap-4 flex-1 min-h-0">
          <div className="relative w-3 rounded-full bg-ivory/12 overflow-hidden">
            <motion.div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ background: energy < 30 ? URGENT : CONTRAST }} initial={{ height: 0 }} animate={{ height: `${energy}%` }} transition={{ duration: 1, ease: "easeOut" }} />
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">Energy</p>
              <span className="text-[48px] leading-none font-display font-semibold tabular-nums" style={{ color: energy < 30 ? URGENT : CONTRAST }}>{energy}</span>
            </div>
            <div className="mt-3">
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mb-1">Capacity {capacity}%</p>
              <div className="h-1.5 rounded-full bg-ivory/12 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: CONCRETE }} animate={{ width: `${capacity}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          {recent.map((v, i) => (
            <span key={i} className="flex-1 h-1.5 rounded-full" style={{ background: v != null ? (v < 30 ? URGENT : CONTRAST) : "rgba(255,255,255,0.15)", opacity: v != null ? 0.9 : 0.3 }} />
          ))}
        </div>
      </div>

      <FloatPhoto src={SELF_PHOTO.dailyState} stick="bottom">
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/75 font-semibold">need · <span style={{ color: URGENT }}>{need}</span></p>
          <button onClick={(e) => { e.stopPropagation(); openModule("selfdailystate"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
        </div>
      </FloatPhoto>
    </WidgetShell>
  );
}