import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import FloatPhoto from "./FloatPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtDate } from "@/lib/selfUtils";
import { SELF_PHOTO, CONTRAST, CONCRETE, MOCK } from "./selfEditorial";

/** Therapy — standaardglas + zwevende foto-kaart rechtsonder. Horizontale
 *  voortgangstijdlijn met doel-nodes. */
export default function TherapyEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: trajectories } = useEntityList("TherapyTrajectory", { realtime: true, externalTick: learnTick });

  const liveActive = (trajectories || []).filter((t) => t.status === "active");
  const active = liveActive.length ? liveActive.length : MOCK.therapy.active;
  const avg = liveActive.length ? Math.round(liveActive.reduce((s, t) => s + (t.progress || 0), 0) / liveActive.length) : MOCK.therapy.avg;
  const next = useMemo(() => {
    const now = Date.now();
    const n = (trajectories || []).filter((t) => t.next_appointment && new Date(t.next_appointment).getTime() > now).sort((a, b) => new Date(a.next_appointment) - new Date(b.next_appointment))[0];
    return n ? fmtDate(n.next_appointment) : MOCK.therapy.next;
  }, [trajectories]);
  const goals = liveActive.reduce((s, t) => s + (t.goals?.length || 0), 0) || MOCK.therapy.goals;

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selftherapy")} className="min-h-[200px] sm:col-span-2" style={{ "--tile-accent": CONTRAST, overflow: "visible" }}>
      <div className="relative z-10 h-full p-5 pb-20 pr-24 flex flex-col text-ivory">
        <WidgetHeader label="Therapy" count={`${active} actief`} />
        <div className="flex items-end justify-between mt-1">
          <div>
            <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">TRAJECT</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-65 mt-1.5">volgende · {next}</p>
          </div>
          <CountUp value={avg} className="text-[52px] leading-none font-display font-semibold tabular-nums" />
        </div>

        <div className="mt-5 relative h-10 flex items-center">
          <div className="absolute left-0 right-0 h-px" style={{ background: CONCRETE, opacity: 0.4 }} />
          <motion.div className="absolute left-0 h-px" style={{ background: CONTRAST }} animate={{ width: `${avg}%` }} transition={{ duration: 1.1, ease: "easeOut" }} />
          {Array.from({ length: 6 }).map((_, i) => {
            const at = (i / 5) * 100;
            const reached = avg >= at;
            return (
              <motion.span key={i} className="absolute -translate-x-1/2 h-3 w-3 rounded-full" style={{ left: `${at}%`, background: reached ? CONTRAST : "rgba(255,255,255,0.28)", border: "2px solid rgba(255,255,255,0.2)" }} animate={{ scale: reached ? 1 : 0.7 }} />
            );
          })}
        </div>
        <div className="flex-1" />
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-65 border-t border-ivory/10 pt-3">{active} traject · {goals} doelen</p>
      </div>

      <FloatPhoto src={SELF_PHOTO.therapy} stick="bottom-right" overlay="linear-gradient(180deg, rgba(48,23,40,0.05), rgba(48,23,40,0.60))">
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <button onClick={(e) => { e.stopPropagation(); openModule("selftherapy"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
        </div>
      </FloatPhoto>
    </WidgetShell>
  );
}