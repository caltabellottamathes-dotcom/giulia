import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, SAGE_SOFT } from "./FilledGlassCard";
import { FlowDots } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtAgo } from "@/lib/selfUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/4a385b8a4_An_emotionally_ambiguous_close-up_of_202606262301.jpeg";
const DCOL = { focus: BURG, life: SAGE_SOFT, self: "#9fb0bd", giulia: "#c5a09b" };

/** UpdatesFilled — stromende tijdlijn-ribbon + domein-dots. · 3:2 */
export default function UpdatesFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Activity", { sort: "-timestamp", limit: 60, externalTick: learnTick });
  const recent = (data || []).slice(0, 6);
  const byDom = useMemo(() => { const m = {}; recent.forEach((a) => { if (a.domain) m[a.domain] = (m[a.domain] || 0) + 1; }); return m; }, [recent]);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("updates")} aspectRatio="3 / 2" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Meanwhile...</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">UPDATES</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <motion.span className="text-[32px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }} key={recent.length} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>{recent.length}</motion.span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">recent</p>
        <div className="flex gap-1.5 ml-auto">
          {Object.entries(byDom).filter(([, v]) => v).map(([d, v]) => <motion.span key={d} className="text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: DCOL[d] || BURG, color: "#fff" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>{d} {v}</motion.span>)}
        </div>
      </div>
      <div className="relative pl-3 mb-1">
        <div className="absolute left-1 top-0 bottom-0 w-px" style={{ background: "rgba(45,45,45,0.12)" }} />
        <FlowDots count={6} color={SAGE_SOFT} />
      </div>
      <div className="flex flex-col gap-1">
        {recent.slice(0, 3).map((a, i) => (
          <motion.div key={a.id} className="flex items-center gap-2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <motion.span className="h-2 w-2 rounded-full shrink-0" style={{ background: DCOL[a.domain] || BURG }} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.4, delay: i * 0.2, repeat: Infinity }} />
            <span className="text-[12px] truncate flex-1">{a.description}</span>
            <span className="text-[9px] opacity-50">{fmtAgo(a.timestamp)}</span>
          </motion.div>
        ))}
        {!recent.length && <p className="text-[12px] opacity-60">Nog niets.</p>}
      </div>
    </FilledGlassCard>
  );
}