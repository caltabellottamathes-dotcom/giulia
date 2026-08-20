import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { RadialSegments } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ff0a104c5_A_graphic_minimalist_photograph_exploring_202606262301.jpeg";
const P_COLOR = { now: BURG, soon: SAGE_SOFT, useful: "#9fb0bd", curious: "#c5a09b" };

/** WantsToKnowFilled — prioriteit-ring + vraag-kaartjes. · 2:3 */
export default function WantsToKnowFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("GiuliaQuestion", { sort: "-created_date", limit: 50, externalTick: learnTick });
  const open = useMemo(() => (data || []).filter((q) => q.status === "open"), [data]);
  const segs = useMemo(() => ["now", "soon", "useful", "curious"].map((p) => ({ c: p, v: open.filter((q) => q.priority === p).length, color: P_COLOR[p] })).filter((s) => s.v), [open]);
  const top = open.slice(0, 3);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("wantstoknow")} aspectRatio="2 / 3" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Wants to Know!</p><h3 className="text-[24px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">WIL WETEN</h3></>}>
      <div className="flex items-center gap-3 mb-2">
        <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
          <RadialSegments segments={segs.length ? segs : [{ c: "—", v: 1, color: "rgba(45,45,45,0.10)" }]} size={72} stroke={7} />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span className="text-[22px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }} animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>{open.length}</motion.span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {segs.map((s, i) => (
            <motion.div key={s.c} className="flex items-center gap-1.5" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[9px] uppercase tracking-wider opacity-60">{s.c}</span>
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: BURG }}>{s.v}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {top.map((q, i) => (
          <motion.div key={q.id} className="flex items-start gap-2 rounded-2xl px-2.5 py-2" style={{ background: "rgba(45,45,45,0.06)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
            <motion.span className="h-2 w-2 rounded-full shrink-0 mt-1" style={{ background: P_COLOR[q.priority] || BURG }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity }} />
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