import React, { useMemo } from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

const ACTIVE = ["in_progress", "planning", "review", "afwerking", "waiting"];

/** ProjectsPhotoCard — grote foto + glas-kaart met actieve count + voortgang. · 4:3 */
export default function ProjectsPhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Project", { sort: "-last_activity_date", limit: 50, externalTick: learnTick });
  const active = useMemo(() => (data || []).filter((p) => ACTIVE.includes(p.status)).slice(0, 3), [data]);
  return (
    <PhotoCard photo={SELF_PHOTO.development} onClick={() => openModule("projects")} aspectRatio="4 / 3" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">What I'm Building.</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">BOUWEN</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[36px] font-display font-semibold tabular-nums leading-none" style={{ color: SAGE }}>{active.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 pb-1">actief</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {active.map((p, i) => (
          <div key={p.id}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-medium truncate flex-1">{p.title}</span>
              <span className="text-[9px] font-semibold tabular-nums" style={{ color: SAGE }}>{Math.round(p.progress || 0)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
              <motion.div className="h-full rounded-full" style={{ background: i === 0 ? SAGE : PLUM }} initial={{ width: 0 }} animate={{ width: `${p.progress || 0}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: "easeOut" }} />
            </div>
          </div>
        ))}
        {!active.length && <p className="text-[11px] opacity-60 py-1">Geen actieve projecten.</p>}
      </div>
    </PhotoCard>
  );
}