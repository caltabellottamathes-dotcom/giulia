import React, { useMemo } from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

/** SocialPhotoCard — grote foto + glas-kaart met interactie-teller + 8-weekse balken. · 3:2 */
export default function SocialPhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", limit: 300, externalTick: learnTick });
  const { data: wamsgs } = useEntityList("WhatsAppMessage", { sort: "-timestamp", limit: 300, externalTick: learnTick });
  const weeks = useMemo(() => {
    const now = Date.now(); const arr = Array(8).fill(0);
    [...(emails || []), ...(wamsgs || [])].forEach((m) => {
      const t = m.timestamp ? new Date(m.timestamp).getTime() : 0;
      if (t) { const w = Math.floor((now - t) / (7 * 86400000)); if (w >= 0 && w < 8) arr[7 - w]++; }
    });
    return arr;
  }, [emails, wamsgs]);
  const total = weeks.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...weeks);
  return (
    <PhotoCard photo={SELF_PHOTO.therapy} onClick={() => openModule("social")} aspectRatio="3 / 2" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">What Social Life?</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">SOCIAL</h3></>}>
      <div className="flex items-end gap-3">
        <span className="text-[40px] font-display font-semibold tabular-nums leading-none" style={{ color: SAGE }}>{total}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 pb-1">interacties · 8 wk</p>
      </div>
      <div className="flex items-end gap-1.5 h-12 mt-2">
        {weeks.map((v, i) => (
          <motion.span key={i} className="flex-1 rounded-t" style={{ background: i === 7 ? SAGE : PLUM, originY: 1 }} initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }} transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }} />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[7px] uppercase tracking-wider opacity-55"><span>-8 wk</span><span>deze wk</span></div>
    </PhotoCard>
  );
}