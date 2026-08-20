import React, { useMemo } from "react";
import { motion } from "framer-motion";
import GlassPhotoCard, { BURG, SAGE_SOFT } from "./GlassPhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/279df6556_A_striking_composition_of_graphic_202606262301.jpeg";
const ACTIVE = ["in_progress", "planning", "review", "afwerking", "waiting"];

/** ProjectsGlass — glas-groot + foto-klein: actieve count + voortgang. · 4:3 */
export default function ProjectsGlass() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Project", { sort: "-last_activity_date", limit: 50, externalTick: learnTick });
  const active = useMemo(() => (data || []).filter((p) => ACTIVE.includes(p.status)).slice(0, 3), [data]);
  return (
    <GlassPhotoCard photo={PHOTO} onClick={() => openModule("projects")} aspectRatio="4 / 3" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What I'm Building.</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">BOUWEN</h3></>}>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-[34px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{active.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">actief</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {active.map((p, i) => (
          <div key={p.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium truncate flex-1">{p.title}</span>
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: BURG }}>{Math.round(p.progress || 0)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(45,45,45,0.10)" }}>
              <motion.div className="h-full rounded-full" style={{ background: i === 0 ? BURG : SAGE_SOFT }} initial={{ width: 0 }} animate={{ width: `${p.progress || 0}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: "easeOut" }} />
            </div>
          </div>
        ))}
        {!active.length && <p className="text-[12px] opacity-60 py-1">Geen actieve projecten.</p>}
      </div>
    </GlassPhotoCard>
  );
}