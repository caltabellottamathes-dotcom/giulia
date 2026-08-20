import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** SystemPulse — LIVE SYSTEM · 9:16. Hartbeat-lijn + morphende state-woord +
 *  activiteitenstream met bewegende highlight. */
const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 30 L 18 30 L 24 30 L 30 12 L 36 48 L 42 20 L 48 30 L 60 30 L 66 30 L 72 16 L 78 44 L 84 30 L 100 30";
const STREAM = ["agenda gesynchroniseerd", "3 emails getriaged", "taak voltooid · Focus", "herinnering verstuurd", "inzicht opgeslagen"];

export default function SystemPulse() {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 1800); return () => clearInterval(id); }, []);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 1800); return () => clearInterval(id); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "9 / 16", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Giulia · live" />
          <span className="flex items-center gap-1 text-[7px] uppercase tracking-[0.18em] font-bold"><motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: SAGE }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />online</span>
        </div>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-12 w-full">
          <line x1="0" y1="30" x2="100" y2="30" stroke={PLUM_FAINT} strokeWidth="0.4" />
          <motion.path d={PATH} fill="none" stroke={PLUM} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }} />
        </svg>
        <div className="h-[40px] overflow-hidden flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3 key={idx} className="text-[26px] leading-none font-display font-semibold tracking-[-0.04em]" initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -22, opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>{STATES[idx]}</motion.h3>
          </AnimatePresence>
        </div>
        <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-hidden">
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">activiteit</p>
          {STREAM.map((s, i) => {
            const hot = i === tick % STREAM.length;
            return (
              <motion.div key={s} className="flex items-center gap-2 rounded-md px-2 py-1.5" style={{ background: hot ? PLUM_FAINT : "transparent" }} animate={{ opacity: hot ? 1 : 0.5 }}>
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: hot ? SAGE : PLUM_FAINT }} />
                <span className="text-[9px] truncate">{s}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </WidgetShell>
  );
}