import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Personal Development — foto LINKS als ronde kaart, concentrische ringen rechts. */
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
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfdevelopment")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex h-full gap-3 p-3" style={{ color: PLUM }}>
        {/* foto links */}
        <div className="w-[34%] shrink-0 rounded-2xl overflow-hidden">
          <img src={SELF_PHOTO.development} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>

        {/* infographic rechts */}
        <div className="flex-1 flex flex-col min-w-0">
          <WidgetHeader label="Development" count={`${active.length} doelen`} />
          <h3 className="text-[26px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} DOELEN</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1">{areasOrMock.length} gebieden · {avg}% gemiddeld</p>

          <div className="mt-3 flex items-center gap-4 flex-1 min-h-0">
            {/* concentrische ringen */}
            <div className="relative w-[130px] h-[130px] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {rings.map((ring, i) => {
                  const c = 2 * Math.PI * ring.r;
                  return (
                    <g key={i} transform="rotate(-90 50 50)">
                      <circle cx="50" cy="50" r={ring.r} fill="none" stroke={SAGE} strokeWidth="5" />
                      <motion.circle cx="50" cy="50" r={ring.r} fill="none" stroke={PLUM} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - (ring.p || 0) / 100) }} transition={{ duration: 1.3, ease: "easeOut", delay: i * 0.12 }} />
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CountUp value={avg} className="text-[30px] font-display font-semibold tabular-nums" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              {top.map((g, i) => (
                <div key={g.id || i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: i === 0 ? PLUM : SAGE }} />
                  <span className="text-[11px] truncate flex-1 opacity-85">{g.title}</span>
                  <span className="text-[10px] tabular-nums opacity-65">{g.progress || 0}%</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {areasOrMock.map((a) => <span key={a} className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: PLUM_FAINT }}>{a}</span>)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t" style={{ borderColor: PLUM_FAINT }}>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfdevelopment"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}