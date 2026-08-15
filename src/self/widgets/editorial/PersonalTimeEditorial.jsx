import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { timeBlockLabel, fmtDuration } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Personal Time — foto LINKS, 24u dag-balk rechts. */
export default function PersonalTimeEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: blocks } = useEntityList("PersonalTimeBlock", { realtime: true, externalTick: learnTick });

  const liveToday = useMemo(() => (blocks || []).filter((b) => {
    if (!b.start || b.status === "cancelled") return false;
    return new Date(b.start).toDateString() === new Date().toDateString();
  }), [blocks]);
  const today = liveToday.length ? liveToday : MOCK.personalTime.blocks;
  const total = today.reduce((s, b) => s + (b.duration_min || 0), 0) || MOCK.personalTime.total;
  const protectedMin = today.filter((b) => b.is_protected || b.type === "protected").reduce((s, b) => s + (b.duration_min || 0), 0) || MOCK.personalTime.protected;
  const headline = protectedMin ? "BESCHERMD" : total ? "RUST" : "VRIJ";

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfpersonaltime")} className="min-h-[200px] sm:col-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex h-full gap-3 p-3" style={{ color: PLUM }}>
        {/* foto links */}
        <div className="w-[32%] shrink-0 rounded-2xl overflow-hidden">
          <img src={SELF_PHOTO.personalTime} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>

        {/* infographic rechts */}
        <div className="flex-1 flex flex-col min-w-0">
          <WidgetHeader label="Personal Time" count={`${today.length} blokken`} />
          <div className="flex items-end justify-between mt-1">
            <div>
              <h3 className="text-[26px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">{headline}</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1.5">{protectedMin ? `${fmtDuration(protectedMin)} beschermd` : `${fmtDuration(total)} totaal`}</p>
            </div>
            <CountUp value={total} className="text-[48px] leading-none font-display font-semibold tabular-nums" />
          </div>

          {/* 24u dag-balk */}
          <div className="mt-4 relative h-10 rounded-lg overflow-hidden" style={{ background: PLUM_FAINT }}>
            {Array.from({ length: 24 }).map((_, h) => (
              <span key={h} className="absolute top-0 bottom-0 w-px" style={{ left: `${(h / 24) * 100}%`, background: `${PLUM}14` }} />
            ))}
            {today.map((b, i) => {
              const start = new Date(b.start);
              const sh = start.getHours() + start.getMinutes() / 60;
              const dur = b.duration_min || 30;
              const left = (sh / 24) * 100;
              const width = Math.min(100 - left, (dur / 60 / 24) * 100);
              const col = b.is_protected || b.type === "protected" ? PLUM : SAGE;
              return (
                <motion.div key={b.id || i} className="absolute top-0 bottom-0 rounded-md" style={{ left: `${left}%`, background: col, opacity: 0.9 }} initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.9, ease: "easeOut" }} title={timeBlockLabel(b.type)} />
              );
            })}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[9px] uppercase tracking-wider opacity-60">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: PLUM }} />beschermd</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: SAGE }} />rust / herstel</span>
          </div>

          <div className="flex-1" />
          <div className="flex items-center justify-end pt-2 border-t" style={{ borderColor: PLUM_FAINT }}>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfpersonaltime"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}