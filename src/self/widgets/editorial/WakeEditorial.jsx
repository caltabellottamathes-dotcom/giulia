import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import FloatPhoto from "./FloatPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, MOCK } from "./selfEditorial";

const track = "rgba(48,23,40,0.14)";
const PHASES = ["Ontwaken", "Oriënt", "Ritueel", "Opstaan"];

/** Wake — foto als bovenste regio. Verticale fase-ladder. */
export default function WakeEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true, externalTick: learnTick });

  const morning = useMemo(() => (routines || []).filter((r) => (r.preferred_time || "").toLowerCase() === "morning" && r.status !== "archived" && r.status !== "paused"), [routines]);
  const liveDone = morning.filter((r) => r.status === "completed").length;
  const total = morning.length || MOCK.wake.total;
  const done = liveDone || MOCK.wake.done;
  const steps = Math.round((done / total) * PHASES.length);
  const headline = steps >= PHASES.length ? "KLAAR" : steps > 0 ? "ONTWAKEN" : "SLAAP";
  const lastDone = morning.find((r) => r.last_done)?.last_done ? new Date(morning.find((r) => r.last_done).last_done).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : MOCK.wake.lastDone;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfwake")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-3" style={{ color: PLUM }}>
        <FloatPhoto src={SELF_PHOTO.wake} className="h-28 w-full" />
        <div className="flex-1 p-2 flex flex-col min-h-0">
          <WidgetHeader label="Wake" count={lastDone} />
          <h3 className="text-[24px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1.5">{done}/{total} ochtendstappen</p>

          <div className="mt-4 flex-1 flex flex-col justify-between gap-2.5 min-h-0">
            {PHASES.map((p, i) => {
              const filled = i < steps;
              return (
                <div key={p} className="flex items-center gap-3">
                  <motion.span className="h-3 w-3 rounded-full shrink-0" animate={{ scale: filled ? 1.1 : 0.85, opacity: filled ? 1 : 0.4 }} style={{ background: filled ? PLUM : track }} />
                  <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ opacity: filled ? 0.95 : 0.5 }}>{p}</span>
                  <div className="flex-1 h-px" style={{ background: filled ? PLUM : track }} />
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-end pt-3 border-t border-black/10">
            <button onClick={(e) => { e.stopPropagation(); openModule("selfwake"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: PLUM, color: "#f2f2f0" }}>Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}