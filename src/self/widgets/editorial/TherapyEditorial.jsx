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
import { SELF_PHOTO, PLUM, MOCK } from "./selfEditorial";

const track = "rgba(48,23,40,0.14)";

/** Therapy — foto OVER glas (foto links, volle hoogte). Horizontale
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
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selftherapy")} className="min-h-[200px] sm:col-span-2" style={{ "--tile-accent": PLUM, overflow: "visible" }}>
      <FloatPhoto src={SELF_PHOTO.therapy} edge="left" size="w-28" className="z-20" />
      <div className="relative z-10 h-full p-5 pl-24 flex flex-col" style={{ color: PLUM }}>
        <WidgetHeader label="Therapy" count={`${active} actief`} />
        <div className="flex items-end justify-between mt-1">
          <div>
            <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">TRAJECT</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1.5">volgende · {next}</p>
          </div>
          <CountUp value={avg} className="text-[52px] leading-none font-display font-semibold tabular-nums" />
        </div>

        <div className="mt-5 relative h-10 flex items-center">
          <div className="absolute left-0 right-0 h-px" style={{ background: track }} />
          <motion.div className="absolute left-0 h-[2px]" style={{ background: PLUM }} animate={{ width: `${avg}%` }} transition={{ duration: 1.1, ease: "easeOut" }} />
          {Array.from({ length: 6 }).map((_, i) => {
            const at = (i / 5) * 100;
            const reached = avg >= at;
            return (
              <motion.span key={i} className="absolute -translate-x-1/2 h-3 w-3 rounded-full border-2" style={{ left: `${at}%`, background: reached ? PLUM : "rgba(48,23,40,0.18)", borderColor: reached ? PLUM : "rgba(48,23,40,0.25)" }} animate={{ scale: reached ? 1 : 0.7 }} />
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="flex items-center justify-between pt-3 border-t border-black/10">
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">{active} traject · {goals} doelen</p>
          <button onClick={(e) => { e.stopPropagation(); openModule("selftherapy"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: PLUM, color: "#f2f2f0" }}>Open</button>
        </div>
      </div>
    </WidgetShell>
  );
}