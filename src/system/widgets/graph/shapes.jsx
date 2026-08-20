import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { A } from "./graphData";

/** Herbruikbare, geanimeerde grafische vormen voor de Graph Gallery. viewBox = 120. */
const VB = 120, C = VB / 2;

export function Orbit({ count = 6, r = 42, color = A.olive, speed = 16, size = VB }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      <circle cx={C} cy={C} r={r} fill="none" stroke="hsl(var(--foreground)/0.12)" strokeDasharray="3 4" />
      <motion.g style={{ transformOrigin: `${C}px ${C}px` }} animate={{ rotate: 360 }} transition={{ duration: speed, repeat: Infinity, ease: "linear" }}>
        {Array.from({ length: count }, (_, i) => {
          const a = (i / count) * Math.PI * 2;
          return <circle key={i} cx={C + r * Math.cos(a)} cy={C + r * Math.sin(a)} r={3.5} fill={color} opacity={0.4 + ((i % 2) * 0.5)} />;
        })}
      </motion.g>
      <circle cx={C} cy={C} r={6} fill={color} />
      <circle cx={C} cy={C} r={11} fill="none" stroke={color} strokeOpacity={0.3} />
    </svg>
  );
}

export function Constellation({ nodes, links, color = A.olive, size = VB }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {links.map(([i, j], k) => (
        <line key={k} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} stroke={color} strokeOpacity={0.25} strokeWidth={1} />
      ))}
      {nodes.map((n, i) => (
        <motion.circle key={i} cx={n.x} cy={n.y} r={n.r ?? 3} fill={color}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.85, 1.15, 0.85] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
      ))}
    </svg>
  );
}

export function RadialSpokes({ count = 12, color = A.olive, size = VB }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const r2 = 50;
        return (
          <motion.line key={i} x1={C} y1={C} x2={C + r2 * Math.cos(a)} y2={C + r2 * Math.sin(a)}
            stroke={color} strokeWidth={1.5} strokeLinecap="round"
            animate={{ opacity: [0.15, 0.7, 0.15] }} transition={{ duration: 2, repeat: Infinity, delay: (i / count) * 2 }} />
        );
      })}
      <circle cx={C} cy={C} r={6} fill={color} />
    </svg>
  );
}

export function FlowTrack({ count = 5, w = 120, h = 40, color = A.olive }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1={4} y1={h / 2} x2={w - 4} y2={h / 2} stroke="hsl(var(--foreground)/0.12)" strokeWidth={1} strokeDasharray="3 3" />
      {Array.from({ length: count }, (_, i) => (
        <motion.circle key={i} r={4} cy={h / 2} fill={color}
          animate={{ cx: [4, w - 4] }} transition={{ duration: 2.4, repeat: Infinity, delay: (i / count) * 2.4, ease: "linear" }} />
      ))}
    </svg>
  );
}

export function Ripple({ rings = 3, color = A.olive, size = VB }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {Array.from({ length: rings }, (_, i) => (
        <motion.circle key={i} cx={C} cy={C} r={6} fill="none" stroke={color} strokeWidth={2}
          animate={{ r: [6, 52], opacity: [0.7, 0] }} transition={{ duration: 2.6, repeat: Infinity, delay: (i / rings) * 2.6, ease: "easeOut" }} />
      ))}
      <circle cx={C} cy={C} r={5} fill={color} />
    </svg>
  );
}

export function Wave({ w = 120, h = 48, color = A.olive, amp = 12 }) {
  const path = (phase) => {
    let d = "";
    for (let x = 0; x <= w; x += 4) {
      const y = h / 2 + Math.sin((x / w) * Math.PI * 4 + phase) * amp;
      d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)} `;
    }
    return d;
  };
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <motion.path d={path(0)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"
        animate={{ d: [path(0), path(Math.PI), path(Math.PI * 2)] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
    </svg>
  );
}

export function ECG({ w = 120, h = 48, color = A.urgent }) {
  const beat = "M0 24 L20 24 L26 14 L32 34 L38 24 L60 24 L66 18 L72 30 L78 24 L120 24";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <motion.path d={beat} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
    </svg>
  );
}

export function Radar({ axes = 6, color = A.olive, size = VB }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {[20, 34, 48].map((r, i) => <circle key={i} cx={C} cy={C} r={r} fill="none" stroke="hsl(var(--foreground)/0.1)" />)}
      {Array.from({ length: axes }, (_, i) => {
        const a = (i / axes) * Math.PI * 2;
        return <line key={i} x1={C} y1={C} x2={C + 48 * Math.cos(a)} y2={C + 48 * Math.sin(a)} stroke="hsl(var(--foreground)/0.1)" />;
      })}
      <motion.path d={`M${C} ${C} L${C} ${C - 48} A48 48 0 0 1 ${C + 48} ${C} Z`} fill={color} fillOpacity={0.18}
        style={{ transformOrigin: `${C}px ${C}px` }} animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      {[[30, 20], [40, 38], [20, 30], [-30, -20], [-20, 24]].map(([x, y], i) => (
        <motion.circle key={i} cx={C + x} cy={C + y} r={2.5} fill={color}
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
      ))}
    </svg>
  );
}

export function Spiral({ count = 36, color = A.olive, size = VB }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const a = i * 0.42;
    const r = 2 + i * 1.25;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {dots.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r={2} fill={color}
          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, delay: (i / count) * 2.4 }} />
      ))}
    </svg>
  );
}

export function DotLattice({ cols = 7, rows = 5, color = A.olive, size = VB }) {
  const gx = VB / (cols + 1), gy = VB / (rows + 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        return <motion.circle key={i} cx={gx * (c + 1)} cy={gy * (r + 1)} r={2.4} fill={color}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} style={{ transformOrigin: `${gx * (c + 1)}px ${gy * (r + 1)}px` }}
          transition={{ duration: 2, repeat: Infinity, delay: (c + r) * 0.12 }} />;
      })}
    </svg>
  );
}

export function Donut({ segs = [30, 45, 25], colors = [A.olive, A.ridge, A.sand], size = VB, thick = 14 }) {
  const r = (VB - thick) / 2;
  const C2 = 2 * Math.PI * r;
  let acc = 0;
  const total = segs.reduce((a, b) => a + b, 0);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      <circle cx={C} cy={C} r={r} fill="none" stroke="hsl(var(--foreground)/0.08)" strokeWidth={thick} />
      {segs.map((s, i) => {
        const frac = s / total;
        const dash = frac * C2;
        const el = (
          <motion.circle key={i} cx={C} cy={C} r={r} fill="none" stroke={colors[i % colors.length]} strokeWidth={thick} strokeLinecap="round"
            strokeDasharray={`${dash} ${C2 - dash}`} transform={`rotate(${-90 + (acc / total) * 360} ${C} ${C})`}
            initial={{ strokeDasharray: `0 ${C2}` }} animate={{ strokeDasharray: `${dash} ${C2 - dash}` }} transition={{ duration: 1, delay: i * 0.15 }} />
        );
        acc += s;
        return el;
      })}
    </svg>
  );
}

export function HexTiles({ color = A.olive, size = VB }) {
  const hex = (cx, cy, r) => { let p = ""; for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; p += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`; } return p + "Z"; };
  const r = 14;
  const tiles = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) { if ((row + col) % 2) continue; tiles.push([col * 22 + 22, row * 20 + 22]); }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      {tiles.map(([x, y], i) => (
        <motion.path key={i} d={hex(x, y, r)} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1}
          animate={{ fillOpacity: [0.1, 0.45, 0.1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </svg>
  );
}

export function KineticText({ words = ["focus", "flow", "form"], color = A.olive }) {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % words.length), 1600); return () => clearInterval(id); }, [words.length]);
  return (
    <div className="flex items-center justify-center h-full">
      <motion.span key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-display font-semibold tracking-tight" style={{ color }}>{words[i]}</motion.span>
    </div>
  );
}

export function Swatch({ hex, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-12 w-12 rounded-xl" style={{ background: hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }} />
      <span className="text-[8px] uppercase tracking-wider text-foreground/50">{label ?? hex}</span>
    </div>
  );
}