import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";

const SAGE = "hsl(var(--self-accent))";

/** TherapyWidget — "trajectory system". Per traject een progression-line met
 *  start / now / next markers. Eerstvolgende afspraak als groot typografisch
 *  element. Markers bewegen bij progress. */
export default function TherapyWidget() {
  const { openModule } = usePanel();
  const { data: trajectories } = useEntityList("TherapyTrajectory", { realtime: true });
  const active = useMemo(() => (trajectories || []).filter((t) => t.status === "active").slice(0, 3), [trajectories]);
  const next = (trajectories || []).find((t) => t.next_appointment);
  const nextDate = next?.next_appointment ? new Date(next.next_appointment) : null;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selftherapy")}
      className="lg:col-span-2 min-h-[320px]"
      style={{ background: "linear-gradient(150deg, hsl(var(--self-primary)) 0%, hsl(var(--self-primary-light)) 100%)", "--tile-accent": SAGE }}>
      <div className="p-6 h-full flex flex-col text-ivory">
        <WidgetHeader label="Therapy" count={`${active.length} actief`} />
        <div className="flex items-end justify-between mt-3">
          <h3 className="text-[42px] leading-none font-display font-semibold tracking-[-0.04em]">THERAPY</h3>
          <span className="text-[42px] leading-none font-display font-semibold tabular-nums" style={{ color: SAGE }}>{String(active.length).padStart(2, "0")}</span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">active trajectories</p>

        <div className="mt-5 space-y-4 flex-1">
          {active.length === 0 && <p className="text-sm opacity-50">Geen actieve trajecten</p>}
          {active.map((t, i) => {
            const prog = Math.max(0, Math.min(100, t.progress || 0));
            return (
              <div key={t.id}>
                <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1.5 truncate">{t.title}</p>
                <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div className="absolute top-0 left-0 h-full rounded-full" style={{ background: SAGE }}
                    initial={{ width: 0 }} animate={{ width: `${prog}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                  <span className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full" style={{ left: "0%", background: "rgba(255,255,255,0.5)", transform: "translate(-50%,-50%)" }} />
                  <span className="absolute top-1/2 h-3.5 w-3.5 rounded-full ring-2 ring-ivory/20" style={{ left: `${prog}%`, background: SAGE, transform: "translate(-50%,-50%)" }} />
                  <span className="absolute top-1/2 h-2 w-2 rounded-full border border-ivory/40" style={{ left: "100%", background: "transparent", transform: "translate(-50%,-50%)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {nextDate && (
          <div className="mt-4 pt-4 border-t border-ivory/10 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-50">Next appointment</p>
              <p className="text-sm font-semibold truncate">{next?.title}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-[22px] font-display font-semibold leading-none">{nextDate.toLocaleDateString("nl-NL", { weekday: "short" }).toUpperCase()}</p>
              <p className="text-[20px] font-display font-semibold tabular-nums leading-tight">{nextDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}