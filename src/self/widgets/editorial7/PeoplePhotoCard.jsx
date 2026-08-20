import React, { useMemo } from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";
import { daysSince } from "@/self/widgets/editorial5/helpers";

/** PeoplePhotoCard — grote foto + glas-kaart met over-datum-teller + top 3. · 3:4 */
export default function PeoplePhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Contact", { sort: "-last_contact_date", limit: 100, externalTick: learnTick });
  const overdue = useMemo(() => (data || []).map((c) => ({ ...c, days: daysSince(c.last_contact_date), od: daysSince(c.last_contact_date) > (c.desired_frequency_days || 30) })).filter((c) => c.od).sort((a, b) => b.days - a.days), [data]);
  return (
    <PhotoCard photo={SELF_PHOTO.therapy} onClick={() => openModule("people")} aspectRatio="3 / 4" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">People Around Me.</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">MENSEN</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[42px] font-display font-semibold tabular-nums leading-none" style={{ color: SAGE }}>{overdue.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 pb-1">over tijd</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {overdue.slice(0, 3).map((c, i) => (
          <motion.div key={c.id} className="flex items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}>
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: SAGE, color: "#26282c" }}>{(c.name || "?").slice(0, 1)}</div>
            <span className="text-[11px] font-medium truncate flex-1">{c.name}</span>
            <span className="text-[9px] font-semibold tabular-nums opacity-70">{c.days}d</span>
          </motion.div>
        ))}
        {!overdue.length && <p className="text-[11px] opacity-60 py-1">Iedereen up-to-date.</p>}
      </div>
    </PhotoCard>
  );
}