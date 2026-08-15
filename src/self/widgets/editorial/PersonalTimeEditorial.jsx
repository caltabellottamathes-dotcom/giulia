import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { timeBlockColor, timeBlockLabel, totalPersonalTimeToday, fmtDuration } from "@/lib/selfUtils";
import { SELF_PHOTO, BURGUNDY, CONCRETE, SAGE } from "./selfEditorial";

/** Personal Time — editorial information object (2×1 breed).
 *  Metafoor: een 24u dag-balk met gekleurde zones (beschermd = burgundy,
 *  rust = sage, herstel = beton). Rust/threads-metafoor. */
export default function PersonalTimeEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: blocks } = useEntityList("PersonalTimeBlock", { realtime: true, externalTick: learnTick });

  const today = useMemo(() => (blocks || []).filter((b) => {
    if (!b.start || b.status === "cancelled") return false;
    return new Date(b.start).toDateString() === new Date().toDateString();
  }), [blocks]);

  const total = totalPersonalTimeToday(blocks || []);
  const protectedMin = today.filter((b) => b.is_protected || b.type === "protected").reduce((s, b) => s + (b.duration_min || 0), 0);
  const headline = protectedMin ? "BESCHERMD" : total ? "RUST" : "VRIJ";

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfpersonaltime")} className="min-h-[200px] sm:col-span-2" style={{ "--tile-accent": BURGUNDY }}>
      <div className="flex flex-col h-full text-ivory">
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <WidgetHeader label="Personal Time" count={today.length ? `${today.length} blokken` : "vrij"} />
          <div className="flex items-end justify-between mt-1">
            <div>
              <h3 className="text-[26px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">{headline}</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{protectedMin ? `${fmtDuration(protectedMin)} beschermd` : `${fmtDuration(total)} totaal`}</p>
            </div>
            <CountUp value={total} className="text-[44px] leading-none font-display font-semibold tabular-nums" />
          </div>

          {/* 24u dag-balk */}
          <div className="mt-5 relative h-10 rounded-md bg-ivory/8 overflow-hidden">
            {/* uur-streepjes */}
            {Array.from({ length: 24 }).map((_, h) => (
              <span key={h} className="absolute top-0 bottom-0 w-px" style={{ left: `${(h / 24) * 100}%`, background: "rgba(255,255,255,0.06)" }} />
            ))}
            {today.map((b) => {
              const start = new Date(b.start);
              const sh = start.getHours() + start.getMinutes() / 60;
              const dur = b.duration_min || 30;
              const left = (sh / 24) * 100;
              const width = Math.min(100 - left, (dur / 60 / 24) * 100);
              const col = b.is_protected || b.type === "protected" ? BURGUNDY : b.type === "rest" ? SAGE : b.type === "recovery" ? CONCRETE : "rgba(255,255,255,0.4)";
              return (
                <motion.div key={b.id} className="absolute top-0 bottom-0 rounded-sm" style={{ left: `${left}%`, background: col, opacity: 0.85 }} initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.9, ease: "easeOut" }} title={timeBlockLabel(b.type)} />
              );
            })}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[9px] uppercase tracking-wider opacity-50">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: BURGUNDY }} />beschermd</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: SAGE }} />rust</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: CONCRETE }} />herstel</span>
          </div>
        </div>

        <BrandPhoto src={SELF_PHOTO.personalTime} className="h-20 w-full -mt-4 rounded-t-[20px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.3)]" overlay="bg-gradient-to-t from-charcoal/65 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/70 font-semibold">rust · threads</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfpersonaltime"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}