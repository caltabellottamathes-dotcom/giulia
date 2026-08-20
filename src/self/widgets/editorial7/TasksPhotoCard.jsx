import React from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

/** TasksPhotoCard — grote foto + glas-kaart met aandacht-teller + statusbalken. · 1:1 */
export default function TasksPhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Task", { sort: "-updated_date", limit: 200, externalTick: learnTick });
  const active = (data || []).filter((t) => !["completed", "archived"].includes(t.status));
  const c = (s) => active.filter((t) => t.status === s).length;
  const buckets = [["vandaag", c("today"), SAGE], ["over tijd", c("overdue"), "#e08a6a"], ["komend", c("upcoming"), PLUM], ["open", c("todo"), PLUM], ["wacht", c("waiting") + c("delegated"), PLUM]];
  const attn = buckets[0][1] + buckets[1][1];
  const max = Math.max(1, ...buckets.map((b) => b[1]));
  return (
    <PhotoCard photo={SELF_PHOTO.routines} onClick={() => openModule("tasks")} aspectRatio="1 / 1" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">To Do!</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">TE DOEN</h3></>}>
      <div className="flex items-end gap-3">
        <span className="text-[44px] font-display font-semibold tabular-nums leading-none" style={{ color: SAGE }}>{attn}</span>
        <div className="flex-1 flex items-end gap-1.5 h-12">
          {buckets.map((b, i) => (
            <motion.span key={b[0]} className="flex-1 rounded-t" style={{ background: b[2], originY: 1 }} initial={{ height: 0 }} animate={{ height: `${(b[1] / max) * 100}%` }} transition={{ delay: 0.2 + i * 0.07, duration: 0.6 }} />
          ))}
        </div>
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {buckets.map((b) => <span key={b[0]} className="flex-1 text-[7px] uppercase tracking-wider text-center opacity-60">{b[0]}</span>)}
      </div>
    </PhotoCard>
  );
}