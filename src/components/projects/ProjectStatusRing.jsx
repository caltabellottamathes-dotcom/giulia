import React from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/widgets/CountUp";

/**
 * ProjectStatusRing — bespoke circular progress, the hero graphic of a
 * project card. The ring draws in on mount (motion = progress revealing),
 * the percentage counts up inside. No chart library, no icon.
 */
export default function ProjectStatusRing({ progress = 0, size = 116, stroke = 9, color = "hsl(var(--olive))", track = "rgba(0,0,0,0.07)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, progress)) / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold tabular-nums leading-none">
          <CountUp value={progress} />
        </span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">voltooid</span>
      </div>
    </div>
  );
}