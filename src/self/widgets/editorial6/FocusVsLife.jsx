import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** FocusVsLife — DATA GRAPH (multi-series) · 3:2. 7-daagse gegroepeerde
 *  kolomgrafiek focus vs life met as-labels, grid en legend. */
const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const FOCUS = [5, 6, 4, 7, 5, 2, 1];
const LIFE = [2, 2, 3, 2, 3, 5, 4];
const MAX = 8;

export default function FocusVsLife() {
  const [grow, setGrow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrow(true), 150); return () => clearTimeout(t); }, []);
  const totF = FOCUS.reduce((a, b) => a + b, 0), totL = LIFE.reduce((a, b) => a + b, 0);
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "3 / 2", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Balans · week" />
          <div className="flex gap-2.5 text-[8px] uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: PLUM }} />focus {totF}u</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: SAGE }} />life {totL}u</span>
          </div>
        </div>
        <div className="flex-1 relative flex min-h-0">
          <div className="flex flex-col justify-between pr-1 text-[7px] tabular-nums opacity-45 w-4">
            {[8, 6, 4, 2, 0].map((y) => <span key={y}>{y}</span>)}
          </div>
          <div className="flex-1 relative">
            {[0.25, 0.5, 0.75].map((g) => <span key={g} className="absolute left-0 right-0 h-px" style={{ top: `${g * 100}%`, background: PLUM, opacity: 0.1 }} />)}
            <div className="absolute inset-0 flex items-end gap-1.5">
              {DAYS.map((d, i) => (
                <div key={d} className="flex-1 h-full flex items-end justify-center gap-0.5">
                  <motion.span className="w-1/2 rounded-t-sm" style={{ background: PLUM, originY: 1 }} initial={{ height: 0 }} animate={{ height: grow ? `${(FOCUS[i] / MAX) * 100}%` : 0 }} transition={{ delay: 0.2 + i * 0.07, duration: 0.7, ease: "easeOut" }} title={`focus ${FOCUS[i]}u`} />
                  <motion.span className="w-1/2 rounded-t-sm" style={{ background: SAGE, originY: 1 }} initial={{ height: 0 }} animate={{ height: grow ? `${(LIFE[i] / MAX) * 100}%` : 0 }} transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: "easeOut" }} title={`life ${LIFE[i]}u`} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {DAYS.map((d) => <span key={d} className="flex-1 text-[8px] uppercase tracking-wider text-center opacity-55">{d}</span>)}
        </div>
      </div>
    </WidgetShell>
  );
}