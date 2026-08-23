import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { stateLabel, fmtAgo } from "@/lib/selfUtils";

const PHOTO = IMAGES.lifeW6Doing;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";
const IVORY = "hsl(var(--ivory))";

const MOOD_SCORE = { good: 80, energetic: 95, neutral: 55, low: 30, tired: 35, anxious: 20 };

/** HowDoingWidget — P·1x1·B·STRIP · "How I'm Doing."
 *  Photo + concentrische ringen (Energy/Capacity/Mood) gecentreerd, state-label
 *  in het midden. GlassStrip (onder): header + drie mini-stats. Data: SelfCheckIn. */
export default function HowDoingWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 20, realtime: true, externalTick: learnTick });

  const latest = (checkIns || [])[0];
  const energy = latest?.energy ?? 0;
  const capacity = latest?.capacity ?? 0;
  const mood = latest ? (MOOD_SCORE[latest.mood] ?? 50) : 0;
  const stateText = latest ? stateLabel(latest.state).toUpperCase() : "CHECK IN";

  const RINGS = [
    { key: "energy", label: "E", r: 46, val: energy, color: DEEP },
    { key: "capacity", label: "C", r: 34, val: capacity, color: LIGHT },
    { key: "mood", label: "M", r: 22, val: mood, color: URGENT },
  ];

  return (
    <div className="relative w-[340px] h-[340px] rounded-[28px] overflow-hidden" onClick={() => openModule("dailystate")} style={{ cursor: "pointer" }}>
      <img src={PHOTO} alt="How I'm Doing" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/20" />

      <div className="absolute" style={{ left: "50%", top: "40%", transform: "translate(-50%,-50%)" }}>
        <div className="relative w-[220px] h-[220px]">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <g transform="rotate(-90 60 60)">
              {RINGS.map((ring, idx) => {
                const circ = 2 * Math.PI * ring.r;
                const frac = Math.min(1, Math.max(0, ring.val / 100));
                const offset = circ * (1 - frac);
                return (
                  <g key={ring.key}>
                    <circle cx="60" cy="60" r={ring.r} fill="none" stroke={ring.color} strokeOpacity="0.16" strokeWidth="6" />
                    <motion.circle cx="60" cy="60" r={ring.r} fill="none" stroke={ring.color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: idx * 0.12 }} />
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: IVORY }}>
            <span className="text-[22px] font-display font-bold leading-none">{stateText}</span>
            <span className="text-[8px] uppercase tracking-[0.24em] mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>{latest ? fmtAgo(latest.timestamp) : "—"}</span>
          </div>
        </div>
      </div>

      <div className="absolute left-0 right-0 bottom-0 h-[32%] rounded-t-[28px] flex flex-col p-3.5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />
        <WidgetHeader type="pulse" label="How I'm Doing." count={latest ? `${energy}%` : ""} />
        <div className="flex justify-between gap-1 mt-1.5 flex-1 items-end">
          {RINGS.map((r) => (
            <div key={r.key} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: r.color }} />
              <div className="flex flex-col leading-none">
                <span className="text-[7.5px] uppercase tracking-[0.16em] opacity-50">{r.label}</span>
                <span className="text-[18px] font-display font-bold tabular-nums">{Math.round(r.val)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}