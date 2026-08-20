import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a910e0f31_A_striking_composition_dominated_by_202606262231.jpeg";
const TYPES = ["pdf", "image", "doc", "sheet", "other"];

/** DocumentsFilled — cascaderende mini-kaartjes + type-tellen. · 4:3 */
export default function DocumentsFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Document", { sort: "-created_date", limit: 100, externalTick: learnTick });
  const byType = useMemo(() => TYPES.map((t) => ({ t, v: (data || []).filter((d) => (d.type || "other") === t).length })), [data]);
  const recent = (data || []).slice(0, 4);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("documents")} aspectRatio="4 / 3" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Files to Share.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">BESTANDEN</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <motion.span className="text-[34px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }} key={data?.length || 0} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>{data?.length || 0}</motion.span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">bestanden</p>
        <div className="flex gap-1 ml-auto flex-wrap justify-end">
          {byType.filter((b) => b.v).map((b, i) => (
            <motion.span key={b.t} className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: i % 2 ? SAGE_SOFT : "rgba(45,45,45,0.08)", color: i % 2 ? "#fff" : INK }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 + i * 0.08, type: "spring" }}>{b.t} {b.v}</motion.span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 h-[58px]">
        {recent.map((d, i) => (
          <motion.div key={d.id} className="flex-1 rounded-xl p-2 flex flex-col justify-between min-w-0" style={{ background: "rgba(45,45,45,0.06)", border: `1px solid rgba(255,255,255,0.5)` }} initial={{ opacity: 0, y: 14, rotate: -3 + i * 2 }} animate={{ opacity: 1, y: 0, rotate: -3 + i * 2 }} transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 120 }}>
            <span className="h-2 w-2 rounded-sm" style={{ background: BURG }} />
            <span className="text-[10px] truncate leading-tight">{d.name}</span>
          </motion.div>
        ))}
        {!recent.length && <p className="text-[12px] opacity-60 self-center">Geen bestanden.</p>}
      </div>
    </FilledGlassCard>
  );
}