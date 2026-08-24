import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial/selfEditorial";

/** SocialOrbit — PEOPLE / NETWORK · 1:1. Centraal portret met cirkelende
 *  contact-dots; radius = recentie, dikkere lijn = langer geleden. */
export const CONTACTS = [
  { name: "Jill", days: 23, r: 40, a: 20 },
  { name: "Mama", days: 4, r: 24, a: 140 },
  { name: "Debora", days: 9, r: 32, a: 250 },
  { name: "Juan", days: 16, r: 40, a: 320 },
];

export default function SocialOrbit() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Social Pulse · close circle" count="4 mensen" />
        <div className="flex-1 relative min-h-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-[320px] max-h-[320px] aspect-square">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {[18, 30, 42].map((rr, i) => (
                <circle key={i} cx="50" cy="50" r={rr} fill="none" stroke={PLUM} strokeWidth="0.4" opacity="0.18" strokeDasharray="2 2.5" />
              ))}
              {CONTACTS.map((c) => {
                const rad = (c.a * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * c.r;
                const y = 50 + Math.sin(rad) * c.r;
                const stale = c.days > 14;
                return (
                  <g key={c.name}>
                    <line x1="50" y1="50" x2={x} y2={y} stroke={stale ? PLUM : SAGE} strokeWidth="0.6" opacity={stale ? 0.75 : 0.4} />
                    <circle cx={x} cy={y} r="2.6" fill={stale ? PLUM : SAGE} />
                  </g>
                );
              })}
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full overflow-hidden ring-2" style={{ "--tw-ring-color": PLUM }}>
              <img src={SELF_PHOTO.dailyState} alt="" className="h-full w-full object-cover" draggable={false} />
            </div>
            {CONTACTS.map((c) => {
              const rad = (c.a * Math.PI) / 180;
              const x = 50 + Math.cos(rad) * c.r;
              const y = 50 + Math.sin(rad) * c.r;
              return (
                <motion.div key={c.name} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%` }} animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <span className="text-[11px] font-bold whitespace-nowrap">{c.name}</span>
                  <span className="text-[8px] opacity-55">{c.days}d</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}