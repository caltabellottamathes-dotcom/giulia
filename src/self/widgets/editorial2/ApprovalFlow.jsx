import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial/selfEditorial";

/** ApprovalFlow — FLOW / PROCESS · 16:9. Horizontale pijplijn INBOX→SENT;
 *  actieve stap pulseert, voltooide stappen vullen de lijn. */
const STAGES = ["INBOX", "GIULIA", "UNDERSTAND", "ACTION", "APPROVAL", "SENT"];

export default function ApprovalFlow() {
  const [step, setStep] = useState(0);
  useEffect(() => { const id = setInterval(() => setStep((s) => (s + 1) % (STAGES.length + 1)), 1300); return () => clearInterval(id); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "16 / 9", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Flow · Email → Verstuurd" count={STAGES[Math.min(step, STAGES.length - 1)]} />
        <div className="flex-1 flex items-center min-h-0">
          <div className="w-full flex items-center">
            {STAGES.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1 w-10 shrink-0">
                  <motion.span className="h-3 w-3 rounded-full" animate={{ scale: i === step ? 1.45 : 1, backgroundColor: i < step ? SAGE : i === step ? PLUM : PLUM_FAINT }} transition={{ duration: 0.4 }} />
                  <span className="text-[7px] uppercase tracking-[0.12em] font-bold text-center leading-tight" style={{ opacity: i <= step ? 0.9 : 0.4 }}>{s}</span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="flex-1 h-0.5 rounded-full mx-1 relative overflow-hidden" style={{ background: PLUM_FAINT }}>
                    <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: PLUM }} animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}