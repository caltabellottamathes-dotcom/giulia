import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

/** EnergyLiveLine — LIVE GRAPH · 16:9. Streaming area chart die every 1.4s een
 *  nieuwe waarde binnenhaalt; gridlines + y-as + glow-punt op "nu". */
const W = 100, H = 44;
const INIT = [58, 62, 70, 65, 72, 80, 76, 82, 78, 84];

export default function EnergyLiveLine() {
  const [vals, setVals] = useState(INIT);
  useEffect(() => {
    const id = setInterval(() => {
      setVals((v) => {
        const last = v[v.length - 1];
        const next = Math.max(30, Math.min(95, last + (Math.random() - 0.5) * 14));
        return [...v.slice(1), Math.round(next)];
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const max = 100;
  const cur = vals[vals.length - 1];
  const pts = vals.map((val, i) => `${(i / (vals.length - 1)) * W},${H - (val / max) * H}`);
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${W},${H} L 0,${H} Z`;
  const cy = H - (cur / max) * H;

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "16 / 9", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Energy · Live" count={`${cur}%`} />
        <div className="flex-1 relative min-h-0">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1="0" y1={H * g} x2={W} y2={H * g} stroke={PLUM} strokeWidth="0.35" opacity="0.14" />
            ))}
            <motion.path d={area} fill={PLUM} opacity="0.16" />
            <motion.path d={line} fill="none" stroke={PLUM} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={W} cy={cy} r="1.7" fill={SAGE} />
          </svg>
          <span className="absolute right-0 top-0 text-[8px] tabular-nums font-semibold" style={{ color: PLUM }}>100</span>
          <span className="absolute right-0 bottom-0 text-[8px] tabular-nums opacity-55">0</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[8px] uppercase tracking-[0.2em] opacity-55">
          <span>10 min geleden</span><span>nu</span>
        </div>
      </div>
    </WidgetShell>
  );
}