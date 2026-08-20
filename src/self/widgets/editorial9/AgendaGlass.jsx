import React from "react";
import { motion } from "framer-motion";
import GlassPhotoCard from "./GlassPhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { tFmt, dayStartIso } from "@/self/widgets/editorial5/helpers";
import { BURG, SAGE_SOFT } from "./GlassPhotoCard";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/21163f8a4_A_deadpan_horizontal_profile_shot_202606262244.jpeg";

/** AgendaGlass — glas-groot + foto-klein: vandaag-tijdlijn. · 3:2 */
export default function AgendaGlass() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("CalendarEvent", { filter: { start: { $gte: dayStartIso() } }, sort: "start", limit: 5, externalTick: learnTick });
  const list = (data || []).filter((e) => e.status !== "cancelled");
  return (
    <GlassPhotoCard photo={PHOTO} onClick={() => openModule("agenda")} aspectRatio="3 / 2" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What's Happening?</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">VANDAAG</h3></>}>
      <div className="flex flex-col gap-2">
        {list.length ? list.slice(0, 4).map((e, i) => (
          <motion.div key={e.id} className="flex items-center gap-3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}>
            <span className="text-[12px] font-semibold tabular-nums w-10" style={{ color: BURG }}>{tFmt(e.start)}</span>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: SAGE_SOFT }} />
            <span className="text-[13px] font-medium truncate flex-1">{e.title}</span>
          </motion.div>
        )) : <p className="text-[13px] opacity-60 py-1">Vandaag vrij.</p>}
      </div>
    </GlassPhotoCard>
  );
}