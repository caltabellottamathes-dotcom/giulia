import React from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";

const accent = A.olive;

function Leaderboard() {
  const rows = [{ n: "F.", v: 92 }, { n: "M.", v: 78 }, { n: "K.", v: 71 }, { n: "S.", v: 64 }];
  return <div className="w-full flex flex-col gap-1.5">{rows.map((r, i) => (
    <div key={i} className="flex items-center gap-2">
      <span className="text-[10px] font-bold w-4 tabular-nums" style={{ color: accent }}>{i + 1}</span>
      <span className="text-[11px] font-medium w-6">{r.n}</span>
      <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: accent }} initial={{ width: 0 }} animate={{ width: `${r.v}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} /></div>
      <span className="text-[10px] tabular-nums w-6 text-right">{r.v}</span>
    </div>
  ))}</div>;
}
function BarList() {
  const data = [60, 40, 80, 55, 72];
  return <div className="w-full flex items-end gap-2 h-20">{data.map((v, i) => (
    <motion.div key={i} className="flex-1 rounded-t-md" style={{ background: accent }} initial={{ height: 0 }} animate={{ height: `${v}%` }} transition={{ duration: 0.7, delay: i * 0.08 }} />
  ))}</div>;
}
function NumberedList() {
  const items = ["Agenda", "Email", "Tasks", "People", "Food"];
  return <div className="w-full flex flex-col gap-1">{items.map((s, i) => (
    <motion.div key={i} className="flex items-center gap-2" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
      <span className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: accent, color: "#fff" }}>{i + 1}</span>
      <span className="text-[11px] font-medium">{s}</span>
    </motion.div>
  ))}</div>;
}
function Comparison() {
  return <div className="w-full flex items-center gap-3">
    <div className="flex-1 flex flex-col gap-1 items-end">{[70, 50, 80].map((v, i) => <div key={i} className="h-2 rounded-l-full" style={{ background: accent, width: `${v}%` }} />)}</div>
    <span className="text-[9px] font-bold text-foreground/40">VS</span>
    <div className="flex-1 flex flex-col gap-1">{[60, 75, 45].map((v, i) => <div key={i} className="h-2 rounded-r-full" style={{ background: A.ridge, width: `${v}%` }} />)}</div>
  </div>;
}
function ProgressList() {
  const items = [{ l: "Read", v: 80 }, { l: "Write", v: 55 }, { l: "Review", v: 30 }];
  return <div className="w-full flex flex-col gap-2">{items.map((it, i) => (
    <div key={i}><div className="flex justify-between text-[9px] uppercase tracking-wider text-foreground/50 mb-0.5"><span>{it.l}</span><span>{it.v}%</span></div>
      <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: accent }} initial={{ width: 0 }} animate={{ width: `${it.v}%` }} transition={{ duration: 0.8 }} /></div></div>
  ))}</div>;
}

const ListsItems = [
  <GraphShell label="Leaderboard" accent={accent}><Leaderboard /></GraphShell>,
  <GraphShell label="Bar List" accent={accent}><BarList /></GraphShell>,
  <GraphShell label="Numbered" accent={accent}><NumberedList /></GraphShell>,
  <GraphShell label="Comparison" accent={accent}><Comparison /></GraphShell>,
  <GraphShell label="Progress List" accent={accent}><ProgressList /></GraphShell>,
];
export default ListsItems;