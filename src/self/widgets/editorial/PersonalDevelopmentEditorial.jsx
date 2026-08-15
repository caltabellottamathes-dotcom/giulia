import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import FloatPhoto from "./FloatPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, CONTRAST, MOCK } from "./selfEditorial";

const track = "rgba(48,23,40,0.12)";

/** Personal Development — glas OVER foto (foto rechts, volle hoogte, breder).
 *  Concentrische doel-ringen + gebied-chips. Plum hoofdaccent, contrast chips. */
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
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfdevelopment")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": PLUM, overflow: "visible", background: "transparent" }}>
      <FloatPhoto src={SELF_PHOTO.development} edge="right" size="w-36" className="z-0" />
      <div className="relative z-10 h-full p-5 pr-32 glass-2 rounded-[inherit] flex flex-col" style={{ color: PLUM }}>
        <WidgetHeader label="Development" count={`${active.length} doelen`} />
        <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} DOELEN</h3>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1.5">{areasOrMock.length} gebieden · {avg}% gemiddeld</p>

        <div className="mt-4 flex items-center gap-5 flex-1 min-h-0">
          <div className="relative w-[120px] h-[120px] shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {rings.map((ring, i) => {
                const c = 2 * Math.PI * ring.r;
                return (
                  <g key={i} transform="rotate(-90 50 50)">
                    <circle cx="50" cy="50" r={ring.r} fill="none" stroke={track} strokeWidth="5" />
                    <motion.circle cx="50" cy="50" r={ring.r} fill="none" stroke={i === 0 ? PLUM : "rgba(48,23,40,0.5)"} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - (ring.p || 0) / 100) }} transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }} />
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
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: i === 0 ? PLUM : "rgba(48,23,40,0.45)" }} />
                <span className="text-[11px] truncate flex-1 opacity-85">{g.title}</span>
                <span className="text-[10px] tabular-nums opacity-60">{g.progress || 0}%</span>
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {areasOrMock.map((a) => <span key={a} className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: CONTRAST, color: PLUM }}>{a}</span>)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-black/10">
          <button onClick={(e) => { e.stopPropagation(); openModule("selfdevelopment"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: PLUM, color: "#f2f2f0" }}>Open</button>
        </div>
      </div>
    </WidgetShell>
  );
}