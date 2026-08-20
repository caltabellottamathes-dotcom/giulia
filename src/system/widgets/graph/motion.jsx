import React from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";
import { DotLattice } from "./shapes";

const accent = A.ridge;

function EasingCurve() {
  const p = "M4 56 C 40 56, 40 8, 116 8";
  return <svg width={120} height={64} viewBox="0 0 120 64">
    <line x1={4} y1={56} x2={116} y2={56} stroke="hsl(var(--foreground)/0.1)" />
    <line x1={4} y1={4} x2={4} y2={56} stroke="hsl(var(--foreground)/0.1)" />
    <motion.path d={p} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" initial={{ pathLength: 0, opacity: 0.3 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }} />
  </svg>;
}
function Loop() {
  return <motion.div className="h-12 w-12 rounded-full border-4 border-transparent" style={{ borderTopColor: accent, borderRightColor: accent }} animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} />;
}
function Bounce() {
  return <motion.div className="h-5 w-5 rounded-full" style={{ background: accent }} animate={{ y: [0, -22, 0], scaleY: [1, 0.8, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />;
}
function PathDot() {
  const pts = [];
  for (let t = 0; t <= 1; t += 0.05) { const x = 6 + 108 * t; const y = 40 + (0 - 40) * Math.sin(t * Math.PI); pts.push([x, y]); }
  return <svg width={120} height={50} viewBox="0 0 120 50">
    <path d="M6 40 Q60 0 114 40" fill="none" stroke="hsl(var(--foreground)/0.12)" />
    <motion.circle r={4} fill={accent} animate={{ cx: pts.map((p) => p[0]), cy: pts.map((p) => p[1]) }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
  </svg>;
}

const MotionItems = [
  <GraphShell label="Easing Curve" accent={accent}><EasingCurve /></GraphShell>,
  <GraphShell label="Loop" accent={accent}><Loop /></GraphShell>,
  <GraphShell label="Bounce" accent={accent}><Bounce /></GraphShell>,
  <GraphShell label="Path Dot" accent={accent}><PathDot /></GraphShell>,
  <GraphShell label="Stagger Grid" accent={accent} className="sm:col-span-2"><DotLattice cols={9} rows={5} color={accent} size={170} /></GraphShell>,
];
export default MotionItems;