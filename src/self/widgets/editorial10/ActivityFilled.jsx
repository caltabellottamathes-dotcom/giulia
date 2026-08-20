import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { OrbitDots, FlowDots } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { dayStartIso } from "@/self/widgets/editorial5/helpers";
import { fmtAgo } from "@/lib/selfUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b96b9b447_Apply_a_consistent_editorial_documentary_2026062200557.jpeg";
const DOMS = ["focus", "life", "self", "giulia"];
const DCOL = { focus: BURG, life: SAGE_SOFT, self: "#9fb0bd", giulia: "#c5a09b" };

/** ActivityFilled — orbit-dots (domeinen) + stromende tijdlijn. · 3:2 */
export default function ActivityFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Activity", { sort: "-timestamp", limit: 200, externalTick: learnTick });
  const today = useMemo(() => (data || []).filter((a) => a.timestamp && new Date(a.timestamp) >= new Date(dayStartIso())), [data]);
  const byDom = useMemo(() => DOMS.map((d) => ({ d, v: today.filter((a) => a.domain === d).length })), [today]);
  const total = today.length || 1;
  const recent = today.slice(0, 3);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("activity")} aspectRatio="3 / 2" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">I Do Process!</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">ACTIVITEIT</h3></>}>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 92, height: 92 }}>
          <OrbitDots n={byDom.filter((b) => b.v).length || 1} size={92} color={SAGE_SOFT} speed={16} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-[28px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }} key={today.length} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>{today.length}</motion.span>
            <span className="text-[7px] uppercase tracking-wider opacity-55">vandaag</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-2.5 rounded-full overflow-hidden flex gap-0.5 mb-2" style={{ background: "rgba(45,45,45,0.08)" }}>
            {byDom.map((b, i) => b.v > 0 && <motion.div key={b.d} className="rounded-full" style={{ background: DCOL[b.d] }} initial={{ width: 0 }} animate={{ width: `${(b.v / total) * 100}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }} />)}
          </div>
          <FlowDots count={7} color={BURG} />
          <div className="flex flex-col gap-1 mt-2">
            {recent.map((a, i) => (
              <motion.div key={a.id} className="flex items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: DCOL[a.domain] || SAGE_SOFT }} />
                <span className="text-[12px] truncate flex-1">{a.description}</span>
                <span className="text-[9px] opacity-50">{fmtAgo(a.timestamp)}</span>
              </motion.div>
            ))}
            {!recent.length && <p className="text-[12px] opacity-60">Nog niets vandaag.</p>}
          </div>
        </div>
      </div>
    </FilledGlassCard>
  );
}