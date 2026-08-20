import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { dayStartIso } from "@/self/widgets/editorial5/helpers";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/125b8e087_A_high-contrast_medium_shot_of_2026062702281.jpeg";

/** TimeTrackerFilled — glas-groot + foto-klein: uren vandaag + week + lopend. · 16:9 */
export default function TimeTrackerFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("TimeEntry", { sort: "-start_time", limit: 300, externalTick: learnTick });
  const today = useMemo(() => (data || []).filter((e) => e.start_time && new Date(e.start_time) >= new Date(dayStartIso())), [data]);
  const week = useMemo(() => { const ws = Date.now() - 7 * 86400000; return (data || []).filter((e) => e.start_time && new Date(e.start_time).getTime() > ws); }, [data]);
  const todayMin = today.reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const weekMin = week.reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const running = (data || []).find((e) => e.status === "running");
  const [hrs, setHrs] = useState(0);
  useEffect(() => { const t = setTimeout(() => setHrs(todayMin / 60), 200); return () => clearTimeout(t); }, [todayMin]);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("timetracker")} aspectRatio="16 / 9" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Where My Time Goes.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">TIJD</h3></>}>
      <div className="flex items-end gap-3">
        <div>
          <motion.span className="text-[42px] font-display font-semibold tabular-nums leading-none block" style={{ color: BURG }} animate={{ opacity: [0.4, 1] }} transition={{ duration: 1 }}>{hrs.toFixed(1)}<span className="text-[18px]">u</span></motion.span>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1">vandaag</p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-[22px] font-display font-semibold tabular-nums leading-none block" style={{ color: SAGE_SOFT }}>{(weekMin / 60).toFixed(1)}u</span>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1">deze week</p>
        </div>
      </div>
      {running && <div className="mt-2 flex items-center gap-2 text-[11px] font-medium" style={{ color: BURG }}>
        <motion.span className="h-2 w-2 rounded-full" style={{ background: BURG }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
        lopend · {running.task_title || running.project_title || "timer"}
      </div>}
    </FilledGlassCard>
  );
}