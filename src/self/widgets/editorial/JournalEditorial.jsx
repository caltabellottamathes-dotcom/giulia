import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Journal — smal & hoog (1×2). Verticale draad + foto onder (zwevend). */
export default function JournalEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: entries } = useEntityList("JournalEntry", { realtime: true, sort: "-date", limit: 20, externalTick: learnTick });

  const today = new Date().toDateString();
  const liveToday = (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === today);
  const thread = (entries && entries.length ? entries : MOCK.journal).slice(0, 5);
  const headline = liveToday[0]?.title || thread[0]?.title || "SCHRIJF";

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfjournal")} className="min-h-[240px]" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-2.5" style={{ color: PLUM }}>
        <div className="flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Journal" count={`${liveToday.length || thread.length} vandaag`} />
          <h3 className="text-[16px] leading-[1.1] font-display font-semibold tracking-[-0.03em] mt-0.5 line-clamp-2">{headline}</h3>

          <div className="mt-2 flex-1 relative min-h-0">
            <div className="absolute left-[4px] top-1 bottom-1 w-px" style={{ background: SAGE }} />
            <div className="space-y-1.5">
              {thread.map((e, i) => (
                <motion.div key={e.id || i} className="relative flex items-center gap-2.5 pl-4" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <span className="absolute left-0 h-2 w-2 rounded-full" style={{ background: e.is_highlight ? PLUM : SAGE, border: e.is_highlight ? `2px solid ${PLUM}` : "none" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] truncate opacity-85">{e.title}</p>
                  </div>
                  {e.is_highlight && <span className="text-[10px]">★</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 rounded-xl overflow-hidden h-16 shrink-0">
          <img src={SELF_PHOTO.journal} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </WidgetShell>
  );
}