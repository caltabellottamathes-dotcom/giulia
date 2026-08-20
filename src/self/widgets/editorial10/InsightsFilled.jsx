import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { Sparkline } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/21163f8a4_A_deadpan_horizontal_profile_shot_202606262244.jpeg";
const CATS = ["Opportunity", "Risk", "Research", "Suggestion", "Trend"];
const COLORS = [SAGE_SOFT, BURG, "#9fb0bd", "#c5a09b", "#8a9a5b"];

/** InsightsFilled — sparkline (confidence-trend) + categorie-dots. · 4:3 */
export default function InsightsFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Insight", { sort: "-created_date", limit: 100, externalTick: learnTick });
  const fresh = useMemo(() => (data || []).filter((i) => i.status === "new"), [data]);
  const byCat = useMemo(() => CATS.map((c, i) => ({ c, v: fresh.filter((i) => i.category === c).length, color: COLORS[i] })).filter((b) => b.v), [fresh]);
  const conf = useMemo(() => fresh.length ? Math.round(fresh.reduce((s, i) => s + (i.confidence || 0), 0) / fresh.length * 100) : 0, [fresh]);
  const trend = useMemo(() => {
    const arr = Array(8).fill(0); (data || []).slice(0, 30).reverse().forEach((i) => { arr[Math.min(7, Math.floor((1 - (i.confidence || 0)) * 8))] += (i.confidence || 0) * 100; });
    return (data || []).slice(0, 8).reverse().map((i) => (i.confidence || 0) * 100);
  }, [data]);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("insights")} aspectRatio="4 / 3" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What I've Noticed.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">INZICHTEN</h3></>}>
      <div className="flex items-end gap-3 mb-1">
        <motion.span className="text-[36px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }} key={fresh.length} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>{fresh.length}</motion.span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">nieuw · {conf}% zeker</p>
        <div className="flex gap-1 ml-auto flex-wrap justify-end">
          {byCat.map((b, i) => <motion.span key={b.c} className="text-[7px] uppercase px-1.5 py-0.5 rounded-full" style={{ background: b.color, color: "#fff" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.08, type: "spring" }}>{b.c.slice(0, 3)} {b.v}</motion.span>)}
        </div>
      </div>
      <Sparkline points={trend} color={BURG} w={200} h={36} />
      <div className="flex flex-col gap-1 mt-1">
        {fresh.slice(0, 2).map((i, idx) => (
          <motion.div key={i.id} className="flex items-center gap-2 rounded-xl px-2.5 py-1" style={{ background: "rgba(45,45,45,0.06)" }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.1 }}>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: BURG }} />
            <span className="text-[12px] truncate flex-1">{i.title}</span>
          </motion.div>
        ))}
        {!fresh.length && <p className="text-[12px] opacity-60">Geen nieuwe inzichten.</p>}
      </div>
    </FilledGlassCard>
  );
}