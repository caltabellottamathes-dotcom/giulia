import React, { useMemo } from "react";
import { motion } from "framer-motion";
import GlassPhotoCard, { BURG, SAGE_SOFT } from "./GlassPhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { daysSince } from "@/self/widgets/editorial5/helpers";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b67020def_IMG_20260527_005923.jpg";

/** PeopleGlass — glas-groot + foto-klein: over-datum-teller + top 3. · 3:4 */
export default function PeopleGlass() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Contact", { sort: "-last_contact_date", limit: 100, externalTick: learnTick });
  const overdue = useMemo(() => (data || []).map((c) => ({ ...c, days: daysSince(c.last_contact_date), od: daysSince(c.last_contact_date) > (c.desired_frequency_days || 30) })).filter((c) => c.od).sort((a, b) => b.days - a.days), [data]);
  return (
    <GlassPhotoCard photo={PHOTO} onClick={() => openModule("people")} aspectRatio="3 / 4" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">People Around Me.</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">MENSEN</h3></>}>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-[38px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{overdue.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">over tijd</p>
      </div>
      <div className="flex flex-col gap-2">
        {overdue.slice(0, 3).map((c, i) => (
          <motion.div key={c.id} className="flex items-center gap-2.5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}>
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: SAGE_SOFT, color: "#fff" }}>{(c.name || "?").slice(0, 1)}</div>
            <span className="text-[12px] font-medium truncate flex-1">{c.name}</span>
            <span className="text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded-full" style={{ background: "rgba(92,51,61,0.12)", color: BURG }}>{c.days}d</span>
          </motion.div>
        ))}
        {!overdue.length && <p className="text-[12px] opacity-60 py-1">Iedereen up-to-date.</p>}
      </div>
    </GlassPhotoCard>
  );
}