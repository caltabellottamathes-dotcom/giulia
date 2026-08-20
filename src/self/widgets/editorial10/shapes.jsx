import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/** Herbruikbare grafische animatie-vormen voor reeks 10. */

/** Puls-ringen — concentrische expanding rings. */
export function PulseRings({ color = "#5C333D", count = 3, size = 100 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span key={i} className="absolute inset-0 rounded-full" style={{ border: `1.5px solid ${color}` }} animate={{ scale: [1, 1.9], opacity: [0.55, 0] }} transition={{ duration: 2.6, delay: i * 0.85, repeat: Infinity, ease: "easeOut" }} />
      ))}
    </div>
  );
}

/** Orbit-dots — stippen die om een centrum draaien. */
export function OrbitDots({ n = 5, size = 90, color = "#5C333D", speed = 18 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: speed, repeat: Infinity, ease: "linear" }}>
        {Array.from({ length: n }).map((_, i) => {
          const a = (i / n) * 2 * Math.PI; const r = size / 2 - 5;
          return <span key={i} className="absolute h-2 w-2 rounded-full" style={{ background: color, top: `calc(50% + ${Math.sin(a) * r}px - 4px)`, left: `calc(50% + ${Math.cos(a) * r}px - 4px)` }} />;
        })}
      </motion.div>
    </div>
  );
}

/** Radiale segmenten — ring opgedeeld in geanimeerde bogen. */
export function RadialSegments({ segments, size = 110, stroke = 10 }) {
  const R = (size - stroke) / 2; const C = 2 * Math.PI * R;
  const total = segments.reduce((s, x) => s + (x.v || 0), 0) || 1;
  let off = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
      <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(45,45,45,0.10)" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const len = ((s.v || 0) / total) * C;
        const el = (
          <motion.circle key={i} cx={size / 2} cy={size / 2} r={R} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} initial={{ strokeDasharray: `0 ${C}` }} animate={{ strokeDasharray: `${len} ${C - len}` }} transition={{ duration: 1, delay: 0.3 + i * 0.12, ease: "easeOut" }} />
        );
        off += len; return el;
      })}
    </svg>
  );
}

/** Sparkline — geanimeerde getekende lijn met punten. */
export function Sparkline({ points, color = "#5C333D", w = 120, h = 38 }) {
  if (!points || points.length < 2) points = [0, 0.3, 0.6, 0.4, 0.8];
  const max = Math.max(...points, 1); const min = Math.min(...points, 0);
  const path = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <motion.polyline points={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut" }} />
      {points.map((p, i) => (
        <motion.circle key={i} cx={(i / (points.length - 1)) * w} cy={h - ((p - min) / (max - min || 1)) * h} r="1.9" fill={color} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.07 }} />
      ))}
    </svg>
  );
}

/** Flow-dots — stromende stippen. */
export function FlowDots({ count = 5, color = "#5C333D" }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span key={i} className="h-2 w-2 rounded-full" style={{ background: color }} animate={{ y: [0, -7, 0], opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.3, delay: i * 0.13, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

/** ClockArc — boog die een cirkel vult. */
export function ClockArc({ pct, size = 100, color = "#5C333D", stroke = 8 }) {
  const R = (size - stroke) / 2; const C = 2 * Math.PI * R;
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(pct || 0), 250); return () => clearTimeout(t); }, [pct]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
      <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(45,45,45,0.10)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={C} animate={{ strokeDashoffset: C - (v / 100) * C }} transition={{ duration: 1.4, ease: "easeOut" }} />
    </svg>
  );
}

/** Constellation — netwerk van pulserende knopen + lijnen. */
export function Constellation({ nodes, color = "#5C333D", size = 100 }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {nodes.map((a, i) => nodes.slice(i + 1).map((b, j) => (
        <motion.line key={`${i}-${j}`} x1={a.x * size} y1={a.y * size} x2={b.x * size} y2={b.y * size} stroke={color} strokeWidth="0.5" initial={{ opacity: 0 }} animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 3, delay: (i + j) * 0.3, repeat: Infinity }} />
      )))}
      {nodes.map((n, i) => (
        <motion.circle key={i} cx={n.x * size} cy={n.y * size} r="3" fill={color} animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, delay: i * 0.25, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: `${n.x * size}px ${n.y * size}px` }} />
      ))}
    </svg>
  );
}

/** MorphBadge — een cirkel die pulseert met een teller erin. */
export function MorphBadge({ value, color = "#5C333D", size = 84 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.span className="absolute inset-0 rounded-full" style={{ background: color, opacity: 0.12 }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
      <span className="text-[28px] font-display font-semibold tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}