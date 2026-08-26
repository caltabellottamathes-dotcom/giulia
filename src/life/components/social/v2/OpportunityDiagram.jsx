import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { capacityFromCheckIn, spaceCapacityQuadrant } from "@/lib/domainUtils";

/* ── OpportunityDiagram — §6 cross-object visual intelligence.
 * Verbindt losse signalen (person state + open time + capacity) tot
 * één visuele SOCAL OPPORTUNITY-keten. Custom SVG, framer-motion. */

export default function OpportunityDiagram({ person, personState, lastContactDays, availablePct, checkIn, onPlan }) {
  const capacity = useMemo(() => capacityFromCheckIn(checkIn), [checkIn]);
  const quad = useMemo(() => spaceCapacityQuadrant(availablePct, capacity.level), [availablePct, capacity.level]);
  const isOpportunity = quad.label === "SOCIAL OPPORTUNITY";

  const nodes = [
    { id: "person", label: person?.name || "—", sub: personState || "—", color: "hsl(var(--d-life-deep))" },
    { id: "state", label: lastContactDays === Infinity ? "No contact" : `${lastContactDays}d ago`, sub: "Last meaningful", color: "hsl(var(--smoke))" },
    { id: "time", label: `${availablePct}%`, sub: "Open space", color: "hsl(var(--d-life-mid))" },
    { id: "cap", label: capacity.level, sub: "Capacity", color: capacity.level === "HIGH" ? "hsl(var(--olive))" : "hsl(var(--smoke))" },
  ];
  const result = { label: isOpportunity ? "SOCIAL OPPORTUNITY" : quad.label, sub: quad.desc, color: isOpportunity ? "hsl(var(--olive))" : "hsl(var(--smoke))" };

  return (
    <div className="relative">
      <svg viewBox="0 0 400 200" className="w-full">
        {/* verbindingslijnen */}
        {[80, 160, 240].map((x, i) => (
          <motion.line
            key={i}
            x1={x}
            y1={70}
            x2={x + 60}
            y2={70}
            stroke="hsl(var(--olive))"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
          />
        ))}
        <motion.line x1={200} y1={100} x2={200} y2={150} stroke={result.color} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.5 }} />
        {/* + tekens */}
        {[140, 220].map((x, i) => (
          <motion.text key={i} x={x} y={75} textAnchor="middle" fill="hsl(var(--olive))" fontSize="14" fontWeight="700" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.4 + i * 0.15 }}>+</motion.text>
        ))}
      </svg>
      {/* nodes als absolute overlay */}
      <div className="absolute inset-0 flex items-center justify-center gap-3 px-4" style={{ top: 0, height: 100 }}>
        {nodes.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex flex-col items-center text-center"
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-[10px] font-bold font-display" style={{ background: `${n.color}30`, border: `1.5px solid ${n.color}`, color: "hsl(var(--foreground))" }}>
              {n.label.length > 6 ? n.label.slice(0, 5) + "…" : n.label}
            </div>
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground mt-1">{n.sub}</p>
          </motion.div>
        ))}
      </div>
      {/* resultaat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-2 flex flex-col items-center text-center"
      >
        <div className="rounded-full px-4 py-2" style={{ background: `${result.color}25`, border: `1.5px solid ${result.color}` }}>
          <p className="text-[11px] font-display font-bold tracking-wide" style={{ color: result.color }}>{result.label}</p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 max-w-[280px]">{result.sub}</p>
        {isOpportunity && onPlan && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlan}
            className="mt-2 text-[10px] uppercase tracking-widest font-semibold rounded-full px-4 py-1.5 bg-olive text-white"
          >
            Plan something
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}