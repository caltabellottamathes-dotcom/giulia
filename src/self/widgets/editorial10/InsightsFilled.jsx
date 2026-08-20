import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/21163f8a4_A_deadpan_horizontal_profile_shot_202606262244.jpeg";
const CATS = ["Opportunity", "Risk", "Research", "Suggestion", "Trend"];

/** InsightsFilled — glas-groot + foto-klein: nieuwe inzichten + trendlijn. · 4:3 */
export default function InsightsFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Insight", { sort: "-created_date", limit: 100, externalTick: learnTick });
  const fresh = useMemo(() => (data || []).filter((i) => i.status === "new"), [data]);
  const byCat = useMemo(() => CATS.map((c) => ({ c, v: fresh.filter((i) => i.category === c).length })), [fresh]);
  const conf = useMemo(() => fresh.length ? Math.round(fresh.reduce((s, i) => s + (i.confidence || 0), 0) / fresh.length * 100) : 0, [fresh]);
  const recent = fresh.slice(0, 2);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("insights")} aspectRatio="4 / 3" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What I've Noticed.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">INZICHTEN</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[34px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{fresh.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">nieuw · {conf}%</p>
        <div className="flex gap-1 ml-auto">
          {byCat.filter((b) => b.v).map((b, i) => <span key={b.c} className="text-[7px] uppercase px-1.5 py-0.5 rounded-full" style={{ background: i % 2 ? SAGE_SOFT : "rgba(45,45,45,0.08)", color: i % 2 ? "#fff" : INK }}>{b.c.slice(0, 3)} {b.v}</span>)}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {recent.map((i, idx) => (
          <motion.div key={i.id} className="flex items-center gap-2 rounded-xl px-2.5 py-1.5" style={{ background: "rgba(45,45,45,0.06)" }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + idx * 0.1 }}>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: BURG }} />
            <span className="text-[12px] truncate flex-1">{i.title}</span>
          </motion.div>
        ))}
        {!recent.length && <p className="text-[12px] opacity-60">Geen nieuwe inzichten.</p>}
      </div>
    </FilledGlassCard>
  );
}