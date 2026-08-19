import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT } from "./palette";

const A = ACCENT.focus;

/** TimeTracker — "Wat loopt?" Actieve timer + verstreken cirkel. */
export default function TimeTrackerGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: entries } = useEntityList("TimeEntry", { sort: "-start_time", realtime: true, externalTick: t });
  const active = (entries || []).find(e => e.start_time && !e.end_time);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (!active) return; const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, [active]);

  const elapsed = active ? Math.floor((now - new Date(active.start_time).getTime()) / 1000) : 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const arc = useMemo(() => { const m = mins % 60; return (m / 60) * 360; }, [mins]);
  const headline = active ? "LOOPT" : "STIL";
  const sub = active ? (active.task_title || active.project_title || "Actieve timer") : "Geen timer actief";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("timetracker")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Where My Time Goes." count={active ? "loopt" : "stil"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5 truncate">{sub}</p>
        <div className="mt-6 flex items-center justify-center flex-1">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              {active && (
                <motion.circle cx="50" cy="50" r="44" fill="none" stroke={A} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={276.46} animate={{ strokeDashoffset: 276.46 - (276.46 * arc) / 360 }} transition={{ duration: 0.8 }} />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {active ? (
                <>
                  <span className="text-[28px] font-display font-semibold tabular-nums text-current leading-none">{String(mins).padStart(2, "0")}</span>
                  <span className="text-[12px] font-mono tabular-nums opacity-50">:{String(secs).padStart(2, "0")}</span>
                </>
              ) : (
                <span className="text-[12px] uppercase tracking-[0.18em] opacity-40 font-semibold">geen timer</span>
              )}
            </div>
            {active && <motion.span className="absolute -top-1 left-1/2 h-2 w-2 rounded-full -translate-x-1/2" style={{ background: A }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />}
          </div>
        </div>
      </div>
      <BrandPhoto src={IMAGES.hourglassJacket} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{active ? `${mins} min bezig` : "Start een timer"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}