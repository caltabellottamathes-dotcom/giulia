import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

/** LiveEnergyCurve — LIVE GRAPH · 16:9. Streaming X/Y-gebiedsgrafiek met
 *  as-labels, grid, drempellijn (focus) en live data point. */
const W = 100, H = 46;
const INIT = [52, 58, 64, 60, 68, 72, 69, 75, 78, 73, 80, 76];

export default function LiveEnergyCurve() {
  const [vals, setVals] = useState(INIT);
  useEffect(() => {
    const id = setInterval(() => {
      setVals((v) => {
        const last = v[v.length - 1];
        const next = Math.max(30, Math.min(95, last + (Math.random() - 0.5) * 12));
        return [...v.slice(1), Math.round(next)];
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);
  const cur = vals[vals.length - 1];
  const pts = vals.map((val, i) => `${(i / (vals.length - 1)) * W},${H - (val / 100) * H}`);
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${W},${H} L 0,${H} Z`;
  const threshY = H - (70 / 100) * H;

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "16 / 9", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <div className="rounded-lg overflow-hidden h-8 shrink-0">
          <img src={SELF_PHOTO.personalTime} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Energy · Live Curve" />
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-semibold">
            <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: SAGE }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />{cur}%
          </span>
        </div>
        <div className="flex-1 relative min-h-0 flex">
          <div className="flex flex-col justify-between pr-1 text-[7px] tabular-nums opacity-45 w-4">
            {[100, 75, 50, 25, 0].map((y) => <span key={y}>{y}</span>)}
          </div>
          <div className="flex-1 relative">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" y1={H * g} x2={W} y2={H * g} stroke={PLUM} strokeWidth="0.3" opacity="0.1" />)}
              <line x1="0" y1={threshY} x2={W} y2={threshY} stroke={SAGE} strokeWidth="0.4" strokeDasharray="2 2" opacity="0.7" />
              <motion.path d={area} fill={PLUM} opacity="0.14" />
              <motion.path d={line} fill="none" stroke={PLUM} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={W} cy={H - (cur / 100) * H} r="1.4" fill={SAGE} />
            </svg>
            <span className="absolute right-1 text-[7px] uppercase tracking-wider font-semibold" style={{ top: "calc(30% - 8px)", color: SAGE }}>focus</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[7px] uppercase tracking-[0.18em] opacity-45">
          <span>-10 min</span><span>nu</span>
        </div>
      </div>
    </WidgetShell>
  );
}