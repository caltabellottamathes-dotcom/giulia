import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { todayRoutines } from "@/lib/selfUtils";
import { SELF_PHOTO, BURGUNDY, CONCRETE } from "./selfEditorial";

/** Routines — editorial information object (2×2).
 *  Metafoor: een streak-raster — per routine een rij met 7 dots (streak-lengte).
 *  Headline = voltooid/totaal vandaag; groot cijfer = langste streak. */
export default function RoutinesEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true, externalTick: learnTick });

  const due = useMemo(() => todayRoutines(routines || []), [routines]);
  const done = due.filter((r) => r.status === "completed");
  const bestStreak = Math.max(0, ...(routines || []).map((r) => r.streak_count || 0));
  const headline = due.length ? `${done.length}/${due.length} VANDAAG` : "RITME";
  const rows = due.slice(0, 4);

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfroutines")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": BURGUNDY }}>
      <div className="flex flex-col h-full text-ivory">
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <WidgetHeader label="Routines" count={due.length ? `${due.length} vandaag` : "oké"} />
          <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">streaks · ritme</p>

          <div className="mt-4 flex items-end gap-3">
            <CountUp value={bestStreak} className="text-[56px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" />
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">langste<br />streak</p>
          </div>

          {/* streak-raster */}
          <div className="mt-4 space-y-2 flex-1 min-h-0">
            {rows.length ? rows.map((r, i) => {
              const s = Math.min(7, r.streak_count || 0);
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-[11px] truncate flex-1 text-ivory/85">{r.title}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <motion.span key={j} className="h-2 w-2 rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.05 * j + i * 0.1 }} style={{ background: j < s ? (r.status === "completed" ? BURGUNDY : CONCRETE) : "rgba(255,255,255,0.14)" }} />
                    ))}
                  </div>
                </div>
              );
            }) : <p className="text-sm text-ivory/45 italic">Geen routines vandaag.</p>}
          </div>
        </div>

        <BrandPhoto src={SELF_PHOTO.routines} className="h-20 w-full -mt-4 rounded-t-[20px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.3)]" overlay="bg-gradient-to-t from-charcoal/65 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/70 font-semibold">{done.length} gedaan · {bestStreak} streak</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfroutines"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}