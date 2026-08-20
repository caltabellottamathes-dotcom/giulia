import React from "react";
import { motion } from "framer-motion";
import GlassPhotoCard, { BURG, INK, SAGE_SOFT } from "./GlassPhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ff0a104c5_A_graphic_minimalist_photograph_exploring_202606262301.jpeg";

/** TasksGlass — glas-groot + foto-klein: aandacht-teller + zachte pillen. · 1:1 */
export default function TasksGlass() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Task", { sort: "-updated_date", limit: 200, externalTick: learnTick });
  const active = (data || []).filter((t) => !["completed", "archived"].includes(t.status));
  const c = (s) => active.filter((t) => t.status === s).length;
  const attn = c("today") + c("overdue");
  const pills = [["vandaag", c("today")], ["over tijd", c("overdue")], ["komend", c("upcoming")]];
  return (
    <GlassPhotoCard photo={PHOTO} onClick={() => openModule("tasks")} aspectRatio="1 / 1" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">To Do!</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">TE DOEN</h3></>}>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-[44px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{attn}</span>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 pb-1.5">aandacht</p>
      </div>
      <div className="flex gap-2">
        {pills.map((p, i) => (
          <motion.div key={p[0]} className="flex-1 rounded-2xl px-2 py-2 text-center" style={{ background: i === 1 && p[1] ? "rgba(92,51,61,0.12)" : "rgba(45,45,45,0.06)" }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <span className="text-[16px] font-display font-semibold tabular-nums block" style={{ color: i === 1 ? BURG : INK }}>{p[1]}</span>
            <span className="text-[8px] uppercase tracking-wider opacity-60">{p[0]}</span>
          </motion.div>
        ))}
      </div>
    </GlassPhotoCard>
  );
}