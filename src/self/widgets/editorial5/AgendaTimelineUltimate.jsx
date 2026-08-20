import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";
import { tFmt, dayStartIso, domainColor } from "./helpers";

/** AgendaTimelineUltimate — grote type "VANDAAG" + live tijdlijn van echte
 *  CalendarEvents vandaag, met domein-strook en "nu"-markering. · 3:2 */
export default function AgendaTimelineUltimate() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data, loading } = useEntityList("CalendarEvent", { filter: { start: { $gte: dayStartIso() } }, sort: "start", limit: 6, externalTick: learnTick });
  const list = (data || []).filter((e) => e.status !== "cancelled");
  const next = list[0];

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("agenda")} className="min-h-0" style={{ aspectRatio: "3 / 2", "--tile-accent": PLUM }}>
      <div className="flex h-full p-3 gap-3" style={{ color: PLUM }}>
        <div className="w-[33%] flex flex-col justify-between min-w-0">
          <WidgetHeader label="What's Happening?" />
          <div>
            <motion.h3 className="text-[28px] leading-[0.84] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>VAN<br />DAAG</motion.h3>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1">{list.length} afspraken</p>
          </div>
          <div>
            <span className="text-[22px] font-display font-semibold tabular-nums leading-none">{next ? tFmt(next.start) : "--:--"}</span>
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">volgende</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1 min-h-0 justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-full"><div className="h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: PLUM_FAINT, borderTopColor: PLUM }} /></div>
          ) : list.length ? list.slice(0, 5).map((e, i) => (
            <motion.div key={e.id} className="flex items-center gap-2 rounded-lg py-1 px-1.5" style={{ background: i === 0 ? PLUM_FAINT : "transparent" }} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <span className="text-[10px] font-semibold tabular-nums w-9 shrink-0">{tFmt(e.start)}</span>
              <span className="h-6 w-1 rounded-full shrink-0" style={{ background: domainColor(e.domain) }} />
              <span className="text-[11px] font-medium truncate flex-1 min-w-0">{e.title}</span>
              {i === 0 && <span className="text-[7px] uppercase tracking-[0.16em] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: SAGE, color: PLUM }}>nu</span>}
            </motion.div>
          )) : (
            <div className="text-center"><span className="text-[18px] font-display font-semibold opacity-40 block">vrij</span><p className="text-[10px] opacity-50">niets vandaag</p></div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}