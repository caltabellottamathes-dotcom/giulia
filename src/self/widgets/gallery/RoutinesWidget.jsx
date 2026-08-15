import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { todayRoutines, completedToday } from "@/lib/selfUtils";
import { PhotoCard, BehindCard } from "@/self/widgets/gallery/GlassPhoto";

const PLUM = "hsl(var(--self-primary))";
const SAGE_DEEP = "hsl(var(--self-accent-deep))";
const URGENT = "hsl(var(--self-urgent))";
const INK = "hsl(var(--foreground))";

/** RoutinesWidget — glas + fotokaarten. Animated timeline op het glas,
 *  SELF-foto als band onder het glas, een crisp kaart boven. */
export default function RoutinesWidget() {
  const { openModule } = usePanel();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true });
  const today = useMemo(() => todayRoutines(routines || []), [routines]);
  const done = useMemo(() => completedToday(routines || []), [routines]);
  const total = today.length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  const next = today.find((r) => r.status !== "completed") || today[done.length];
  const pts = today.slice(0, 6).map((r, i) => ({ r, label: r.preferred_time || `${8 + i * 2}:00`, done: r.status === "completed", isNext: r === next }));

  return (
    <WidgetShell size="wide" radius="large" interactive onClick={() => openModule("selfroutines")}
      className="sm:col-span-2 lg:col-span-3 min-h-[220px] text-foreground"
      style={{ "--tile-accent": SAGE_DEEP }}>
      <div className="relative h-full p-6 overflow-hidden">
        <BehindCard src={IMAGES.selfRoutines} className="absolute left-1/2 -translate-x-1/2 bottom-3 w-[40%] h-[58%] z-0" dim={0.14} />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-end justify-between">
            <div>
              <WidgetHeader label="Routines" />
              <h3 className="text-[34px] leading-none font-display font-semibold tracking-[-0.03em] mt-2" style={{ color: INK }}>
                {done.length} <span className="opacity-30">/</span> {total} <span className="text-[13px] uppercase tracking-[0.2em] opacity-50 ml-1">today</span>
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[42px] leading-none font-display font-semibold tabular-nums" style={{ color: pct === 100 ? SAGE_DEEP : PLUM }}>{pct}%</p>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mt-1" style={{ color: INK }}>vandaag voltooid</p>
            </div>
          </div>

          <div className="relative mt-9 mb-2 flex-1">
            <div className="absolute left-0 right-0 top-[18px] h-px" style={{ background: "rgba(40,30,40,0.16)" }} />
            <motion.div className="absolute left-0 top-[18px] h-px" style={{ background: SAGE_DEEP }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            <div className="relative flex justify-between">
              {pts.length === 0 && <p className="text-sm opacity-50" style={{ color: INK }}>Geen routines vandaag</p>}
              {pts.map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider opacity-50" style={{ color: INK }}>{p.label}</span>
                  <motion.span className="h-3.5 w-3.5 rounded-full"
                    style={{ background: p.done ? SAGE_DEEP : "transparent", border: p.done ? "none" : `1px solid ${p.isNext ? URGENT : "rgba(40,30,40,0.3)"}`, boxShadow: p.isNext && !p.done ? `0 0 0 4px ${URGENT}33` : "none" }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + i * 0.08 }} />
                  <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: p.done ? SAGE_DEEP : p.isNext ? URGENT : "rgba(40,30,40,0.4)" }}>{p.done ? "done" : p.isNext ? "next" : "up"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <PhotoCard src={IMAGES.selfFolded} className="absolute left-5 bottom-5 w-[22%] h-[40%] z-20" />
      </div>
    </WidgetShell>
  );
}