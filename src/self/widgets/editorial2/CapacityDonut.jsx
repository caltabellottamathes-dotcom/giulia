import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

/** CapacityDonut — GAUGE · 1:1. Donut met geanimeerde arc, tick-marks en
 *  tellend percentage in het centrum. */
const R = 38, C = 2 * Math.PI * R;

export default function CapacityDonut() {
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(68), 200); return () => clearTimeout(t); }, []);
  const off = C - (val / 100) * C;

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Capacity" count="vandaag" />
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <svg viewBox="0 0 100 100" className="w-full h-full max-w-[150px] max-h-[150px]">
            {Array.from({ length: 48 }).map((_, i) => {
              const a = (i / 48) * 2 * Math.PI - Math.PI / 2;
              const r1 = 44, r2 = i % 4 === 0 ? 47 : 45.5;
              return <line key={i} x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1} x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2} stroke={PLUM} strokeWidth="0.5" opacity="0.3" />;
            })}
            <circle cx="50" cy="50" r={R} fill="none" stroke={SAGE} strokeWidth="7" opacity="0.55" />
            <motion.circle cx="50" cy="50" r={R} fill="none" stroke={PLUM} strokeWidth="7" strokeLinecap="round" transform="rotate(-90 50 50)" strokeDasharray={C} animate={{ strokeDashoffset: off }} transition={{ duration: 1.4, ease: "easeOut" }} />
          </svg>
          <div className="absolute flex flex-col items-center">
            <CountUp value={val} className="text-[38px] leading-none font-display font-semibold tabular-nums tracking-[-0.03em]" />
            <span className="text-[8px] uppercase tracking-[0.22em] opacity-55 mt-1">% over</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}