import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a910e0f31_A_striking_composition_dominated_by_202606262231.jpeg";
const TYPES = ["pdf", "image", "doc", "sheet", "other"];

/** DocumentsFilled — glas-groot + foto-klein: aantal + type-verdeling + recent. · 4:3 */
export default function DocumentsFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Document", { sort: "-created_date", limit: 100, externalTick: learnTick });
  const byType = useMemo(() => TYPES.map((t) => ({ t, v: (data || []).filter((d) => (d.type || "other") === t).length })), [data]);
  const recent = (data || []).slice(0, 3);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("documents")} aspectRatio="4 / 3" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Files to Share.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">BESTANDEN</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[32px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{data?.length || 0}</span>
        <div className="flex gap-1 ml-auto">
          {byType.filter((b) => b.v).map((b, i) => (
            <motion.span key={b.t} className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: i % 2 ? "rgba(45,45,45,0.08)" : SAGE_SOFT, color: i % 2 ? INK : "#fff" }}>{b.t} {b.v}</motion.span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {recent.map((d, i) => (
          <motion.div key={d.id} className="flex items-center gap-2 rounded-xl px-2.5 py-1.5" style={{ background: "rgba(45,45,45,0.06)" }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: BURG }} />
            <span className="text-[12px] truncate flex-1">{d.name}</span>
          </motion.div>
        ))}
        {!recent.length && <p className="text-[12px] opacity-60">Geen bestanden.</p>}
      </div>
    </FilledGlassCard>
  );
}