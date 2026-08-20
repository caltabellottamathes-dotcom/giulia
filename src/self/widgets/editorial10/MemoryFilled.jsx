import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b67020def_IMG_20260527_005923.jpg";
const CATS = ["User preferences", "People", "Projects", "Important information", "Insights"];

/** MemoryFilled — glas-groot + foto-klein: aantal herinneringen + categorie. · 1:1 */
export default function MemoryFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Memory", { sort: "-created_date", limit: 200, externalTick: learnTick });
  const byCat = useMemo(() => CATS.map((c) => ({ c, v: (data || []).filter((m) => m.category === c).length })), [data]);
  const top = byCat.filter((b) => b.v).sort((a, b) => b.v - a.v).slice(0, 3);
  const avg = useMemo(() => { const c = (data || []).filter((m) => m.confidence != null); return c.length ? Math.round((c.reduce((s, m) => s + m.confidence, 0) / c.length) * 100) : 0; }, [data]);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("memory")} aspectRatio="1 / 1" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What I Remember.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">GEHEUGEN</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[36px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{data?.length || 0}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">{avg}% zeker</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {top.map((b, i) => (
          <motion.div key={b.c} className="flex items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <span className="text-[11px] font-semibold tabular-nums w-6" style={{ color: BURG }}>{b.v}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(45,45,45,0.10)" }}>
              <motion.div className="h-full rounded-full" style={{ background: i === 0 ? BURG : SAGE_SOFT }} initial={{ width: 0 }} animate={{ width: `${(b.v / Math.max(1, top[0].v)) * 100}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.7 }} />
            </div>
            <span className="text-[9px] opacity-60 w-16 truncate text-right">{b.c}</span>
          </motion.div>
        ))}
        {!top.length && <p className="text-[12px] opacity-60">Nog leeg.</p>}
      </div>
    </FilledGlassCard>
  );
}