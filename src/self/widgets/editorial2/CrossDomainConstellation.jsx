import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

/** CrossDomainConstellation — NETWORK · 1:1. Vier domein-nodes met verbindingen
 *  die oplichten wanneer een node actief wordt; ring-pulse rond actieve node. */
const NODES = [
  { id: "SELF", x: 50, y: 18 },
  { id: "LIFE", x: 18, y: 58 },
  { id: "FOCUS", x: 82, y: 58 },
  { id: "GIULIA", x: 50, y: 90 },
];
const LINKS = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3], [1, 2]];

export default function CrossDomainConstellation() {
  const [active, setActive] = useState(0);
  useEffect(() => { const id = setInterval(() => setActive((a) => (a + 1) % NODES.length), 1600); return () => clearInterval(id); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Domein · Constellatie" count={NODES[active].id} />
        <div className="flex-1 relative min-h-0">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            {LINKS.map(([a, b], i) => {
              const hot = a === active || b === active;
              return <motion.line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke={PLUM} strokeWidth="0.5" animate={{ opacity: hot ? 0.85 : 0.2 }} transition={{ duration: 0.6 }} />;
            })}
          </svg>
          {NODES.map((n, i) => (
            <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <motion.span className="h-2.5 w-2.5 rounded-full" style={{ background: i === active ? PLUM : SAGE }} animate={{ scale: i === active ? 1.4 : 1, opacity: i === active ? 1 : 0.7 }} transition={{ duration: 0.6 }} />
              {i === active && (
                <motion.span className="absolute h-2.5 w-2.5 rounded-full" style={{ border: `1px solid ${PLUM}` }} animate={{ scale: [1, 2.4], opacity: [0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
              )}
              <span className="text-[7px] uppercase tracking-[0.18em] font-bold mt-1 opacity-75">{n.id}</span>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}