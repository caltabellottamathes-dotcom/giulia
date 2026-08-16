import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

const PHASES = ["Ontwaken", "Oriënt", "Ritueel", "Opstaan"];

/** Wake — smal & hoog (1×2). Foto boven, fase-ladder eronder. */
export default function WakeEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true, externalTick: learnTick });

  const morning = useMemo(() => (routines || []).filter((r) => (r.preferred_time || "").toLowerCase() === "morning" && r.status !== "archived" && r.status !== "paused"), [routines]);
  const total = morning.length || MOCK.wake.total;
  const done = morning.filter((r) => r.status === "completed").length || MOCK.wake.done;
  const steps = Math.round((done / total) * PHASES.length);
  const headline = steps >= PHASES.length ? "KLAAR" : steps > 0 ? "ONTWAKEN" : "SLAAP";
  const lastDone = morning.find((r) => r.last_done)?.last_done ? new Date(morning.find((r) => r.last_done).last_done).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : MOCK.wake.lastDone;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfwake")} className="min-h-[210px]" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full gap-2 p-2.5" style={{ color: PLUM }}>
        <div className="rounded-xl overflow-hidden h-14 shrink-0">
          <img src={SELF_PHOTO.wake} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <WidgetHeader label="Wake" count={lastDone} />
          <h3 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-0.5">{headline}</h3>

          <div className="mt-2.5 flex-1 flex flex-col justify-between gap-1.5 min-h-0">
            {PHASES.map((p, i) => {
              const filled = i < steps;
              return (
                <div key={p} className="flex items-center gap-2">
                  <motion.span className="h-3 w-3 rounded-full shrink-0" animate={{ scale: filled ? 1.1 : 0.8 }} style={{ background: filled ? PLUM : PLUM_FAINT, border: filled ? "none" : `1.5px solid ${SAGE}` }} />
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ opacity: filled ? 0.95 : 0.5 }}>{p}</span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: SAGE }}>
                    <motion.div className="h-full rounded-full" style={{ background: PLUM }} animate={{ width: filled ? "100%" : "0%" }} transition={{ duration: 0.7, delay: i * 0.1 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}