import React from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

const CAT_COLOR = { urgent: "#e08a6a", communication: SAGE, projects: PLUM, intern: PLUM, proactive: PLUM };

/** ApprovalsPhotoCard — grote foto + glas-kaart met wacht-teller + mini-stack. · 2:3 */
export default function ApprovalsPhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Approval", { filter: { status: "pending" }, sort: "-created_date", limit: 20, externalTick: learnTick });
  const list = data || [];
  return (
    <PhotoCard photo={SELF_PHOTO.wake} onClick={() => openModule("approvals")} aspectRatio="2 / 3" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Waiting on You.</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">WACHTEN</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[42px] font-display font-semibold tabular-nums leading-none" style={{ color: SAGE }}>{list.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 pb-1">openstaand</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {list.slice(0, 4).map((a, i) => (
          <motion.div key={a.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: "rgba(255,255,255,0.07)" }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}>
            <span className="h-5 w-1 rounded-full shrink-0" style={{ background: CAT_COLOR[a.category] || PLUM }} />
            <span className="text-[10px] font-medium truncate flex-1">{a.title || a.description}</span>
            <span className="text-[7px] uppercase tracking-wider opacity-60 shrink-0">{a.type || a.category}</span>
          </motion.div>
        ))}
        {!list.length && <p className="text-[11px] opacity-60 py-1">Niets openstaand.</p>}
      </div>
    </PhotoCard>
  );
}