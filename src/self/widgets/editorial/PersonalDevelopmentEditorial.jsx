import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { goalTypeLabel } from "@/lib/selfUtils";
import { SELF_PHOTO, BURGUNDY, CONCRETE } from "./selfEditorial";

/** Personal Development — editorial information object (2×2).
 *  Metafoor: concentrische doel-ringen — drie geneste bogen voor de top-3
 *  doelen, plus gebied-chips. Structuur/groei-metafoor. */
export default function PersonalDevelopmentEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: goals } = useEntityList("SelfGoal", { realtime: true, externalTick: learnTick });

  const active = (goals || []).filter((g) => g.status === "active");
  const top = useMemo(() => [...active].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 3), [active]);
  const areas = useMemo(() => Array.from(new Set(active.map((g) => g.area).filter(Boolean))).slice(0, 4), [active]);
  const avg = active.length ? Math.round(active.reduce((s, g) => s + (g.progress || 0), 0) / active.length) : 0;

  const rings = [
    { r: 42, p: top[0]?.progress || 0 },
    { r: 32, p: top[1]?.progress || 0 },
    { r: 22, p: top[2]?.progress || 0 },
  ];

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfdevelopment")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": BURGUNDY }}>
      <div className="flex flex-col h-full text-ivory">
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <WidgetHeader label="Development" count={active.length ? `${active.length} doelen` : "—"} />
          <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} DOELEN</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{areas.length} gebieden · {avg}% gemiddeld</p>

          <div className="mt-4 flex items-center gap-5 flex-1 min-h-0">
            {/* concentriske doel-ringen */}
            <div className="relative w-[120px] h-[120px] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {rings.map((ring, i) => {
                  const c = 2 * Math.PI * ring.r;
                  return (
                    <g key={i} transform="rotate(-90 50 50)">
                      <circle cx="50" cy="50" r={ring.r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                      <motion.circle cx="50" cy="50" r={ring.r} fill="none" stroke={i === 0 ? BURGUNDY : CONCRETE} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - (ring.p || 0) / 100) }} transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }} />
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CountUp value={avg} className="text-[28px] font-display font-semibold tabular-nums" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              {top.length ? top.map((g, i) => (
                <div key={g.id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: i === 0 ? BURGUNDY : CONCRETE }} />
                  <span className="text-[11px] truncate flex-1 text-ivory/85">{g.title}</span>
                  <span className="text-[10px] tabular-nums opacity-60">{g.progress || 0}%</span>
                </div>
              )) : <p className="text-sm text-ivory/45 italic">Geen actieve doelen.</p>}
              {areas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {areas.map((a) => <span key={a} className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-ivory/20 text-ivory/70">{a}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <BrandPhoto src={SELF_PHOTO.development} className="h-20 w-full -mt-4 rounded-t-[20px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.3)]" overlay="bg-gradient-to-t from-charcoal/65 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/70 font-semibold">groei · structuur</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfdevelopment"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}