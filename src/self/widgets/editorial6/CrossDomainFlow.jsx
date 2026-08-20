import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** CrossDomainFlow — CROSS-DOMAIN · 1:1. Oorzaak→gevolg-keten
 *  (SELF capacity↓ → FOCUS herplan → agenda → Giulia adviseert) met
 *  reizende puls en activerende stappen. */
const STEPS = [
  { tag: "SELF", label: "capacity ↓", tone: "hsl(var(--destructive))" },
  { tag: "FOCUS", label: "workload herplan", tone: PLUM },
  { tag: "AGENDA", label: "blokken opschuiven", tone: SAGE },
  { tag: "GIULIA", label: "adviseert pauze", tone: PLUM },
];

export default function CrossDomainFlow() {
  const [step, setStep] = useState(0);
  useEffect(() => { const id = setInterval(() => setStep((s) => (s + 1) % (STEPS.length + 1)), 1100); return () => clearInterval(id); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Impact · cross-domain" />
          <motion.span className="text-[8px] uppercase tracking-[0.18em] font-bold" key={step} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>{STEPS[Math.min(step, STEPS.length - 1)]?.tag}</motion.span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-0 min-h-0">
          {STEPS.map((s, i) => {
            const hot = i === step, done = i < step;
            return (
              <React.Fragment key={i}>
                <motion.div className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: hot ? PLUM_FAINT : "transparent" }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: done || hot ? 1 : 0.45, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.tone }} />
                  <span className="text-[9px] uppercase tracking-[0.16em] font-bold w-14 shrink-0">{s.tag}</span>
                  <span className="text-[10px] truncate flex-1">{s.label}</span>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className="flex justify-center h-3 relative">
                    <div className="w-0.5 h-full" style={{ background: PLUM_FAINT }} />
                    {hot && <motion.span className="absolute left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full" style={{ background: SAGE }} animate={{ top: ["0%", "100%"], opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </WidgetShell>
  );
}