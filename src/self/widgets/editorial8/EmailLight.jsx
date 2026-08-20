import React, { useMemo } from "react";
import { motion } from "framer-motion";
import PhotoCardLight, { BURG, INK, SAGE_SOFT } from "./PhotoCardLight";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/911803ba6_Apply_a_consistent_editorial_documentary_2026062200563.jpeg";
const CATS = [{ k: "important", color: BURG }, { k: "newsletter", color: SAGE_SOFT }, { k: "advertising", color: "#9fb0bd" }, { k: "junk", color: "#c5a09b" }, { k: "other", color: "#b6b6b6" }];

/** EmailLight — grote foto + zacht glas met ongelezen-teller + zachte categoriebalk. · 16:9 */
export default function EmailLight() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Email", { sort: "-timestamp", limit: 200, externalTick: learnTick });
  const unread = useMemo(() => (data || []).filter((e) => e.status === "unread"), [data]);
  const awaiting = useMemo(() => (data || []).filter((e) => e.awaiting_response).length, [data]);
  const cats = useMemo(() => CATS.map((c) => ({ ...c, v: unread.filter((e) => (e.category || "other") === c.k).length })), [unread]);
  const total = unread.length || 1;
  return (
    <PhotoCardLight photo={PHOTO} onClick={() => openModule("email")} aspectRatio="16 / 9"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Online Postoffice.</p><h3 className="text-[32px] leading-[0.84] font-display font-semibold tracking-[-0.04em] mt-0.5">POST</h3></>}>
      <div className="flex items-end gap-4">
        <div>
          <span className="text-[48px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{unread.length}</span>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1">ongelezen</p>
        </div>
        <div className="flex-1">
          <div className="h-3.5 rounded-full overflow-hidden flex gap-0.5" style={{ background: "rgba(45,45,45,0.08)" }}>
            {cats.map((c, i) => c.v > 0 && <motion.div key={c.k} className="rounded-full" style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: `${(c.v / total) * 100}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }} />)}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[8px] uppercase tracking-wider opacity-55">categorieën</span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: BURG, color: "#fff" }}>{awaiting} wacht</span>
          </div>
        </div>
      </div>
    </PhotoCardLight>
  );
}