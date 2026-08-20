import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { RadialSegments, OrbitDots } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b67020def_IMG_20260527_005923.jpg";
const CATS = ["User preferences", "People", "Projects", "Important information", "Insights"];
const COLORS = [BURG, SAGE_SOFT, "#9fb0bd", "#c5a09b", "#8a9a5b"];

/** MemoryFilled — radiale segmenten (categorie) + orbit-dots. · 1:1 */
export default function MemoryFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Memory", { sort: "-created_date", limit: 200, externalTick: learnTick });
  const segs = useMemo(() => CATS.map((c, i) => ({ c, v: (data || []).filter((m) => m.category === c).length, color: COLORS[i] })).filter((s) => s.v), [data]);
  const avg = useMemo(() => { const c = (data || []).filter((m) => m.confidence != null); return c.length ? Math.round((c.reduce((s, m) => s + m.confidence, 0) / c.length) * 100) : 0; }, [data]);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("memory")} aspectRatio="1 / 1" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What I Remember.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">GEHEUGEN</h3></>}>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: 92, height: 92 }}>
          <RadialSegments segments={segs.length ? segs : [{ c: "—", v: 1, color: "rgba(45,45,45,0.10)" }]} size={92} stroke={8} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-[24px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }} key={(data?.length || 0)} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>{data?.length || 0}</motion.span>
            <span className="text-[7px] uppercase tracking-wider opacity-55">{avg}% zeker</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {segs.slice(0, 4).map((s, i) => (
            <motion.div key={s.c} className="flex items-center gap-2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] flex-1 truncate">{s.c}</span>
              <span className="text-[13px] font-display font-semibold tabular-nums" style={{ color: BURG }}>{s.v}</span>
            </motion.div>
          ))}
          {!segs.length && <p className="text-[12px] opacity-60">Nog leeg.</p>}
        </div>
      </div>
    </FilledGlassCard>
  );
}