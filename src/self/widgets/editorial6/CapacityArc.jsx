import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** CapacityArc — GAUGE (morphing) · 4:3. 270°-boog met ticks die vloeiend
 *  meebeweegt 64→65→66; nummer morpht telkens. */
const R = 40, CX = 50, CY = 50, SWEEP = 270;
const polar = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]; };
const arcPath = (startDeg, endDeg, r) => {
  const [sx, sy] = polar(startDeg, r), [ex, ey] = polar(endDeg, r);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
};
const trackPath = arcPath(135, 135 + SWEEP, R);

export default function CapacityArc() {
  const [val, setVal] = useState(64);
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setVal((v) => Math.max(40, Math.min(90, v + (Math.random() < 0.5 ? -1 : 1)))), 2000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { const t = setTimeout(() => setDisp(val), 80); return () => clearTimeout(t); }, [val]);
  const fillEnd = 135 + SWEEP * (disp / 100);
  const fillPath = arcPath(135, fillEnd, R);
  const [kx, ky] = polar(fillEnd, R);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "4 / 3", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <WidgetHeader label="Capacity · live" count="morph" />
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <svg viewBox="0 0 100 100" className="h-full w-full max-h-[150px]">
            {Array.from({ length: 28 }).map((_, i) => {
              const deg = 135 + (i / 27) * SWEEP;
              const [x1, y1] = polar(deg, R + 6), [x2, y2] = polar(deg, R + (i % 4 === 0 ? 9 : 7));
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PLUM} strokeWidth="0.5" opacity="0.3" />;
            })}
            <path d={trackPath} fill="none" stroke={PLUM_FAINT} strokeWidth="5" strokeLinecap="round" />
            <motion.path d={fillPath} fill="none" stroke={SAGE} strokeWidth="5" strokeLinecap="round" />
            <circle cx={kx} cy={ky} r="2.4" fill={PLUM} />
          </svg>
          <div className="absolute flex flex-col items-center">
            <div className="relative h-[40px] overflow-hidden flex items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={val} className="text-[40px] font-display font-semibold tabular-nums leading-none" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>{val}</motion.span>
              </AnimatePresence>
            </div>
            <span className="text-[8px] uppercase tracking-[0.2em] opacity-55">% over</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}