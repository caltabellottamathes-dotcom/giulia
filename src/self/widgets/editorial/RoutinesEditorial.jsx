import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import FloatPhoto from "./FloatPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { todayRoutines } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, MOCK } from "./selfEditorial";

const track = "rgba(48,23,40,0.14)";

/** Routines — foto OVER glas (foto onder, volle breedte). Streak-raster. */
export default function RoutinesEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true, externalTick: learnTick });

  const liveDue = useMemo(() => todayRoutines(routines || []), [routines]);
  const due = liveDue.length ? liveDue : MOCK.routines;
  const done = due.filter((r) => r.status === "completed");
  const bestStreak = Math.max(0, ...(routines || []).map((r) => r.streak_count || 0), ...MOCK.routines.map((r) => r.streak_count));
  const headline = `${done.length}/${due.length} VANDAAG`;
  const rows = due.slice(0, 4);

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfroutines")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": PLUM, overflow: "visible" }}>
      <div className="relative z-10 h-full p-5 pb-20 flex flex-col" style={{ color: PLUM }}>
        <WidgetHeader label="Routines" count={`${due.length} vandaag`} />
        <h3 className="text-[30px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1.5">streaks · ritme</p>

        <div className="mt-4 flex items-end gap-3">
          <CountUp value={bestStreak} className="text-[60px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" />
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mb-2">langste<br />streak</p>
        </div>

        <div className="mt-4 space-y-2.5 flex-1 min-h-0">
          {rows.map((r, i) => {
            const s = Math.min(7, r.streak_count || 0);
            const ok = r.status === "completed";
            return (
              <div key={r.id || i} className="flex items-center gap-3">
                <span className="text-[11px] truncate flex-1 opacity-85">{r.title}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <motion.span key={j} className="h-2 w-2 rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.04 * j + i * 0.08 }} style={{ background: j < s ? (ok ? PLUM : "rgba(48,23,40,0.45)") : track }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-end pt-3 border-t border-black/10">
          <button onClick={(e) => { e.stopPropagation(); openModule("selfroutines"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: PLUM, color: "#f2f2f0" }}>Open</button>
        </div>
      </div>
      <FloatPhoto src={SELF_PHOTO.routines} edge="bottom" size="h-28" className="z-20" />
    </WidgetShell>
  );
}