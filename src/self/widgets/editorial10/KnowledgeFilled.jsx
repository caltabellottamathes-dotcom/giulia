import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { RadialSegments } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/f6945f943_A_striking_surreal_editorial_photograph_202606262301.jpeg";
const CATS = ["Research", "Notes", "Insights", "Saved"];
const COLORS = [BURG, SAGE_SOFT, "#9fb0bd", "#c5a09b"];

/** KnowledgeFilled — roterende radiale segmenten (categorie-verdeling). · 3:2 */
export default function KnowledgeFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Knowledge", { sort: "-created_date", limit: 200, externalTick: learnTick });
  const segs = useMemo(() => CATS.map((c, i) => ({ c, v: (data || []).filter((k) => k.category === c).length, color: COLORS[i] })), [data]);
  const total = (data || []).length;
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("knowledge")} aspectRatio="3 / 2" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What I Know.</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">KENNIS</h3></>}>
      <div className="flex items-center gap-4">
        <motion.div className="relative shrink-0" animate={{ rotate: [0, 4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
          <RadialSegments segments={segs} size={96} stroke={9} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{total}</span>
            <span className="text-[7px] uppercase tracking-wider opacity-55">items</span>
          </div>
        </motion.div>
        <div className="flex-1 flex flex-col gap-1.5">
          {segs.map((s, i) => (
            <motion.div key={s.c} className="flex items-center gap-2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] font-medium flex-1">{s.c}</span>
              <span className="text-[13px] font-display font-semibold tabular-nums" style={{ color: BURG }}>{s.v}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </FilledGlassCard>
  );
}