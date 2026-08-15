import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtDate } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Therapy — breed & laag (2×1). Horizontale voortgangstijdlijn + foto rechts. */
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
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selftherapy")} className="min-h-[140px]" style={{ "--tile-accent": PLUM }}>
      <div className="flex h-full gap-2.5 p-2.5" style={{ color: PLUM }}>
        <div className="flex-1 flex flex-col min-w-0">
          <WidgetHeader label="Therapy" count={`${active} actief`} />
          <div className="flex items-end justify-between mt-0.5">
            <div>
              <h3 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">TRAJECT</h3>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1">volgende · {next}</p>
            </div>
            <CountUp value={avg} className="text-[40px] leading-none font-display font-semibold tabular-nums" />
          </div>

          <div className="mt-2.5 relative h-8 flex items-center">
            <div className="absolute left-0 right-0 h-1 rounded-full" style={{ background: SAGE }} />
            <motion.div className="absolute left-0 h-1 rounded-full" style={{ background: PLUM }} animate={{ width: `${avg}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
            {Array.from({ length: 6 }).map((_, i) => {
              const at = (i / 5) * 100;
              const reached = avg >= at;
              return (
                <motion.span key={i} className="absolute -translate-x-1/2 h-3 w-3 rounded-full" style={{ left: `${at}%`, background: reached ? PLUM : "#fff", border: `2px solid ${reached ? PLUM : SAGE}` }} animate={{ scale: reached ? 1.05 : 0.7 }} />
              );
            })}
          </div>

          <div className="flex-1" />
          <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: PLUM_FAINT }}>
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-60">{active} traject · {goals} doelen</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selftherapy"); }} className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
          </div>
        </div>

        <div className="w-[28%] shrink-0 rounded-xl overflow-hidden">
          <img src={SELF_PHOTO.therapy} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </WidgetShell>
  );
}