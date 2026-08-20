import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/f6945f943_A_striking_surreal_editorial_photograph_202606262301.jpeg";
const CATS = ["Research", "Notes", "Insights", "Saved"];

/** KnowledgeFilled — glas-groot + foto-klein: totaal + categorie-verdeling. · 3:2 */
export default function KnowledgeFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Knowledge", { sort: "-created_date", limit: 200, externalTick: learnTick });
  const byCat = useMemo(() => CATS.map((c) => ({ c, v: (data || []).filter((k) => k.category === c).length })), [data]);
  const max = Math.max(1, ...byCat.map((b) => b.v));
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("knowledge")} aspectRatio="3 / 2" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What I Know.</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">KENNIS</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[36px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{data?.length || 0}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">opgeslagen</p>
      </div>
      <div className="flex items-end gap-3 h-12">
        {byCat.map((b, i) => (
          <div key={b.c} className="flex-1 flex flex-col items-center gap-1">
            <motion.div className="w-full rounded-full" style={{ background: i === 0 ? BURG : SAGE_SOFT, originY: 1 }} initial={{ height: 0 }} animate={{ height: `${(b.v / max) * 100}%` }} transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }} />
            <span className="text-[7px] uppercase tracking-wider opacity-55">{b.c.slice(0, 4)}</span>
          </div>
        ))}
      </div>
    </FilledGlassCard>
  );
}