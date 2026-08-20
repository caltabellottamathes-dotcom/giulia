import React, { useMemo } from "react";
import { motion } from "framer-motion";
import PhotoCardLight, { BURG, INK, SAGE_SOFT } from "./PhotoCardLight";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/4a385b8a4_An_emotionally_ambiguous_close-up_of_202606262301.jpeg";

/** SocialLight — grote foto + zacht glas met interactie-teller + 8-weekse zachte balken. · 3:2 */
export default function SocialLight() {
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
    <PhotoCardLight photo={PHOTO} onClick={() => openModule("social")} aspectRatio="3 / 2"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What Social Life?</p><h3 className="text-[32px] leading-[0.84] font-display font-semibold tracking-[-0.04em] mt-0.5">SOCIAL</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[42px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{total}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">interacties · 8 wk</p>
      </div>
      <div className="flex items-end gap-2 h-14">
        {weeks.map((v, i) => (
          <motion.span key={i} className="flex-1 rounded-full" style={{ background: i === 7 ? BURG : SAGE_SOFT, originY: 1 }} initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }} transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }} />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[8px] uppercase tracking-wider opacity-50"><span>-8 wk</span><span>deze wk</span></div>
    </PhotoCardLight>
  );
}