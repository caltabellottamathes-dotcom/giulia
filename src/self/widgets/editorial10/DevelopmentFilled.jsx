import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, SAGE_SOFT } from "./FilledGlassCard";
import { ClockArc, OrbitDots } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/e4e763ca5_LIFE.jpeg";

/** DevelopmentFilled — voortgangs-boog + orbit-milestones. · 3:4 */
export default function DevelopmentFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("SelfGoal", { sort: "-updated_date", limit: 50, externalTick: learnTick });
  const active = useMemo(() => (data || []).filter((g) => g.status === "active").slice(0, 3), [data]);
  const avg = useMemo(() => active.length ? Math.round(active.reduce((s, g) => s + (g.progress || 0), 0) / active.length) : 0, [active]);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("development")} aspectRatio="3 / 4" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Becoming Me.</p><h3 className="text-[24px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">GROEI</h3></>}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative shrink-0" style={{ width: 84, height: 84 }}>
          <ClockArc pct={avg} size={84} color={BURG} stroke={7} />
          <div className="absolute inset-0 flex items-center justify-center">
            <OrbitDots n={active.length || 1} size={84} color={SAGE_SOFT} speed={20} />
            <span className="absolute text-[22px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{avg}%</span>
          </div>
        </div>
        <div>
          <motion.span className="text-[32px] font-display font-semibold tabular-nums leading-none block" style={{ color: BURG }} key={active.length} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>{active.length}</motion.span>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1">doelen</p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {active.map((g, i) => (
          <div key={g.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium truncate flex-1">{g.title}</span>
              <span className="text-[10px] font-semibold tabular-nums" style={{ color: BURG }}>{Math.round(g.progress || 0)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden relative" style={{ background: "rgba(45,45,45,0.10)" }}>
              <motion.div className="h-full rounded-full" style={{ background: i === 0 ? BURG : SAGE_SOFT }} initial={{ width: 0 }} animate={{ width: `${g.progress || 0}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: "easeOut" }} />
              <motion.span className="absolute top-1/2 h-3 w-3 rounded-full -translate-y-1/2" style={{ background: "#fff", border: `2px solid ${i === 0 ? BURG : SAGE_SOFT}` }} animate={{ left: `${g.progress || 0}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: "easeOut" }} />
            </div>
          </div>
        ))}
        {!active.length && <p className="text-[12px] opacity-60">Geen actieve doelen.</p>}
      </div>
    </FilledGlassCard>
  );
}