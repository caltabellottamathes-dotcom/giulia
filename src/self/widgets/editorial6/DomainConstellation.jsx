import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE } from "@/self/widgets/editorial3/editorial3Data";

/** DomainConstellation — NETWORK (flow) · 1:1. Vier domein-nodes met
 *  verbindingen waarlangs pulses reizen wanneer een domein actief wordt. */
const NODES = [
  { id: "SELF", x: 50, y: 20 },
  { id: "LIFE", x: 20, y: 56 },
  { id: "FOCUS", x: 80, y: 56 },
  { id: "GIULIA", x: 50, y: 88 },
];
const LINKS = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3], [1, 2]];

export default function DomainConstellation() {
  const [active, setActive] = useState(0);
  useEffect(() => { const id = setInterval(() => setActive((a) => (a + 1) % NODES.length), 2200); return () => clearInterval(id); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Domein · constellatie" />
          <motion.span className="text-[8px] uppercase tracking-[0.18em] font-bold px-2 py-0.5 rounded-full" style={{ background: SAGE, color: PLUM }} key={active} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>{NODES[active].id} ↓</motion.span>
        </div>
        <div className="flex-1 relative min-h-0">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            {LINKS.map(([a, b], i) => {
              const hot = a === active || b === active;
              const na = NODES[a], nb = NODES[b];
              return (
                <g key={i}>
                  <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={PLUM} strokeWidth="0.5" opacity={hot ? 0.6 : 0.15} />
                  {hot && <motion.circle r="1.6" fill={SAGE} initial={{ cx: na.x, cy: na.y }} animate={{ cx: [na.x, nb.x], cy: [na.y, nb.y] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />}
                </g>
              );
            })}
          </svg>
          {NODES.map((n, i) => (
            <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <motion.span className="h-3 w-3 rounded-full" style={{ background: i === active ? PLUM : SAGE }} animate={i === active ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 1.2, repeat: i === active ? Infinity : 0 }} />
              {i === active && <motion.span className="absolute h-3 w-3 rounded-full" style={{ border: `1px solid ${PLUM}` }} animate={{ scale: [1, 2.2], opacity: [0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />}
              <span className="text-[7px] uppercase tracking-[0.16em] font-bold mt-1 opacity-75">{n.id}</span>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}