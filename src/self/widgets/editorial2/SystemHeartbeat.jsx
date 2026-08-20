import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, PLUM_FAINT } from "@/self/widgets/editorial/selfEditorial";

/** SystemHeartbeat — LIVE SYSTEM · 4:3. EKG-golf die steeds opnieuw tekent,
 *  met een rij status-states waarvan de actieve oplicht. */
const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 50 L 18 50 L 24 50 L 30 28 L 36 72 L 42 40 L 48 50 L 60 50 L 66 50 L 72 34 L 78 66 L 84 50 L 100 50";

export default function SystemHeartbeat() {
  const [idx, setIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 1800); return () => clearInterval(id); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "4 / 3", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Giulia · Live" count={STATES[idx]} />
        <div className="flex-1 relative min-h-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <line x1="0" y1="50" x2="100" y2="50" stroke={PLUM_FAINT} strokeWidth="0.4" />
            <motion.path d={PATH} fill="none" stroke={PLUM} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }} />
          </svg>
          <span className="absolute right-0 top-0 flex items-center gap-1 text-[7px] uppercase tracking-[0.18em] font-bold" style={{ color: PLUM }}>
            <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: PLUM }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
            online
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 gap-0.5">
          {STATES.map((s, i) => (
            <span key={s} className="text-[6.5px] uppercase tracking-[0.08em] font-bold" style={{ opacity: i === idx ? 1 : 0.3, color: PLUM }}>{s}</span>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}