import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

/** WeeklyRhythm — DATA GRAPH · 3:2. X/Y kolomgrafiek met 7 dagen, gridlines,
 *  y-as labels en een gemarkeerde "vandaag" kolom. */
const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const DATA = [42, 55, 38, 70, 62, 28, 18];
const MAX = 80;
const TODAY = 3;

export default function WeeklyRhythm() {
  const [grow, setGrow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrow(true), 150); return () => clearTimeout(t); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "3 / 2", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Weekritme · activiteit" count="7 dagen" />
        <div className="flex-1 relative flex min-h-0">
          <div className="flex flex-col justify-between pr-1 text-[7px] tabular-nums opacity-45">
            {[80, 60, 40, 20, 0].map((v) => <span key={v}>{v}</span>)}
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative">
              {[0.2, 0.4, 0.6, 0.8].map((g) => (
                <span key={g} className="absolute left-0 right-0 h-px" style={{ top: `${g * 100}%`, background: PLUM, opacity: 0.12 }} />
              ))}
              <div className="absolute inset-0 flex items-end gap-1.5">
                {DATA.map((v, i) => (
                  <motion.div key={i} className="flex-1 rounded-md" style={{ background: i === TODAY ? PLUM : SAGE, originY: 1 }} initial={{ height: 0 }} animate={{ height: grow ? `${(v / MAX) * 100}%` : 0 }} transition={{ duration: 0.9, delay: i * 0.07, ease: "easeOut" }} title={`${DAYS[i]} · ${v}%`} />
                ))}
              </div>
            </div>
            <div className="flex gap-1.5 mt-1">
              {DAYS.map((d, i) => (
                <span key={d} className="flex-1 text-[8px] uppercase tracking-wider text-center" style={{ opacity: i === TODAY ? 1 : 0.5, fontWeight: i === TODAY ? 700 : 400 }}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}