import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";

const accent = A.sand;

function StatePills() {
  const states = ["draft", "review", "active", "done"];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % states.length), 1400); return () => clearInterval(id); }, []);
  return <div className="flex flex-wrap gap-1.5 justify-center">{states.map((s, k) => (
    <motion.span key={s} className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: k === i ? accent : "hsl(var(--foreground)/0.08)", color: k === i ? "#fff" : "hsl(var(--foreground)/0.6)" }}
      animate={{ scale: k === i ? 1.08 : 1 }}>{s}</motion.span>
  ))}</div>;
}
function TrafficLight() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % 3), 1200); return () => clearInterval(id); }, []);
  const cols = [A.urgent, A.sand, A.olive];
  return <div className="flex flex-col gap-2 items-center">{cols.map((c, k) => (
    <motion.div key={k} className="h-7 w-7 rounded-full" style={{ background: c }} animate={{ opacity: k === i ? 1 : 0.25, scale: k === i ? 1.1 : 1 }} />
  ))}</div>;
}
function StatusGrid() {
  const [grid, setGrid] = useState(() => Array.from({ length: 16 }, () => Math.random() > 0.7));
  useEffect(() => { const id = setInterval(() => setGrid((g) => g.map((v, k) => (k === Math.floor(Math.random() * 16) ? !v : v))), 600); return () => clearInterval(id); }, []);
  return <div className="grid grid-cols-4 gap-1.5">{grid.map((on, k) => (
    <motion.div key={k} className="h-6 rounded-md" animate={{ background: on ? accent : "hsl(var(--foreground)/0.08)" }} transition={{ duration: 0.3 }} />
  ))}</div>;
}
function ProgressLadder() {
  const [n, setN] = useState(2);
  useEffect(() => { const id = setInterval(() => setN((x) => (x >= 5 ? 1 : x + 1)), 900); return () => clearInterval(id); }, []);
  return <div className="flex items-end gap-2">{[1, 2, 3, 4, 5].map((k) => (
    <motion.div key={k} className="w-6 rounded-t-md" style={{ background: accent }} animate={{ height: k <= n ? 20 + k * 8 : 8, opacity: k <= n ? 1 : 0.25 }} transition={{ duration: 0.4 }} />
  ))}</div>;
}
function BadgeMorph() {
  const labels = ["NEW", "LIVE", "HOT", "TOP"];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % labels.length), 1300); return () => clearInterval(id); }, []);
  return <motion.span key={i} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-white" style={{ background: accent }}>{labels[i]}</motion.span>;
}

const StatesItems = [
  <GraphShell label="State Pills" accent={accent}><StatePills /></GraphShell>,
  <GraphShell label="Traffic Light" accent={accent}><TrafficLight /></GraphShell>,
  <GraphShell label="Status Grid" accent={accent}><StatusGrid /></GraphShell>,
  <GraphShell label="Progress Ladder" accent={accent}><ProgressLadder /></GraphShell>,
  <GraphShell label="Badge Morph" accent={accent}><BadgeMorph /></GraphShell>,
];
export default StatesItems;