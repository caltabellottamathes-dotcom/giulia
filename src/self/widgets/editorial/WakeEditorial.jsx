import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

const PHASES = ["Ontwaken", "Oriënt", "Ritueel", "Opstaan"];

/** Wake — foto BOVEN (groter), fase-ladder eronder in glas. */
export default function WakeEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true, externalTick: learnTick });

  const morning = useMemo(() => (routines || []).filter((r) => (r.preferred_time || "").toLowerCase() === "morning" && r.status !== "archived" && r.status !== "paused"), [routines]);
  const total = morning.length || MOCK.wake.total;
  const done = morning.filter((r) => r.status === "completed").length || MOCK.wake.done;
  const steps = Math.round((done / total) * PHASES.length);
  const pct = Math.round((done / total) * 100);
  const headline = steps >= PHASES.length ? "KLAAR" : steps > 0 ? "ONTWAKEN" : "SLAAP";
  const lastDone = morning.find((r) => r.last_done)?.last_done ? new Date(morning.find((r) => r.last_done).last_done).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : MOCK.wake.lastDone;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfwake")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full gap-3 p-3" style={{ color: PLUM }}>
        {/* foto boven, groter */}
        <div className="rounded-2xl overflow-hidden h-[40%] shrink-0">
          <img src={SELF_PHOTO.wake} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <WidgetHeader label="Wake" count={lastDone} />
          <h3 className="text-[26px] leading-[0.98] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1">{done}/{total} ochtendstappen · {pct}%</p>

          {/* fase-ladder */}
          <div className="mt-4 flex-1 flex flex-col justify-between gap-2 min-h-0">
            {PHASES.map((p, i) => {
              const filled = i < steps;
              return (
                <div key={p} className="flex items-center gap-3">
                  <motion.span className="h-3.5 w-3.5 rounded-full shrink-0" animate={{ scale: filled ? 1.1 : 0.8 }} style={{ background: filled ? PLUM : PLUM_FAINT, border: filled ? "none" : `1.5px solid ${SAGE}` }} />
                  <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ opacity: filled ? 0.95 : 0.5 }}>{p}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: SAGE }}>
                    <motion.div className="h-full rounded-full" style={{ background: PLUM }} animate={{ width: filled ? "100%" : "0%" }} transition={{ duration: 0.7, delay: i * 0.1 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: PLUM_FAINT }}>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-60">drempel · ochtend</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfwake"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}