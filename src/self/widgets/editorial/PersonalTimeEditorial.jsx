import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import FloatPhoto from "./FloatPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { timeBlockLabel, fmtDuration } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, MOCK } from "./selfEditorial";

const track = "rgba(48,23,40,0.12)";

/** Personal Time — foto OVER glas (foto boven, volle breedte). 24u dag-balk
 *  met gekleurde zones. Plum = beschermd. */
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
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfpersonaltime")} className="min-h-[200px] sm:col-span-2" style={{ "--tile-accent": PLUM, overflow: "visible" }}>
      <FloatPhoto src={SELF_PHOTO.personalTime} edge="top" size="h-20" className="z-20" />
      <div className="relative z-10 h-full p-5 pt-14 flex flex-col" style={{ color: PLUM }}>
        <WidgetHeader label="Personal Time" count={`${today.length} blokken`} />
        <div className="flex items-end justify-between mt-1">
          <div>
            <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">{headline}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1.5">{protectedMin ? `${fmtDuration(protectedMin)} beschermd` : `${fmtDuration(total)} totaal`}</p>
          </div>
          <CountUp value={total} className="text-[44px] leading-none font-display font-semibold tabular-nums" />
        </div>

        <div className="mt-4 relative h-9 rounded-md overflow-hidden" style={{ background: track }}>
          {Array.from({ length: 24 }).map((_, h) => (
            <span key={h} className="absolute top-0 bottom-0 w-px" style={{ left: `${(h / 24) * 100}%`, background: "rgba(48,23,40,0.06)" }} />
          ))}
          {today.map((b, i) => {
            const start = new Date(b.start);
            const sh = start.getHours() + start.getMinutes() / 60;
            const dur = b.duration_min || 30;
            const left = (sh / 24) * 100;
            const width = Math.min(100 - left, (dur / 60 / 24) * 100);
            const col = b.is_protected || b.type === "protected" ? PLUM : b.type === "rest" ? "rgba(48,23,40,0.45)" : b.type === "recovery" ? "rgba(48,23,40,0.65)" : "rgba(48,23,40,0.3)";
            return (
              <motion.div key={b.id || i} className="absolute top-0 bottom-0 rounded-sm" style={{ left: `${left}%`, background: col }} initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.9, ease: "easeOut" }} title={timeBlockLabel(b.type)} />
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[9px] uppercase tracking-wider opacity-55">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: PLUM }} />beschermd</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: "rgba(48,23,40,0.45)" }} />rust</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: "rgba(48,23,40,0.65)" }} />herstel</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center justify-end pt-2 border-t border-black/10">
          <button onClick={(e) => { e.stopPropagation(); openModule("selfpersonaltime"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: PLUM, color: "#f2f2f0" }}>Open</button>
        </div>
      </div>
    </WidgetShell>
  );
}