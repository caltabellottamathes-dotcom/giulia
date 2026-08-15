import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, CONTRAST, CONCRETE, PLUM_GLASS, MOCK } from "./selfEditorial";

const PHASES = ["Ontwaken", "Oriënt", "Ritueel", "Opstaan"];

/** Wake — foto BOVEN als brede band, glas-content zweeft er deels over.
 *  Verticale fase-ladder. */
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
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfwake")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": CONTRAST, background: "transparent" }}>
      <div className="relative h-full rounded-[inherit] overflow-hidden flex flex-col text-ivory">
        {/* fotoband boven, groter dan een strip */}
        <div className="relative h-[44%] shrink-0">
          <img src={SELF_PHOTO.wake} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(48,23,40,0.25), rgba(48,23,40,0.95))" }} />
          <div className="relative z-10 p-4">
            <WidgetHeader label="Wake" count={lastDone} />
            <h3 className="text-[26px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-1.5">{done}/{total} ochtendstappen</p>
          </div>
        </div>

        {/* glas-content zweeft er deels overheen */}
        <div className="flex-1 -mt-6 relative z-10 p-5 flex flex-col" style={{ background: PLUM_GLASS, backdropFilter: "blur(22px) saturate(1.3)", WebkitBackdropFilter: "blur(22px) saturate(1.3)" }}>
          <div className="flex-1 flex flex-col justify-between gap-2.5">
            {PHASES.map((p, i) => {
              const filled = i < steps;
              return (
                <div key={p} className="flex items-center gap-3">
                  <motion.span className="h-3 w-3 rounded-full shrink-0" animate={{ scale: filled ? 1.1 : 0.85, opacity: filled ? 1 : 0.4 }} style={{ background: filled ? CONTRAST : "rgba(255,255,255,0.25)" }} />
                  <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ opacity: filled ? 0.95 : 0.5 }}>{p}</span>
                  <div className="flex-1 h-px" style={{ background: filled ? CONCRETE : "rgba(255,255,255,0.14)" }} />
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-ivory/10">
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-60">drempel · ochtend</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfwake"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}