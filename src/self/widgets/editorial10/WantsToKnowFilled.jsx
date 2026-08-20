import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ff0a104c5_A_graphic_minimalist_photograph_exploring_202606262301.jpeg";
const P_COLOR = { now: BURG, soon: SAGE_SOFT, useful: "#9fb0bd", curious: "#c5a09b" };

/** WantsToKnowFilled — glas-groot + foto-klein: open vragen + top. · 2:3 */
export default function WantsToKnowFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("GiuliaQuestion", { sort: "-created_date", limit: 50, externalTick: learnTick });
  const open = useMemo(() => (data || []).filter((q) => q.status === "open"), [data]);
  const top = open.sort((a, b) => (P_COLOR[a.priority] ? 0 : 1)).slice(0, 4);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("wantstoknow")} aspectRatio="2 / 3" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Wants to Know!</p><h3 className="text-[24px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">WIL WETEN</h3></>}>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-[36px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{open.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">open vragen</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {top.map((q, i) => (
          <motion.div key={q.id} className="flex items-start gap-2 rounded-2xl px-2.5 py-2" style={{ background: "rgba(45,45,45,0.06)" }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <span className="h-2 w-2 rounded-full shrink-0 mt-1" style={{ background: P_COLOR[q.priority] || BURG }} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium leading-tight">{q.title}</p>
              <p className="text-[8px] uppercase tracking-wider opacity-50 mt-0.5">{q.kind?.replace(/_/g, " ")} · {q.domain}</p>
            </div>
          </motion.div>
        ))}
        {!top.length && <p className="text-[12px] opacity-60">Geen open vragen.</p>}
      </div>
    </FilledGlassCard>
  );
}