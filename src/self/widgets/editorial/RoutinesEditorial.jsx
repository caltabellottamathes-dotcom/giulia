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

/** Routines — foto RECHTS als ronde kaart, infographic links. Streak-raster. */
export default function RoutinesEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true, externalTick: learnTick });

  const liveDue = useMemo(() => todayRoutines(routines || []), [routines]);
  const due = liveDue.length ? liveDue : MOCK.routines;
  const done = due.filter((r) => r.status === "completed");
  const bestStreak = Math.max(0, ...(routines || []).map((r) => r.streak_count || 0), ...MOCK.routines.map((r) => r.streak_count));
  const pct = due.length ? Math.round((done.length / due.length) * 100) : 0;
  const rows = due.slice(0, 4);

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfroutines")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex h-full gap-3 p-3" style={{ color: PLUM }}>
        {/* infographic links */}
        <div className="flex-1 flex flex-col min-w-0">
          <WidgetHeader label="Routines" count={`${due.length} vandaag`} />
          <div className="flex items-end gap-3 mt-1">
            <h3 className="text-[26px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">{done.length}/{due.length}</h3>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-55 mb-1">vandaag</span>
          </div>

          <div className="mt-3 flex items-end gap-3">
            <CountUp value={bestStreak} className="text-[64px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" />
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mb-2">langste<br />streak</p>
            <div className="ml-auto text-right">
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">voltooid</p>
              <span className="text-[22px] font-display font-semibold tabular-nums">{pct}%</span>
            </div>
          </div>

          {/* streak-raster */}
          <div className="mt-4 space-y-2.5 flex-1 min-h-0">
            {rows.map((r, i) => {
              const s = Math.min(7, r.streak_count || 0);
              const ok = r.status === "completed";
              return (
                <div key={r.id || i} className="flex items-center gap-3">
                  <span className="text-[11px] truncate flex-1 opacity-85">{r.title}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <motion.span key={j} className="h-2.5 w-2.5 rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.04 * j + i * 0.08 }} style={{ background: j < s ? (ok ? PLUM : SAGE) : PLUM_FAINT }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end pt-2 border-t" style={{ borderColor: PLUM_FAINT }}>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfroutines"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
          </div>
        </div>

        {/* foto rechts — ronde kaart, geen overlay */}
        <div className="w-[38%] shrink-0 rounded-2xl overflow-hidden">
          <img src={SELF_PHOTO.routines} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </WidgetShell>
  );
}