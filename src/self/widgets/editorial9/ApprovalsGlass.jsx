import React from "react";
import { motion } from "framer-motion";
import GlassPhotoCard, { BURG, SAGE_SOFT } from "./GlassPhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b96b9b447_Apply_a_consistent_editorial_documentary_2026062200557.jpeg";
const CAT_COLOR = { urgent: "#c5a09b", communication: SAGE_SOFT, projects: BURG, intern: BURG, proactive: BURG };

/** ApprovalsGlass — glas-groot + foto-klein: wacht-teller + zachte rijen. · 2:3 */
export default function ApprovalsGlass() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Approval", { filter: { status: "pending" }, sort: "-created_date", limit: 20, externalTick: learnTick });
  const list = data || [];
  return (
    <GlassPhotoCard photo={PHOTO} onClick={() => openModule("approvals")} aspectRatio="2 / 3" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Waiting on You.</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">WACHTEN</h3></>}>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-[38px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{list.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">openstaand</p>
      </div>
      <div className="flex flex-col gap-2">
        {list.slice(0, 4).map((a, i) => (
          <motion.div key={a.id} className="flex items-center gap-2.5 rounded-2xl px-3 py-2" style={{ background: "rgba(45,45,45,0.06)" }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}>
            <span className="h-6 w-1.5 rounded-full shrink-0" style={{ background: CAT_COLOR[a.category] || BURG }} />
            <span className="text-[12px] font-medium truncate flex-1">{a.title || a.description}</span>
            <span className="text-[8px] uppercase tracking-wider opacity-55 shrink-0">{a.type || a.category}</span>
          </motion.div>
        ))}
        {!list.length && <p className="text-[12px] opacity-60 py-1">Niets openstaand.</p>}
      </div>
    </GlassPhotoCard>
  );
}