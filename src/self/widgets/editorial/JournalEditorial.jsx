import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import FloatPhoto from "./FloatPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { journalTypeLabel } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, MOCK } from "./selfEditorial";

const track = "rgba(48,23,40,0.14)";

/** Journal — foto als onderste regio (groter). Verticale draad met sterren. */
export default function JournalEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: entries } = useEntityList("JournalEntry", { realtime: true, sort: "-date", limit: 20, externalTick: learnTick });

  const today = new Date().toDateString();
  const liveToday = (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === today);
  const thread = (entries && entries.length ? entries : MOCK.journal).slice(0, 6);
  const headline = liveToday[0]?.title || thread[0]?.title || "SCHRIJF";
  const highlights = (entries || []).filter((e) => e.is_highlight).length || thread.filter((e) => e.is_highlight).length;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfjournal")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-3" style={{ color: PLUM }}>
        <div className="flex-1 p-2 flex flex-col min-h-0">
          <WidgetHeader label="Journal" count={`${liveToday.length || thread.length} vandaag`} />
          <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.03em] line-clamp-2">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1.5">{highlights} highlights</p>

          <div className="mt-3 flex-1 relative min-h-0">
            <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: track }} />
            <div className="space-y-2.5">
              {thread.map((e, i) => (
                <motion.div key={e.id || i} className="relative flex items-center gap-3 pl-5" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <span className="absolute left-0 h-2.5 w-2.5 rounded-full" style={{ background: e.is_highlight ? PLUM : "rgba(48,23,40,0.4)" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] truncate opacity-85">{e.title}</p>
                    <p className="text-[9px] uppercase tracking-wider opacity-45">{journalTypeLabel(e.type)}</p>
                  </div>
                  {e.is_highlight && <span className="text-[11px]" style={{ color: PLUM }}>★</span>}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end pt-3 border-t border-black/10">
            <button onClick={(e) => { e.stopPropagation(); openModule("selfjournal"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: PLUM, color: "#f2f2f0" }}>Open</button>
          </div>
        </div>
        <FloatPhoto src={SELF_PHOTO.journal} className="h-32 w-full" />
      </div>
    </WidgetShell>
  );
}