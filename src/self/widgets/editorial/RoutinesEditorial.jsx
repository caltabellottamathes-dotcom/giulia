import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { todayRoutines } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Routines — breed & vierkant (2×2). Streak-raster + foto rechts. */
export default function RoutinesEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true, externalTick: learnTick });

  const liveDue = useMemo(() => todayRoutines(routines || []), [routines]);
  const due = liveDue.length ? liveDue : MOCK.routines;
  const done = due.filter((r) => r.status === "completed");
  const bestStreak = Math.max(0, ...(routines || []).map((r) => r.streak_count || 0), ...MOCK.routines.map((r) => r.streak_count));
  const rows = due.slice(0, 3);

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfroutines")} className="min-h-[200px]" style={{ "--tile-accent": PLUM }}>
      <div className="flex h-full gap-2.5 p-2.5" style={{ color: PLUM }}>
        <div className="flex-1 flex flex-col min-w-0">
          <WidgetHeader label="Routines" count={`${due.length} vandaag`} />
          <h3 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-0.5">{done.length}/{due.length}</h3>

          <div className="mt-2 flex items-end gap-2">
            <CountUp value={bestStreak} className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" />
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mb-1">langste<br />streak</p>
          </div>

          <div className="mt-2.5 space-y-1.5 flex-1 min-h-0">
            {rows.map((r, i) => {
              const s = Math.min(7, r.streak_count || 0);
              const ok = r.status === "completed";
              return (
                <div key={r.id || i} className="flex items-center gap-2.5">
                  <span className="text-[11px] truncate flex-1 opacity-85">{r.title}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <motion.span key={j} className="h-2 w-2 rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.04 * j + i * 0.08 }} style={{ background: j < s ? (ok ? PLUM : SAGE) : PLUM_FAINT }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-[32%] shrink-0 rounded-xl overflow-hidden">
          <img src={SELF_PHOTO.routines} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </WidgetShell>
  );
}