import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { timeBlockLabel, fmtDuration } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, CONTRAST, URGENT, CONCRETE, PLUM_GLASS, MOCK } from "./selfEditorial";

/** Personal Time — glas zweeft over de foto (foto boven, glas eronder).
 *  24u dag-balk met gekleurde zones. */
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
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfpersonaltime")} className="min-h-[200px] sm:col-span-2" style={{ "--tile-accent": CONTRAST, background: "transparent" }}>
      <div className="relative h-full w-full overflow-hidden rounded-[inherit] text-ivory">
        {/* foto boven als band */}
        <div className="absolute inset-x-0 top-0 h-[45%]">
          <img src={SELF_PHOTO.personalTime} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(48,23,40,0.35), rgba(48,23,40,0.98))" }} />
        </div>

        {/* glas-content onder, zweeft er deels overheen */}
        <div className="relative z-10 h-full p-5 flex flex-col mt-[12%]" style={{ background: "linear-gradient(180deg, rgba(48,23,40,0.40), rgba(48,23,40,0.62))", backdropFilter: "blur(18px) saturate(1.25)", WebkitBackdropFilter: "blur(18px) saturate(1.25)" }}>
          <WidgetHeader label="Personal Time" count={`${today.length} blokken`} />
          <div className="flex items-end justify-between mt-1">
            <div>
              <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">{headline}</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-65 mt-1.5">{protectedMin ? `${fmtDuration(protectedMin)} beschermd` : `${fmtDuration(total)} totaal`}</p>
            </div>
            <CountUp value={total} className="text-[44px] leading-none font-display font-semibold tabular-nums" />
          </div>

          <div className="mt-4 relative h-9 rounded-md bg-ivory/10 overflow-hidden">
            {Array.from({ length: 24 }).map((_, h) => (
              <span key={h} className="absolute top-0 bottom-0 w-px" style={{ left: `${(h / 24) * 100}%`, background: "rgba(255,255,255,0.07)" }} />
            ))}
            {today.map((b, i) => {
              const start = new Date(b.start);
              const sh = start.getHours() + start.getMinutes() / 60;
              const dur = b.duration_min || 30;
              const left = (sh / 24) * 100;
              const width = Math.min(100 - left, (dur / 60 / 24) * 100);
              const col = b.is_protected || b.type === "protected" ? CONTRAST : b.type === "rest" ? "#7d8a78" : b.type === "recovery" ? CONCRETE : "rgba(255,255,255,0.4)";
              return (
                <motion.div key={b.id || i} className="absolute top-0 bottom-0 rounded-sm" style={{ left: `${left}%`, background: col, opacity: 0.85 }} initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.9, ease: "easeOut" }} title={timeBlockLabel(b.type)} />
              );
            })}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[9px] uppercase tracking-wider opacity-55">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: CONTRAST }} />beschermd</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: "#7d8a78" }} />rust</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: CONCRETE }} />herstel</span>
          </div>

          <div className="flex-1" />
          <div className="flex items-center justify-end pt-2 border-t border-ivory/10">
            <button onClick={(e) => { e.stopPropagation(); openModule("selfpersonaltime"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}