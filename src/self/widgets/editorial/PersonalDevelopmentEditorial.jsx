import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, CONTRAST, CONCRETE, PLUM_GLASS, MOCK } from "./selfEditorial";

/** Personal Development — foto LINKS als grote kolom, glas-content rechts.
 *  Concentrische doel-ringen + gebied-chips. */
export default function PersonalDevelopmentEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: goals } = useEntityList("SelfGoal", { realtime: true, externalTick: learnTick });

  const liveActive = (goals || []).filter((g) => g.status === "active");
  const active = liveActive.length ? liveActive : MOCK.development.goals;
  const top = useMemo(() => [...active].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 3), [active]);
  const areas = useMemo(() => Array.from(new Set(active.map((g) => g.area).filter(Boolean))), [active]);
  const areasOrMock = areas.length ? areas : MOCK.development.areas;
  const avg = liveActive.length ? Math.round(liveActive.reduce((s, g) => s + (g.progress || 0), 0) / liveActive.length) : MOCK.development.avg;

  const rings = [
    { r: 42, p: top[0]?.progress || 0 },
    { r: 32, p: top[1]?.progress || 0 },
    { r: 22, p: top[2]?.progress || 0 },
  ];

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfdevelopment")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": CONTRAST, background: PLUM_GLASS, backdropFilter: "blur(22px) saturate(1.3)", WebkitBackdropFilter: "blur(22px) saturate(1.3)" }}>
      <div className="relative h-full flex rounded-[inherit] overflow-hidden text-ivory">
        {/* foto links — grote kolom */}
        <div className="relative w-[36%] shrink-0">
          <img src={SELF_PHOTO.development} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to left, rgba(48,23,40,0.92), rgba(48,23,40,0.15) 40%, rgba(48,23,40,0.45) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/70 font-semibold">groei · structuur</p>
          </div>
        </div>

        {/* glas-content rechts */}
        <div className="flex-1 p-5 flex flex-col min-w-0">
          <WidgetHeader label="Development" count={`${active.length} doelen`} />
          <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} DOELEN</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-1.5">{areasOrMock.length} gebieden · {avg}% gemiddeld</p>

          <div className="mt-4 flex items-center gap-5 flex-1 min-h-0">
            <div className="relative w-[120px] h-[120px] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {rings.map((ring, i) => {
                  const c = 2 * Math.PI * ring.r;
                  return (
                    <g key={i} transform="rotate(-90 50 50)">
                      <circle cx="50" cy="50" r={ring.r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
                      <motion.circle cx="50" cy="50" r={ring.r} fill="none" stroke={i === 0 ? CONTRAST : CONCRETE} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - (ring.p || 0) / 100) }} transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }} />
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CountUp value={avg} className="text-[28px] font-display font-semibold tabular-nums" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              {top.map((g, i) => (
                <div key={g.id || i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: i === 0 ? CONTRAST : CONCRETE }} />
                  <span className="text-[11px] truncate flex-1 text-ivory/85">{g.title}</span>
                  <span className="text-[10px] tabular-nums opacity-65">{g.progress || 0}%</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {areasOrMock.map((a) => <span key={a} className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-ivory/20 text-ivory/70">{a}</span>)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-ivory/10">
            <button onClick={(e) => { e.stopPropagation(); openModule("selfdevelopment"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}