import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { todayRoutines, completedToday } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** RoutinesWidget — "animated timeline". Horizontale dag-timeline: done =
 *  gevuld, upcoming = open, active = gemarkeerd. Geïntegreerde progress-bar
 *  die zich tekent tot het dag-percentage. */
export default function RoutinesWidget() {
  const { openModule } = usePanel();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true });
  const today = useMemo(() => todayRoutines(routines || []), [routines]);
  const done = useMemo(() => completedToday(routines || []), [routines]);
  const total = today.length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  const next = today.find((r) => r.status !== "completed") || today[done.length];

  const pts = today.slice(0, 6).map((r, i) => ({
    r,
    label: r.preferred_time || `${8 + i * 2}:00`,
    done: r.status === "completed",
    isNext: r === next,
  }));

  return (
    <WidgetShell size="wide" radius="large" interactive onClick={() => openModule("selfroutines")}
      className="sm:col-span-2 lg:col-span-3 min-h-[220px]"
      style={{ background: "linear-gradient(150deg, hsl(var(--self-primary)) 0%, hsl(var(--self-primary-light)) 100%)", "--tile-accent": SAGE }}>
      <div className="p-6 flex flex-col h-full text-ivory">
        <div className="flex items-end justify-between">
          <div>
            <WidgetHeader label="Routines" />
            <h3 className="text-[34px] leading-none font-display font-semibold tracking-[-0.03em] mt-2">
              {done.length} <span className="opacity-40">/</span> {total} <span className="text-[13px] uppercase tracking-[0.2em] opacity-50 ml-1">today</span>
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[42px] leading-none font-display font-semibold tabular-nums" style={{ color: pct === 100 ? SAGE : SAGE }}>{pct}%</p>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mt-1">vandaag voltooid</p>
          </div>
        </div>

        <div className="relative mt-9 mb-4">
          <div className="absolute left-0 right-0 top-[18px] h-px" style={{ background: "rgba(255,255,255,0.14)" }} />
          <motion.div className="absolute left-0 top-[18px] h-px" style={{ background: SAGE }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
          <div className="relative flex justify-between">
            {pts.length === 0 && <p className="text-sm opacity-50">Geen routines vandaag</p>}
            {pts.map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider opacity-50">{p.label}</span>
                <motion.span className="h-3.5 w-3.5 rounded-full"
                  style={{ background: p.done ? SAGE : "transparent", border: p.done ? "none" : `1px solid ${p.isNext ? URGENT : "rgba(255,255,255,0.3)"}`, boxShadow: p.isNext && !p.done ? `0 0 0 4px ${URGENT}33` : "none" }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + i * 0.08 }} />
                <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: p.done ? SAGE : p.isNext ? URGENT : "rgba(255,255,255,0.4)" }}>{p.done ? "done" : p.isNext ? "next" : "up"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}