import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** AgentFlow — FLOW / PROCESS · 16:9. GIULIA-uitvoeringsstroom
 *  REQUEST→UNDERSTAND→PLAN→ACT→REPORT met een reizend pakket en vullende lijnen. */
const STAGES = ["REQUEST", "UNDERSTAND", "PLAN", "ACT", "REPORT"];

export default function AgentFlow() {
  const [step, setStep] = useState(0);
  useEffect(() => { const id = setInterval(() => setStep((s) => (s + 1) % (STAGES.length + 1)), 1200); return () => clearInterval(id); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "16 / 9", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Agent · uitvoering" />
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold">{STAGES[Math.min(step, STAGES.length - 1)]}</span>
        </div>
        <div className="flex-1 flex items-center min-h-0">
          <div className="w-full flex items-center relative">
            {STAGES.map((s, i) => {
              const done = i < step, hot = i === step;
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1 w-12 shrink-0">
                    <motion.span className="h-3.5 w-3.5 rounded-full" animate={{ scale: hot ? 1.4 : 1, backgroundColor: done ? SAGE : hot ? PLUM : PLUM_FAINT }} transition={{ duration: 0.3 }} />
                    <span className="text-[6.5px] uppercase tracking-[0.1em] font-bold text-center leading-tight" style={{ opacity: i <= step ? 0.9 : 0.4 }}>{s}</span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full mx-1 relative overflow-hidden" style={{ background: PLUM_FAINT }}>
                      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: PLUM }} animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                      {i === step && <motion.span className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full" style={{ background: SAGE }} animate={{ left: ["0%", "100%"] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}