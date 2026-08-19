import React from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * VoortgangCard — totale dagvoortgang als groot percentage + geanimeerde
 * voortgangsbalk + meta-regel met taken en routines. Antwoordt: "Hoe gaat mijn dag?"
 */
export default function VoortgangCard({ pct = 0, done = 0, total = 0, routines = [] }) {
  const routinesDone = (routines || []).filter((r) => r.status === "completed").length;
  const routinesTotal = (routines || []).length;

  return (
    <div className="space-y-4">
      {/* Big percentage */}
      <div className="flex items-baseline gap-1">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-[3rem] font-display font-light leading-none tabular-nums text-current tracking-[-0.05em]"
        >
          {pct}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-[1rem] font-display font-light text-current/50"
        >
          %
        </motion.span>
      </div>

      {/* Animated progress bar */}
      <div className="h-1.5 rounded-full bg-current/15 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
          className="h-full rounded-full bg-white"
          style={{ boxShadow: "0 0 8px rgba(255,255,255,0.4)" }}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[10px] text-current/55">
        <span><strong className="text-current/85 font-medium tabular-nums">{done}</strong> van {total} taken</span>
        {routinesTotal > 0 && (
          <span><strong className="text-current/85 font-medium tabular-nums">{routinesDone}</strong> van {routinesTotal} routines</span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-current/20 px-2 py-0.5 text-[9px]">
          {pct >= 75 ? "▲ Goed bezig" : pct >= 40 ? "● Op schema" : "▼ Net begonnen"}
        </span>
      </div>
    </div>
  );
}