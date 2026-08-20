import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, SAGE_SOFT } from "./FilledGlassCard";
import { ClockArc, Sparkline } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { dayStartIso } from "@/self/widgets/editorial5/helpers";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/125b8e087_A_high-contrast_medium_shot_of_2026062702281.jpeg";

/** TimeTrackerFilled — klok-boog (vandaag) + week-sparkline. · 16:9 */
export default function TimeTrackerFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("TimeEntry", { sort: "-start_time", limit: 300, externalTick: learnTick });
  const today = useMemo(() => (data || []).filter((e) => e.start_time && new Date(e.start_time) >= new Date(dayStartIso())), [data]);
  const todayMin = today.reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const weekMin = useMemo(() => { const ws = Date.now() - 7 * 86400000; return (data || []).filter((e) => e.start_time && new Date(e.start_time).getTime() > ws).reduce((s, e) => s + (e.duration_minutes || 0), 0); }, [data]);
  const weekTrend = useMemo(() => { const arr = Array(7).fill(0); const ws = Date.now() - 7 * 86400000; (data || []).forEach((e) => { const t = e.start_time && new Date(e.start_time).getTime(); if (t > ws) { arr[Math.min(6, Math.floor((t - ws) / 86400000))] += (e.duration_minutes || 0); } }); return arr; }, [data]);
  const running = (data || []).find((e) => e.status === "running");
  const pct = Math.min(100, (todayMin / 480) * 100);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("timetracker")} aspectRatio="16 / 9" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Where My Time Goes.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">TIJD</h3></>}>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: 78, height: 78 }}>
          <ClockArc pct={pct} size={78} color={BURG} stroke={7} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-[20px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>{(todayMin / 60).toFixed(1)}<span className="text-[11px]">u</span></motion.span>
            <span className="text-[7px] uppercase tracking-wider opacity-55">vandaag</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-end justify-between mb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] opacity-55">deze week</span>
            <span className="text-[18px] font-display font-semibold tabular-nums" style={{ color: SAGE_SOFT }}>{(weekMin / 60).toFixed(1)}u</span>
          </div>
          <Sparkline points={weekTrend} color={SAGE_SOFT} w={200} h={32} />
        </div>
      </div>
      {running && <motion.div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium" style={{ color: BURG }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
        <span className="h-2 w-2 rounded-full" style={{ background: BURG }} />lopend · {running.task_title || running.project_title || "timer"}
      </motion.div>}
    </FilledGlassCard>
  );
}