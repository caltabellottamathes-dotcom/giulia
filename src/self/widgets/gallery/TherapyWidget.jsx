import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { PhotoCard, BehindCard } from "@/self/widgets/gallery/GlassPhoto";

const PLUM = "hsl(var(--self-primary))";
const SAGE_DEEP = "hsl(var(--self-accent-deep))";
const INK = "hsl(var(--foreground))";

/** TherapyWidget — glas + fotokaarten. Trajectory-lines op het glas;
 *  SELF-foto onder, crisp kaart boven. Eerstvolgende afspraak groot. */
export default function TherapyWidget() {
  const { openModule } = usePanel();
  const { data: trajectories } = useEntityList("TherapyTrajectory", { realtime: true });
  const active = useMemo(() => (trajectories || []).filter((t) => t.status === "active").slice(0, 3), [trajectories]);
  const next = (trajectories || []).find((t) => t.next_appointment);
  const nextDate = next?.next_appointment ? new Date(next.next_appointment) : null;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selftherapy")}
      className="lg:col-span-2 min-h-[320px] text-foreground"
      style={{ "--tile-accent": SAGE_DEEP }}>
      <div className="relative h-full p-6 overflow-hidden">
        <BehindCard src={IMAGES.selfTherapy} className="absolute right-4 top-4 w-[42%] h-[40%] z-0" dim={0.16} />

        <div className="relative z-10 flex flex-col h-full">
          <WidgetHeader label="Therapy" count={`${active.length} actief`} />
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-[42px] leading-none font-display font-semibold tracking-[-0.04em]" style={{ color: INK }}>THERAPY</h3>
            <span className="text-[42px] leading-none font-display font-semibold tabular-nums" style={{ color: PLUM }}>{String(active.length).padStart(2, "0")}</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50" style={{ color: INK }}>active trajectories</p>

          <div className="mt-5 space-y-4 flex-1">
            {active.length === 0 && <p className="text-sm opacity-50" style={{ color: INK }}>Geen actieve trajecten</p>}
            {active.map((t, i) => {
              const prog = Math.max(0, Math.min(100, t.progress || 0));
              return (
                <div key={t.id}>
                  <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1.5 truncate" style={{ color: INK }}>{t.title}</p>
                  <div className="relative h-2 rounded-full" style={{ background: "rgba(40,30,40,0.1)" }}>
                    <motion.div className="absolute top-0 left-0 h-full rounded-full" style={{ background: SAGE_DEEP }}
                      initial={{ width: 0 }} animate={{ width: `${prog}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                    <span className="absolute top-1/2 h-2.5 w-2.5 rounded-full" style={{ left: "0%", background: "rgba(40,30,40,0.45)", transform: "translate(-50%,-50%)" }} />
                    <span className="absolute top-1/2 h-3.5 w-3.5 rounded-full ring-2 ring-foreground/15" style={{ left: `${prog}%`, background: PLUM, transform: "translate(-50%,-50%)" }} />
                    <span className="absolute top-1/2 h-2 w-2 rounded-full" style={{ left: "100%", border: "1px solid rgba(40,30,40,0.35)", background: "transparent", transform: "translate(-50%,-50%)" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {nextDate && (
            <div className="mt-4 pt-4 border-t border-foreground/10 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-50" style={{ color: INK }}>Next appointment</p>
                <p className="text-sm font-semibold truncate" style={{ color: INK }}>{next?.title}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-[22px] font-display font-semibold leading-none" style={{ color: PLUM }}>{nextDate.toLocaleDateString("nl-NL", { weekday: "short" }).toUpperCase()}</p>
                <p className="text-[20px] font-display font-semibold tabular-nums leading-tight" style={{ color: PLUM }}>{nextDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          )}
        </div>

        <PhotoCard src={IMAGES.selfDoorway} className="absolute left-5 bottom-5 w-[24%] h-[22%] z-20" />
      </div>
    </WidgetShell>
  );
}