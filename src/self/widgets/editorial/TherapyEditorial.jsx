import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtDate } from "@/lib/selfUtils";
import { SELF_PHOTO, BURGUNDY, CONCRETE } from "./selfEditorial";

/** Therapy — editorial information object (2×1 breed).
 *  Metafoor: een horizontale voortgangstijdlijn met doel-nodes en een
 *  markeerpunt voor de volgende afspraak. Sessie/verbinding-metafoor. */
export default function TherapyEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: trajectories } = useEntityList("TherapyTrajectory", { realtime: true, externalTick: learnTick });

  const active = (trajectories || []).filter((t) => t.status === "active");
  const avg = active.length ? Math.round(active.reduce((s, t) => s + (t.progress || 0), 0) / active.length) : 0;
  const next = useMemo(() => {
    const now = Date.now();
    return (trajectories || [])
      .filter((t) => t.next_appointment && new Date(t.next_appointment).getTime() > now)
      .sort((a, b) => new Date(a.next_appointment) - new Date(b.next_appointment))[0];
  }, [trajectories]);
  const headline = active.length ? "TRAJECT" : "RUST";
  const goals = active.reduce((s, t) => s + (t.goals?.length || 0), 0);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selftherapy")} className="min-h-[200px] sm:col-span-2" style={{ "--tile-accent": BURGUNDY }}>
      <div className="flex flex-col h-full text-ivory">
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <WidgetHeader label="Therapy" count={active.length ? `${active.length} actief` : "—"} />
          <div className="flex items-end justify-between mt-1">
            <div>
              <h3 className="text-[26px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">{headline}</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{next ? `Volgende · ${fmtDate(next.next_appointment)}` : "Geen afspraak gepland"}</p>
            </div>
            <CountUp value={avg} className="text-[48px] leading-none font-display font-semibold tabular-nums" />
          </div>

          {/* horizontale voortgangstijdlijn */}
          <div className="mt-5 relative h-10 flex items-center">
            <div className="absolute left-0 right-0 h-px" style={{ background: CONCRETE, opacity: 0.4 }} />
            <motion.div className="absolute left-0 h-px" style={{ background: BURGUNDY }} animate={{ width: `${avg}%` }} transition={{ duration: 1.1, ease: "easeOut" }} />
            {Array.from({ length: 5 }).map((_, i) => {
              const at = (i / 4) * 100;
              const reached = avg >= at;
              return (
                <motion.span key={i} className="absolute -translate-x-1/2 h-3 w-3 rounded-full" style={{ left: `${at}%`, background: reached ? BURGUNDY : "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.2)" }} animate={{ scale: reached ? 1 : 0.7 }} />
              );
            })}
          </div>
        </div>

        <BrandPhoto src={SELF_PHOTO.therapy} className="h-20 w-full -mt-4 rounded-t-[20px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.3)]" overlay="bg-gradient-to-t from-charcoal/65 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/70 font-semibold">{active.length} traject · {goals} doelen</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selftherapy"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}