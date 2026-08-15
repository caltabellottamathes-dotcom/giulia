import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { journalTypeLabel } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Journal — foto zweeft ONDER als ronde kaart (over de glasrand), draad erboven. */
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
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <div className="flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Journal" count={`${liveToday.length || thread.length} vandaag`} />
          <h3 className="text-[20px] leading-[1.1] font-display font-semibold tracking-[-0.03em] mt-1 line-clamp-2">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1">{highlights} highlights</p>

          {/* verticale draad */}
          <div className="mt-3 flex-1 relative min-h-0">
            <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: SAGE }} />
            <div className="space-y-2.5">
              {thread.map((e, i) => (
                <motion.div key={e.id || i} className="relative flex items-center gap-3 pl-5" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <span className="absolute left-0 h-2.5 w-2.5 rounded-full" style={{ background: e.is_highlight ? PLUM : SAGE, border: e.is_highlight ? `2px solid ${PLUM}` : "none" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] truncate opacity-85">{e.title}</p>
                    <p className="text-[9px] uppercase tracking-wider opacity-45">{journalTypeLabel(e.type)}</p>
                  </div>
                  {e.is_highlight && <span className="text-[12px]">★</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* foto zweeft onder, ronde kaart, geen overlay */}
        <div className="mt-2 rounded-2xl overflow-hidden h-28 shrink-0 shadow-[0_-10px_30px_-14px_rgba(0,0,0,0.25)]">
          <img src={SELF_PHOTO.journal} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>

        <div className="flex items-center justify-between pt-2 mt-2 border-t" style={{ borderColor: PLUM_FAINT }}>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-60">reflectie · draad</p>
          <button onClick={(e) => { e.stopPropagation(); openModule("selfjournal"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
        </div>
      </div>
    </WidgetShell>
  );
}