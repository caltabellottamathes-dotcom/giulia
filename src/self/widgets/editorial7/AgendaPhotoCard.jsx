import React from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";
import { tFmt, dayStartIso, domainColor } from "@/self/widgets/editorial5/helpers";

/** AgendaPhotoCard — grote foto + glas-kaart met live tijdlijn vandaag. · 3:2 */
export default function AgendaPhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("CalendarEvent", { filter: { start: { $gte: dayStartIso() } }, sort: "start", limit: 5, externalTick: learnTick });
  const list = (data || []).filter((e) => e.status !== "cancelled");
  return (
    <PhotoCard photo={SELF_PHOTO.personalTime} onClick={() => openModule("agenda")} aspectRatio="3 / 2" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">What's Happening?</p><h3 className="text-[34px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">VANDAAG</h3></>}>
      <div className="flex flex-col gap-1">
        {list.length ? list.slice(0, 4).map((e, i) => (
          <motion.div key={e.id} className="flex items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}>
            <span className="text-[10px] font-semibold tabular-nums w-9" style={{ color: SAGE }}>{tFmt(e.start)}</span>
            <span className="h-5 w-1 rounded-full" style={{ background: domainColor(e.domain) }} />
            <span className="text-[11px] font-medium truncate flex-1">{e.title}</span>
          </motion.div>
        )) : <p className="text-[12px] opacity-60 py-1">Vandaag vrij.</p>}
      </div>
    </PhotoCard>
  );
}