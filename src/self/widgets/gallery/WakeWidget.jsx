import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";
const PHASES = ["wake", "orient", "getup", "routine", "briefing", "complete"];

/** WakeWidget — "atmospheric progression". Grote progress-arc die meegroeit
 *  met de huidige Wake-fase. Trage, gecontroleerde beweging; fase als
 *  typografisch statement. */
export default function WakeWidget() {
  const { openModule } = usePanel();
  const { data: sessions } = useEntityList("WakeSession", { realtime: true, sort: "-created_date", limit: 1 });
  const s = (sessions || [])[0];
  const phase = s?.phase || "wake";
  const idx = Math.max(0, PHASES.indexOf(phase));
  const pct = Math.round((idx / (PHASES.length - 1)) * 100);
  const now = new Date();
  const time = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const day = now.toLocaleDateString("nl-NL", { weekday: "long" });

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfwake")}
      className="lg:col-span-2 min-h-[340px]"
      style={{ background: "linear-gradient(160deg, hsl(var(--self-primary)) 0%, hsl(var(--self-primary-light)) 100%)", "--tile-accent": SAGE }}>
      <div className="p-6 h-full flex flex-col text-ivory">
        <WidgetHeader label="Wake" count={phase} />
        <h3 className="text-[42px] leading-[0.84] font-display font-semibold tracking-[-0.04em] mt-3">GOOD<br />MORNING</h3>
        <div className="flex items-end gap-4 mt-2">
          <span className="text-[28px] font-display font-semibold tabular-nums">{time}</span>
          <span className="text-[11px] uppercase tracking-[0.2em] opacity-50 mb-1">{day}</span>
        </div>

        <div className="relative flex-1 flex items-center justify-center min-h-[140px] mt-2">
          <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
            <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" strokeLinecap="round" />
            <motion.path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={pct >= 80 ? SAGE : URGENT} strokeWidth="10" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: pct / 100 }} transition={{ duration: 1.3, ease: "easeInOut" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <span className="text-[38px] font-display font-semibold tabular-nums leading-none">{pct}%</span>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1">wake</span>
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-[0.2em] opacity-55 text-center">Phase · {phase}</p>
      </div>
    </WidgetShell>
  );
}