import React from "react";
import { motion } from "framer-motion";

/**
 * WidgetHeader — quiet label line with a small animated emblem beside the label.
 * `type` kiest het embleem op basis van de functie van de widget — dezelfde
 * stijl, een gebaar dat bij het onderwerp past:
 *   social  → equalizer (default)
 *   agenda  → tijdlijn met bewegende 'nu'-marker
 *   energy  → curve met een dot die langsloopt
 *   tasks   → pulserend vinkje
 *   briefing→ klok met draaiende wijzer
 *   pulse   → pulserende ring
 */
const ACC = "var(--tile-accent)";

const Equalizer = () => (
  <span className="flex items-end gap-[2px] h-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i} className="w-[2.5px] rounded-full" style={{ background: ACC }}
        animate={{ height: ["28%", "100%", "42%", "78%", "28%"] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.24 }}
      />
    ))}
  </span>
);

const Timeline = () => (
  <span className="relative flex items-end gap-[2px] h-3 w-4">
    {[40, 80, 55, 95, 60].map((h, i) => (
      <span key={i} className="w-[2px] rounded-full" style={{ height: `${h}%`, background: ACC, opacity: 0.35 }} />
    ))}
    <motion.span
      className="absolute top-0 w-[3px] rounded-full" style={{ background: ACC }}
      animate={{ left: ["-2%", "100%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
    />
  </span>
);

const Energy = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" className="shrink-0 overflow-visible">
    <path d="M0 9 Q 4.5 0, 9 6 T 18 3" fill="none" stroke={ACC} strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
    <motion.circle
      r="1.8" fill={ACC}
      animate={{ cx: [0, 4.5, 9, 13.5, 18], cy: [9, 1.5, 6, 4.5, 3] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

const Tasks = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
    <motion.path
      d="M2 7.5 L5.5 11 L12 3" fill="none" stroke={ACC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      animate={{ pathLength: [0, 1], opacity: [0.4, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

const Briefing = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
    <circle cx="7" cy="7" r="6" fill="none" stroke={ACC} strokeWidth="1.4" strokeOpacity="0.4" />
    <motion.g style={{ transformOrigin: "7px 7px" }} animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
      <line x1="7" y1="7" x2="7" y2="3.2" stroke={ACC} strokeWidth="1.6" strokeLinecap="round" />
    </motion.g>
    <circle cx="7" cy="7" r="1" fill={ACC} />
  </svg>
);

const Pulse = () => (
  <span className="relative flex items-center justify-center h-3 w-3">
    <motion.span
      className="absolute inset-0 rounded-full" style={{ border: `1.5px solid ${ACC}` }}
      animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
    />
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACC }} />
  </span>
);

const EMBLEMS = { social: Equalizer, agenda: Timeline, energy: Energy, tasks: Tasks, briefing: Briefing, pulse: Pulse };

export default function WidgetHeader({ label, count, type = "social" }) {
  const Emblem = EMBLEMS[type] || Equalizer;
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Emblem />
        <h3 className="text-[10px] uppercase tracking-[0.28em] font-bold text-current opacity-60">{label}</h3>
      </div>
      {count != null && count !== "" && (
        <span className="text-[10px] font-mono tracking-[0.02em] text-current opacity-45 tabular-nums">{count}</span>
      )}
    </div>
  );
}