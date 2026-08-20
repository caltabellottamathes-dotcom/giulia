import React, { useMemo } from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

const CATS = [
  { k: "important", color: SAGE },
  { k: "newsletter", color: PLUM },
  { k: "advertising", color: "#9fb0bd" },
  { k: "junk", color: "#e08a6a" },
  { k: "other", color: "#7c8b97" },
];

/** EmailPhotoCard — grote foto + glas-kaart met ongelezen-teller + categoriebalk. · 16:9 */
export default function EmailPhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Email", { sort: "-timestamp", limit: 200, externalTick: learnTick });
  const unread = useMemo(() => (data || []).filter((e) => e.status === "unread"), [data]);
  const awaiting = useMemo(() => (data || []).filter((e) => e.awaiting_response).length, [data]);
  const cats = useMemo(() => CATS.map((c) => ({ ...c, v: unread.filter((e) => (e.category || "other") === c.k).length })), [unread]);
  const total = unread.length || 1;
  return (
    <PhotoCard photo={SELF_PHOTO.journal} onClick={() => openModule("email")} aspectRatio="16 / 9" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Online Postoffice.</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">POST</h3></>}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="text-[46px] font-display font-semibold tabular-nums leading-none" style={{ color: SAGE }}>{unread.length}</span>
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-60 mt-0.5">ongelezen</p>
        </div>
        <div className="flex-1 max-w-[55%]">
          <div className="h-3 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.12)" }}>
            {cats.map((c, i) => c.v > 0 && (
              <motion.div key={c.k} style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: `${(c.v / total) * 100}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: "easeOut" }} />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[7px] uppercase tracking-wider opacity-55"> categorieën</span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: SAGE, color: "#26282c" }}>{awaiting} wacht</span>
          </div>
        </div>
      </div>
    </PhotoCard>
  );
}