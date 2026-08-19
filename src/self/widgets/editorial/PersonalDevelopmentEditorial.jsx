import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

/** Personal Development — breed & vierkant (2×2). Concentrische ringen + lijst + foto links. */
export default function PersonalDevelopmentEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: goals } = useEntityList("SelfGoal", { realtime: true, externalTick: learnTick });

  const liveActive = (goals || []).filter((g) => g.status === "active");
  const active = liveActive.length ? liveActive : MOCK.development.goals;
  const top = useMemo(() => [...active].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 3), [active]);
  const avg = liveActive.length ? Math.round(liveActive.reduce((s, g) => s + (g.progress || 0), 0) / liveActive.length) : MOCK.development.avg;

  const rings = [
    { r: 42, p: top[0]?.progress || 0 },
    { r: 32, p: top[1]?.progress || 0 },
    { r: 22, p: top[2]?.progress || 0 },
  ];

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("development")} className="min-h-[210px]" style={{ "--tile-accent": PLUM }}>
      <div className="flex h-full gap-2.5 p-2.5" style={{ color: PLUM }}>
        <div className="w-[30%] shrink-0 rounded-xl overflow-hidden">
          <img src={SELF_PHOTO.development} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <WidgetHeader label="Becoming Me." count={`${active.length} doelen`} />
          <h3 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-0.5">{active.length} DOELEN</h3>

          <div className="mt-2 flex items-center gap-3 flex-1 min-h-0">
            <div className="relative w-[96px] h-[96px] shrink-0">
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
                <CountUp value={avg} className="text-[22px] font-display font-semibold tabular-nums" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              {top.map((g, i) => (
                <div key={g.id || i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: i === 0 ? PLUM : SAGE }} />
                  <span className="text-[10px] truncate flex-1 opacity-85">{g.title}</span>
                  <span className="text-[9px] tabular-nums opacity-65">{g.progress || 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}