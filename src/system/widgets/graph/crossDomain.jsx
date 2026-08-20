import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";
import { Constellation } from "./shapes";

const accent = A.olive;

function DomainRadar() {
  const axes = 6, R = 48, vals = [0.7, 0.5, 0.8, 0.6, 0.9, 0.4];
  const poly = vals.map((v, i) => { const a = (i / axes) * Math.PI * 2 - Math.PI / 2; return `${(60 + R * v * Math.cos(a)).toFixed(1)} ${(60 + R * v * Math.sin(a)).toFixed(1)}`; }).join(" ");
  return <svg width={120} height={120} viewBox="0 0 120 120">
    {[16, 32, 48].map((r) => <circle key={r} cx={60} cy={60} r={r} fill="none" stroke="hsl(var(--foreground)/0.1)" />)}
    {Array.from({ length: axes }, (_, i) => { const a = (i / axes) * Math.PI * 2 - Math.PI / 2; return <line key={i} x1={60} y1={60} x2={60 + 48 * Math.cos(a)} y2={60 + 48 * Math.sin(a)} stroke="hsl(var(--foreground)/0.1)" />; })}
    <motion.polygon points={poly} fill={accent} fillOpacity={0.18} stroke={accent} strokeWidth={1.6} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: "60px 60px" }} transition={{ duration: 0.8 }} />
  </svg>;
}
function DomainFlow() {
  return <svg width={150} height={70} viewBox="0 0 150 70">
    {[20, 50].map((y, i) => (
      <motion.path key={i} d={`M10 ${y} C60 ${y}, 80 ${y + (i ? -16 : 16)}, 130 ${y + (i ? -8 : 8)}`} fill="none" stroke={i ? A.ridge : accent} strokeWidth={2} strokeDasharray="4 4"
        animate={{ strokeDashoffset: [0, -16] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
    ))}
    <circle cx={10} cy={20} r={5} fill={accent} /><circle cx={10} cy={50} r={5} fill={A.ridge} /><circle cx={130} cy={36} r={6} fill={A.sand} />
  </svg>;
}
function BalanceBeam() {
  const [a, setA] = useState(60);
  useEffect(() => { const id = setInterval(() => setA((v) => (v >= 70 ? 50 : v + 0.5)), 60); return () => clearInterval(id); }, []);
  const ang = (a - 60) / 2;
  return <svg width={120} height={80} viewBox="0 0 120 80">
    <motion.g style={{ transformOrigin: "60px 50px" }} animate={{ rotate: ang }}>
      <line x1={20} y1={50} x2={100} y2={50} stroke={accent} strokeWidth={3} strokeLinecap="round" />
      <rect x={14} y={38} width={12} height={12} rx={2} fill={accent} />
      <rect x={94} y={38} width={12} height={12} rx={2} fill={A.ridge} />
    </motion.g>
    <circle cx={60} cy={50} r={5} fill={A.ink} />
    <line x1={60} y1={50} x2={60} y2={74} stroke={A.muted} strokeWidth={2} />
  </svg>;
}
function Venn() {
  return <svg width={120} height={90} viewBox="0 0 120 90">
    <circle cx={46} cy={45} r={32} fill={accent} fillOpacity={0.22} stroke={accent} />
    <circle cx={74} cy={45} r={32} fill={A.ridge} fillOpacity={0.22} stroke={A.ridge} />
  </svg>;
}
function DomainConstellation() {
  const nodes = [{ x: 30, y: 30, r: 5 }, { x: 90, y: 30, r: 5 }, { x: 60, y: 70, r: 6 }, { x: 20, y: 80, r: 3 }, { x: 100, y: 80, r: 3 }];
  const links = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4]];
  return <Constellation nodes={nodes} links={links} color={accent} size={140} />;
}

const CrossDomainItems = [
  <GraphShell label="Domain Radar" accent={accent}><DomainRadar /></GraphShell>,
  <GraphShell label="Domain Flow" accent={accent} className="sm:col-span-2"><DomainFlow /></GraphShell>,
  <GraphShell label="Balance Beam" accent={accent}><BalanceBeam /></GraphShell>,
  <GraphShell label="Venn" accent={accent}><Venn /></GraphShell>,
  <GraphShell label="Constellation" accent={accent}><DomainConstellation /></GraphShell>,
];
export default CrossDomainItems;